import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const neighborhood = searchParams.get("neighborhood");

  const jobs = await prisma.job.findMany({
    where: {
      isOpen: true,
      ...(type && type !== "all" ? { type } : {}),
      ...(neighborhood ? { neighborhood } : {}),
    },
    include: {
      poster: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { type, description, payRate, frequency, contactMethod, neighborhood, familyName } = await req.json();

  if (!type || !description || !contactMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      posterId: session.user.id,
      type, description, payRate, frequency,
      contactMethod, neighborhood, familyName,
    },
    include: {
      poster: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
    },
  });

  return NextResponse.json(job, { status: 201 });
}
