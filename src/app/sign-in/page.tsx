"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <svg viewBox="0 0 36 36" fill="none" className="w-10 h-10">
              <circle cx="13" cy="18" r="10" stroke="#1B2B4B" strokeWidth="1.5" />
              <circle cx="23" cy="18" r="10" stroke="#1B2B4B" strokeWidth="1.5" />
              <line x1="18" y1="11" x2="18" y2="25" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="17" x2="24" y2="17" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h1 className="font-playfair text-3xl font-bold text-navy">Gathered</h1>
          </div>
          <p className="text-navy/60 text-sm">Your Christian Community, Close to Home</p>
        </div>

        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="pb-2">
            <h2 className="font-playfair text-2xl font-semibold text-navy text-center">
              Welcome back
            </h2>
            <p className="text-center text-sm text-muted-foreground">
              Sign in to your Gathered account
            </p>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-navy/20 rounded-lg py-2.5 px-4 text-navy font-medium hover:bg-cream transition-colors disabled:opacity-60"
            >
              <GoogleIcon />
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-navy/10" />
              </div>
              <div className="relative flex justify-center text-xs text-navy/40 uppercase tracking-wider">
                <span className="bg-white px-3">or sign in with email</span>
              </div>
            </div>

            {/* Email/Password form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-navy/20 focus-visible:ring-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-navy/20 focus-visible:ring-gold"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-navy hover:bg-navy-light text-cream font-semibold py-2.5"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-gold font-semibold hover:underline">
                  Join Gathered
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-navy/40 mt-6">
          &ldquo;For where two or three gather in my name, there am I with them.&rdquo; — Matthew 18:20
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
