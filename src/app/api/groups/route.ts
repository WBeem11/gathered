import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const groups = await prisma.group.findMany({
    include: {
      leader: { select: { id: true, name: true, profilePhoto: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, type, meetingFrequency, location, isVirtual } = await req.json();

  if (!name || !description || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name, description, type,
      meetingFrequency, location,
      isVirtual: isVirtual ?? false,
      leaderId: session.user.id,
      members: {
        create: { userId: session.user.id },
      },
    },
    include: {
      leader: { select: { id: true, name: true, profilePhoto: true } },
      _count: { select: { members: true } },
    },
  });

  return NextResponse.json(group, { status: 201 });
}
