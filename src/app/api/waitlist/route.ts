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

        <h1 style="font-size: 28px; color: #2D6A4F; margin-bottom: 8px;">You're in.</h1>

        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 20px;">
          Hi ${firstName || 'friend'} — welcome to Gathered.
        </p>

        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 20px; color: #444;">
          We're building the Christian community platform for Minneapolis —
          prayer requests, church finder, Christian business directory,
          neighborhood groups, and more.
        </p>

        <p style="font-size: 15px; line-height: 1.7; margin-bottom: 20px; color: #444;">
          You'll be among the first to get access when we launch.
          We'll keep you posted on our progress.
        </p>

        <div style="background: #d8f3dc; border-radius: 12px; padding: 20px 24px; margin: 28px 0;">
          <p style="margin: 0; font-size: 14px; color: #1b4332; font-weight: 500;">
            In the meantime — follow us on Instagram for updates,
            behind the scenes, and the best Christian content in Minneapolis.
          </p>
          <a href="https://instagram.com/gatheredmpls"
             style="display: inline-block; margin-top: 12px; background: #2D6A4F; color: #d8f3dc;
                    padding: 10px 20px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 500;">
            Follow @gatheredmpls
          </a>
        </div>

        <p style="font-size: 15px; line-height: 1.7; color: #444;">
          See you soon. 🌿
        </p>

        <p style="font-size: 15px; color: #2D6A4F; font-weight: 500;">
          — [Your name] + [Wife's name]<br>
          <span style="font-weight: 400; color: #666;">Founders, Gathered</span>
        </p>

        <hr style="border: none; border-top: 1px solid #e0d9ce; margin: 32px 0;" />

        <p style="font-size: 12px; color: #999; text-align: center;">
          Gathered · Minneapolis, MN ·
          <a href="https://trygathered.com" style="color: #2D6A4F;">trygathered.com</a>
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
