import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Initialize handler lazily at request time (not module load time)
// to prevent Vercel build-phase failures
export function GET(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  return NextAuth(req as Parameters<typeof NextAuth>[0], ctx as Parameters<typeof NextAuth>[1], authOptions);
}

export function POST(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  return NextAuth(req as Parameters<typeof NextAuth>[0], ctx as Parameters<typeof NextAuth>[1], authOptions);
}
