import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.churchAttendee.findUnique({
    where: { churchId_userId: { churchId: params.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.churchAttendee.delete({ where: { id: existing.id } });
    return NextResponse.json({ attending: false });
  }

  await prisma.churchAttendee.create({
    data: { churchId: params.id, userId: session.user.id },
  });

  return NextResponse.json({ attending: true });
}
