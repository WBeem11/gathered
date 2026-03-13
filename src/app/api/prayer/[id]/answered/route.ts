import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prayer = await prisma.prayerRequest.findUnique({ where: { id: params.id } });
  if (!prayer || prayer.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.prayerRequest.update({
    where: { id: params.id },
    data: { isAnswered: !prayer.isAnswered },
  });

  return NextResponse.json({ isAnswered: updated.isAnswered });
}
