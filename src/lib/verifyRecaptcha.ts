export async function verifyRecaptcha(token: string, action: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY not set — skipping verification");
    return true;
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = await res.json();

  if (!data.success || data.action !== action || data.score < 0.5) {
    console.warn(`reCAPTCHA failed — action: ${data.action}, score: ${data.score}, success: ${data.success}`);
    return false;
  }

  return true;
}
