"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Heart,
  HeartHandshake,
  ThumbsUp,
  Church,
  Users,
  LogIn,
  LogOut,
  User,
  Edit3,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/prayer", label: "Prayer", icon: Heart },
  { href: "/help", label: "Help", icon: HeartHandshake },
  { href: "/recommendations", label: "Recs", icon: ThumbsUp },
  { href: "/find-a-church", label: "Churches", icon: Church },
  { href: "/groups", label: "Groups", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex-col z-40 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <GatheredLogo />
            <span className="font-playfair text-xl font-bold text-navy tracking-wide">Gathered</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-navy/10 text-navy font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-navy" : "text-gray-500"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Post button */}
        <div className="px-4 pb-4">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-navy text-cream py-2.5 rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Post
          </Link>
        </div>

        {/* User section */}
        <div className="px-4 py-4 border-t border-gray-100">
          {session ? (
            <div className="flex items-center gap-3">
              <Link href={`/profile/${session.user?.id}`}>
                <Avatar className="w-9 h-9 border-2 border-gold/40 flex-shrink-0">
                  <AvatarImage src={session.user?.image ?? ""} />
                  <AvatarFallback className="bg-navy text-cream text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400">View profile</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-sm font-medium text-navy hover:text-navy-light transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navLinks.slice(0, 5).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                  isActive ? "text-navy" : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {session ? (
            <Link
              href={`/profile/${session.user?.id}`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                pathname.startsWith("/profile") ? "text-navy" : "text-gray-400"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-gray-400"
            >
              <LogIn className="w-5 h-5" />
              <span className="text-[10px] font-medium">Sign In</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}

function GatheredLogo() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 flex-shrink-0">
      <circle cx="13" cy="18" r="10" stroke="#C9A84C" strokeWidth="1.5" fillOpacity="0" />
      <circle cx="23" cy="18" r="10" stroke="#C9A84C" strokeWidth="1.5" fillOpacity="0" />
      <line x1="18" y1="11" x2="18" y2="25" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="24" y2="17" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
