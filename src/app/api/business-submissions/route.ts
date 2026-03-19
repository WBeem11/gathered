import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { verifyRecaptcha } from "@/lib/verifyRecaptcha";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { businessName, category, description, whyRecommend, website, phone, neighborhood, recaptchaToken } = body;

  if (recaptchaToken) {
    const ok = await verifyRecaptcha(recaptchaToken, "create_business");
    if (!ok) return NextResponse.json({ error: "Submission failed security check" }, { status: 400 });
  }

  if (!businessName || !category || !description || !whyRecommend) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const submission = await prisma.businessSubmission.create({
    data: {
      businessName,
      category,
      description,
      whyRecommend,
      website: website || null,
      phone: phone || null,
      neighborhood: neighborhood || null,
      submittedByName: session?.user?.name || null,
      submittedByEmail: session?.user?.email || null,
    },
  });

  // Notify Wyatt
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Gathered <hello@trygathered.com>",
    to: "wyattbeemer@soteria-media.com",
    subject: `New business submission: ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a18;">
        <h2 style="color: #2D5A27;">New Business Submission</h2>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Neighborhood:</strong> ${neighborhood || "—"}</p>
        <p><strong>Website:</strong> ${website || "—"}</p>
        <p><strong>Phone:</strong> ${phone || "—"}</p>
        <p><strong>Description:</strong><br/>${description}</p>
        <p><strong>Why recommend:</strong><br/>${whyRecommend}</p>
        <hr/>
        <p><strong>Submitted by:</strong> ${session?.user?.name || "Anonymous"} (${session?.user?.email || "not signed in"})</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true, id: submission.id });
}
