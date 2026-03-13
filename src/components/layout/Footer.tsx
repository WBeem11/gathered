import Link from "next/link";

export default function Footer() {
  return (
    <footer className="hidden md:block bg-navy text-cream/70 py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 36 36" fill="none" className="w-6 h-6">
              <circle cx="13" cy="18" r="10" stroke="#C9A84C" strokeWidth="1.5" />
              <circle cx="23" cy="18" r="10" stroke="#C9A84C" strokeWidth="1.5" />
              <line x1="18" y1="11" x2="18" y2="25" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="17" x2="24" y2="17" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-playfair text-cream font-semibold">Gathered</span>
          </div>
          <p className="text-sm text-center italic text-cream/50">
            &ldquo;Your Christian Community, Close to Home&rdquo; — Minneapolis/Twin Cities Metro
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/find-a-church" className="hover:text-gold transition-colors">Find a Church</Link>
            <Link href="/prayer" className="hover:text-gold transition-colors">Prayer</Link>
            <Link href="/groups" className="hover:text-gold transition-colors">Groups</Link>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-cream/30">
          © {new Date().getFullYear()} Gathered. Serving the Twin Cities Christian community with love.
        </div>
      </div>
    </footer>
  );
}
