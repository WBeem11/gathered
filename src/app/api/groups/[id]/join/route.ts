import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: params.id, userId: session.user.id } },
  });

  if (existing) {
    const group = await prisma.group.findUnique({ where: { id: params.id } });
    if (group?.leaderId === session.user.id) {
      return NextResponse.json({ error: "Leader cannot leave" }, { status: 400 });
    }
    await prisma.groupMember.delete({ where: { id: existing.id } });
    return NextResponse.json({ joined: false });
  }

  await prisma.groupMember.create({
    data: { groupId: params.id, userId: session.user.id },
  });

  return NextResponse.json({ joined: true });
}
