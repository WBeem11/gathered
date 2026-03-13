import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "recent";

  const prayers = await prisma.prayerRequest.findMany({
    include: {
      author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
      supports: true,
      _count: { select: { supports: true } },
    },
    orderBy: sort === "most_prayed"
      ? { prayerCount: "desc" }
      : { createdAt: "desc" },
  });

  return NextResponse.json(prayers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, isAnonymous } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Prayer request cannot be empty" }, { status: 400 });
  }

  const prayer = await prisma.prayerRequest.create({
    data: {
      authorId: session.user.id,
      content,
      isAnonymous: isAnonymous ?? false,
    },
    include: {
      author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
      supports: true,
      _count: { select: { supports: true } },
    },
  });

  return NextResponse.json(prayer, { status: 201 });
}
