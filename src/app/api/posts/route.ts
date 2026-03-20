import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRecaptcha } from "@/lib/verifyRecaptcha";

function normalizePost(post: {
  author: { id: string; name: string | null; neighborhood: string | null; profilePhoto: string | null };
  [key: string]: unknown;
}) {
  const { neighborhood, ...rest } = post.author;
  return { ...post, author: { ...rest, location: neighborhood } };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const feed = searchParams.get("feed") ?? "recent"; // recent | nearby | trending | foryou

  const include = {
    author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
    comments: {
      include: { author: { select: { id: true, name: true, profilePhoto: true } } },
      orderBy: { createdAt: "asc" as const },
    },
    reactions: true,
    _count: { select: { comments: true, reactions: true } },
  };

  const categoryWhere = category && category !== "all" ? { category } : {};

  // For nearby/foryou we need the user's neighborhood
  let userNeighborhood: string | null = null;
  if (feed === "nearby" || feed === "foryou") {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const u = await prisma.user.findUnique({ where: { id: session.user.id }, select: { neighborhood: true } });
      userNeighborhood = u?.neighborhood ?? null;
    }
  }

  let posts;

  if (feed === "trending") {
    // Sort by reactions + comments count in last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    posts = await prisma.post.findMany({
      where: { ...categoryWhere, createdAt: { gte: since } },
      include,
      orderBy: [{ reactions: { _count: "desc" } }, { comments: { _count: "desc" } }, { createdAt: "desc" }],
      take: 50,
    });

  } else if (feed === "nearby" && userNeighborhood) {
    // Posts from authors in the same neighborhood
    posts = await prisma.post.findMany({
      where: { ...categoryWhere, author: { neighborhood: userNeighborhood } },
      include,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

  } else if (feed === "foryou" && userNeighborhood) {
    // Nearby posts + boosted by engagement
    posts = await prisma.post.findMany({
      where: { ...categoryWhere, author: { neighborhood: userNeighborhood } },
      include,
      orderBy: [{ reactions: { _count: "desc" } }, { comments: { _count: "desc" } }, { createdAt: "desc" }],
      take: 50,
    });

  } else {
    // Default: recent
    posts = await prisma.post.findMany({
      where: categoryWhere,
      include,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  return NextResponse.json(posts.map(normalizePost));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, category, location, isAnonymous, imageUrl, recaptchaToken } = await req.json();

  if (recaptchaToken) {
    const ok = await verifyRecaptcha(recaptchaToken, "create_prayer");
    if (!ok) return NextResponse.json({ error: "Request failed security check" }, { status: 400 });
  }

  if (!content?.trim() && !imageUrl) {
    return NextResponse.json({ error: "Post must have text or an image" }, { status: 400 });
  }

  if (!category) {
    return NextResponse.json({ error: "Missing category" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      content: content?.trim() || "",
      category,
      location: location || session.user.neighborhood || null,
      isAnonymous: isAnonymous ?? false,
      imageUrl: imageUrl || null,
    },
    include: {
      author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
      comments: true,
      reactions: true,
      _count: { select: { comments: true, reactions: true } },
    },
  });

  return NextResponse.json(normalizePost(post), { status: 201 });
}
