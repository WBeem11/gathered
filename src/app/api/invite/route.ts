import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { inviteCode: true },
  });

  let inviteCode = user?.inviteCode;

  if (!inviteCode) {
    inviteCode = randomBytes(6).toString("hex");
    await prisma.user.update({
      where: { id: session.user.id },
      data: { inviteCode },
    });
  }

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return NextResponse.json({ inviteUrl: `${base}/join/${inviteCode}` });
}
