import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const resources = await prisma.resource.findMany({
    where: {
      isAvailable: true,
      ...(category && category !== "all" ? { category } : {}),
    },
    include: {
      poster: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(resources);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, condition, category, isFree, contactInfo, neighborhood } = await req.json();

  if (!name || !description || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const resource = await prisma.resource.create({
    data: {
      posterId: session.user.id,
      name, description, condition, category,
      isFree: isFree ?? true,
      contactInfo, neighborhood,
    },
    include: {
      poster: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
    },
  });

  return NextResponse.json(resource, { status: 201 });
}
