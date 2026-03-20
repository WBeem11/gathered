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
  const location = searchParams.get("location");

  const posts = await prisma.post.findMany({
    where: {
      ...(category && category !== "all" ? { category } : {}),
      ...(location ? { location } : {}),
    },
    include: {
      author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, profilePhoto: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      reactions: true,
      _count: { select: { comments: true, reactions: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

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
