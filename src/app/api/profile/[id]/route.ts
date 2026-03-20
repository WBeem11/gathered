import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const [user, prayerCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        neighborhood: true,
        profilePhoto: true,
        createdAt: true,
        _count: {
          select: {
            posts: { where: { isAnonymous: false } },
            reactions: true,
          },
        },
      },
    }),
    prisma.post.count({
      where: { userId: params.id, category: "prayer", isAnonymous: false },
    }),
  ]);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ ...user, prayerCount });
}
