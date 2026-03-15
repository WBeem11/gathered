import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function JoinPage({ params }: { params: { code: string } }) {
  const inviter = await prisma.user.findUnique({
    where: { inviteCode: params.code },
    select: { name: true, neighborhood: true },
  });

  if (!inviter) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
            <circle cx="13" cy="18" r="10" stroke="#C9A84C" strokeWidth="1.5" fillOpacity="0" />
            <circle cx="23" cy="18" r="10" stroke="#C9A84C" strokeWidth="1.5" fillOpacity="0" />
            <line x1="18" y1="11" x2="18" y2="25" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="17" x2="24" y2="17" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="font-playfair text-2xl font-bold text-navy mb-2">You&apos;re Invited!</h1>
        <p className="text-navy/70 mb-1">
          <span className="font-semibold text-navy">{inviter.name ?? "A neighbor"}</span>
          {inviter.neighborhood ? ` from ${inviter.neighborhood}` : ""} invited you to join
        </p>
        <p className="font-playfair text-lg font-bold text-navy mb-6">Gathered</p>
        <p className="text-sm text-navy/50 mb-6">
          The Christian community platform for the Twin Cities Metro. Connect with neighbors, share prayer requests, and find local churches.
        </p>
        <Link
          href={`/sign-up?ref=${params.code}`}
          className="block w-full bg-navy text-cream py-3 rounded-xl font-semibold hover:bg-navy-light transition-colors"
        >
          Join the Community
        </Link>
        <Link href="/sign-in" className="block mt-3 text-sm text-navy/50 hover:text-navy transition-colors">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
