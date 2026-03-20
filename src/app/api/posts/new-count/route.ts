import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  if (!since) return NextResponse.json({ feedCount: 0, prayerCount: 0 });

  const sinceDate = new Date(since);
  if (isNaN(sinceDate.getTime())) return NextResponse.json({ feedCount: 0, prayerCount: 0 });

  const [feedCount, prayerCount] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gt: sinceDate } } }),
    prisma.post.count({ where: { createdAt: { gt: sinceDate }, category: "prayer" } }),
  ]);

  return NextResponse.json({ feedCount, prayerCount });
}
