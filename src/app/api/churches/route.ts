import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const denomination = searchParams.get("denomination");
  const serviceStyle = searchParams.get("serviceStyle");

  const churches = await prisma.church.findMany({
    where: {
      ...(denomination && denomination !== "all" ? { denomination } : {}),
      ...(serviceStyle && serviceStyle !== "all" ? { serviceStyle } : {}),
    },
    include: {
      attendees: {
        include: {
          user: { select: { id: true, name: true, profilePhoto: true } },
        },
      },
      _count: { select: { attendees: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(churches);
}
