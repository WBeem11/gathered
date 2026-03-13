import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: false,
      neighborhood: true,
      profilePhoto: true,
      bio: true,
      createdAt: true,
      church: { select: { id: true, name: true } },
      posts: {
        where: { isAnonymous: false },
        include: {
          author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
          comments: {
            include: { author: { select: { id: true, name: true, profilePhoto: true } } },
          },
          reactions: true,
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}
