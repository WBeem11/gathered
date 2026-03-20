import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reason } = await req.json();

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: { select: { name: true, email: true } } },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Gathered <hello@trygathered.com>",
    to: "wyattbeemer@soteria-media.com",
    subject: `⚠️ Post reported on Gathered`,
    html: `
      <p><strong>A post was reported.</strong></p>
      <p><strong>Post ID:</strong> ${post.id}</p>
      <p><strong>Author:</strong> ${post.author?.name ?? "Anonymous"} (${post.author?.email ?? "unknown"})</p>
      <p><strong>Content:</strong> ${post.content || "(no text)"}</p>
      ${post.imageUrl ? `<p><strong>Image:</strong> <a href="${post.imageUrl}">${post.imageUrl}</a></p>` : ""}
      <p><strong>Reason:</strong> ${reason ?? "No reason given"}</p>
      <p><strong>Reported by:</strong> ${session.user.name ?? "Unknown"} (${session.user.email})</p>
    `,
  });

  return NextResponse.json({ success: true });
}
