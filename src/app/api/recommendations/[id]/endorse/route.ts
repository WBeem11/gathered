import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.endorsement.findUnique({
    where: { recommendationId_userId: { recommendationId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.endorsement.delete({ where: { id: existing.id } });
    return NextResponse.json({ endorsed: false });
  }

  await prisma.endorsement.create({
    data: { recommendationId: params.id, userId: session.user.id },
  });

  return NextResponse.json({ endorsed: true });
}
