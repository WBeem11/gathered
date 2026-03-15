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
      take: 4,
      select: { id: true, name: true, neighborhood: true, denomination: true },
    }),
    prisma.recommendation.findMany({
      where: { businessName: { contains: q, mode: "insensitive" } },
      take: 4,
      select: { id: true, businessName: true, category: true, neighborhood: true },
    }),
    prisma.group.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 4,
      select: { id: true, name: true, type: true, location: true },
    }),
    prisma.job.findMany({
      where: { type: { contains: q, mode: "insensitive" } },
      take: 4,
      select: { id: true, type: true, familyName: true, neighborhood: true },
    }),
  ]);

  const results = [
    ...churches.map((c) => ({
      title: c.name,
      subtitle: [c.denomination, c.neighborhood].filter(Boolean).join(" · "),
      type: "Church",
      href: `/find-a-church`,
    })),
    ...recs.map((r) => ({
      title: r.businessName,
      subtitle: [r.category, r.neighborhood].filter(Boolean).join(" · "),
      type: "Rec",
      href: `/recommendations`,
    })),
    ...groups.map((g) => ({
      title: g.name,
      subtitle: [g.type, g.location].filter(Boolean).join(" · "),
      type: "Group",
      href: `/groups/${g.id}`,
    })),
    ...jobs.map((j) => ({
      title: j.type,
      subtitle: [j.familyName, j.neighborhood].filter(Boolean).join(" · "),
      type: "Job",
      href: `/jobs`,
    })),
  ];

  return NextResponse.json(results);
}
