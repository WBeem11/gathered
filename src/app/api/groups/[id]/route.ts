import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      leader: { select: { id: true, name: true, profilePhoto: true, neighborhood: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, profilePhoto: true, neighborhood: true } },
        },
      },
      _count: { select: { members: true } },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
}
