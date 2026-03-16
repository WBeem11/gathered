import { Resend } from 'resend';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // Verify the request is from Supabase using a shared secret
  const secret = request.headers.get('x-webhook-secret');
  if (secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();

  // Only act on INSERT events
  if (payload.type !== 'INSERT') {
    return Response.json({ skipped: true });
  }

  const { email, first_name, name, full_name } = payload.record;
  const firstName = first_name || name || full_name || '';

  if (!email) {
    return Response.json({ error: 'No email in payload' }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Send welcome email
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

  // Notify yourself
  await resend.emails.send({
    from: 'Gathered <hello@trygathered.com>',
    to: 'wyattbeemer@soteria-media.com',
    subject: `New waitlist signup: ${email}`,
    html: `<p><strong>${firstName || 'Someone'}</strong> (${email}) just joined the Gathered waitlist.</p>`
  });

  return Response.json({ success: true });
}
