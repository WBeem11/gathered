import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json([]);

  const saved = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        include: {
          author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
          comments: {
            include: { author: { select: { id: true, name: true, profilePhoto: true } } },
            orderBy: { createdAt: "asc" },
          },
          reactions: true,
          _count: { select: { comments: true, reactions: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    saved.map(({ post }) => {
      const { neighborhood, ...rest } = post.author;
      return { ...post, author: { ...rest, location: neighborhood } };
    })
  );
}
