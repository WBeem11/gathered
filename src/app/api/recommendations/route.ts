import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const recs = await prisma.recommendation.findMany({
    where: category && category !== "all" ? { category } : {},
    include: {
      author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
      endorsements: true,
      _count: { select: { endorsements: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { businessName, category, description, whyRecommend, contactInfo, website, phone, neighborhood } = await req.json();

  if (!businessName || !category || !description || !whyRecommend) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rec = await prisma.recommendation.create({
    data: {
      authorId: session.user.id,
      businessName, category, description, whyRecommend,
      contactInfo, website, phone, neighborhood,
    },
    include: {
      author: { select: { id: true, name: true, neighborhood: true, profilePhoto: true } },
      endorsements: true,
      _count: { select: { endorsements: true } },
    },
  });

  return NextResponse.json(rec, { status: 201 });
}
