import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Lazy init — must be inside handler so env vars are available at runtime
  const resend = new Resend(process.env.RESEND_API_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { email, firstName } = await request.json();

  // 1. Save to Supabase
  const { error } = await supabase
    .from('waitlist')
    .insert({ email, first_name: firstName });

  if (error) {
    return Response.json({ error: 'Already signed up' }, { status: 400 });
  }

  // 2. Send welcome email via Resend
  await resend.emails.send({
    from: 'Gathered <hello@trygathered.com>',
    to: email,
    subject: "You're on the Gathered waitlist 🌿",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a18;">
        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">Hey ${firstName || 'friend'}!</p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 20px; color: #444;">
          Gathered is a Christian Community platform for Minneapolis. Prayer requests, church finder, Christian Business Directory, groups, events. Built for believers who know that community doesn't end when Sunday service does.
        </p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 20px; color: #444;">
          We're in the final stretch of building and you'll be among the first to get access when we launch.
        </p>
        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 20px; color: #444;">
          In the meantime, follow us on instagram <a href="https://instagram.com/gathered_community" style="color: #2D5A27;">@gathered_community</a> for updates, behind the scenes, and more.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #444;">See you soon.</p>
        <p style="font-size: 15px; color: #2D5A27; font-weight: 500; margin-top: 24px;">
          Wyatt and Abby<br>
          <span style="font-weight: 400; color: #666;">Founders of Gathered</span>
        </p>
        <hr style="border: none; border-top: 1px solid #e0d9ce; margin: 32px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          <a href="https://trygathered.com" style="color: #2D5A27;">trygathered.com</a>
        </p>
      </div>
    `
  });

  // 3. Notify yourself of new signup
  await resend.emails.send({
    from: 'Gathered <hello@trygathered.com>',
    to: 'wyattbeemer@gmail.com',
    subject: `New waitlist signup: ${email}`,
    html: `<p><strong>${firstName || 'Someone'}</strong> (${email}) just joined the Gathered waitlist.</p>`
  });

  return Response.json({ success: true });
}
