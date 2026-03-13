import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const businesses = await prisma.business.findMany({
    where: {
      ...(category && category !== "all" ? { category } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    include: {
      owner: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(businesses);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, ownerName, category, description, christianStatement, website, phone, address, neighborhood } = await req.json();

  if (!name || !category || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const business = await prisma.business.create({
    data: {
      ownerId: session.user.id,
      name, ownerName, category, description, christianStatement,
      website, phone, address, neighborhood,
    },
    include: {
      owner: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(business, { status: 201 });
}
