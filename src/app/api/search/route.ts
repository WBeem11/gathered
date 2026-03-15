import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const [churches, recs, groups, jobs] = await Promise.all([
    prisma.church.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { id: true, name: true },
    }),
    prisma.recommendation.findMany({
      where: { businessName: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { id: true, businessName: true },
    }),
    prisma.group.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { id: true, name: true },
    }),
    prisma.job.findMany({
      where: { type: { contains: q, mode: "insensitive" } },
      take: 3,
      select: { id: true, type: true, familyName: true },
    }),
  ]);

  const results = [
    ...churches.map((c) => ({ title: c.name, type: "Church", href: `/find-a-church` })),
    ...recs.map((r) => ({ title: r.businessName, type: "Rec", href: `/recommendations` })),
    ...groups.map((g) => ({ title: g.name, type: "Group", href: `/groups/${g.id}` })),
    ...jobs.map((j) => ({ title: j.familyName ? `${j.type} · ${j.familyName}` : j.type, type: "Job", href: `/jobs` })),
  ];

  return NextResponse.json(results);
}
