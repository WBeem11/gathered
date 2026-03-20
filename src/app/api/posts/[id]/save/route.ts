import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: params.id } },
  });

  if (existing) {
    await prisma.savedPost.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedPost.create({
      data: { userId: session.user.id, postId: params.id },
    });
    return NextResponse.json({ saved: true });
  }
}
