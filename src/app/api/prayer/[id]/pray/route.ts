import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.prayerSupport.findUnique({
    where: { prayerRequestId_userId: { prayerRequestId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.prayerSupport.delete({ where: { id: existing.id } });
    await prisma.prayerRequest.update({
      where: { id: params.id },
      data: { prayerCount: { decrement: 1 } },
    });
    return NextResponse.json({ praying: false });
  }

  await prisma.prayerSupport.create({
    data: { prayerRequestId: params.id, userId: session.user.id },
  });
  await prisma.prayerRequest.update({
    where: { id: params.id },
    data: { prayerCount: { increment: 1 } },
  });

  return NextResponse.json({ praying: true });
}
