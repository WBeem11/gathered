"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  Heart,
  Church,
  Users,
  CalendarDays,
  Store,
  LogIn,
  LogOut,
  User,
  Edit3,
  Sun,
  Moon,
  Briefcase,
  UserPlus,
  ChevronUp,
  Copy,
  Check,
  Settings,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const navLinks = [
  { href: "/", label: "Feed", icon: Home, badgeKey: "feed" },
  { href: "/prayer", label: "Prayer", icon: Heart, badgeKey: "prayer" },
  { href: "/find-a-church", label: "Churches", icon: Church, badgeKey: null },
  { href: "/groups", label: "Groups", icon: Users, badgeKey: null },
  { href: "/recommendations", label: "Businesses", icon: Store, badgeKey: null },
  { href: "/events", label: "Events", icon: CalendarDays, badgeKey: null },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [badges, setBadges] = useState<{ feed: boolean; prayer: boolean }>({ feed: false, prayer: false });

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Close profile menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Mark current page as seen and clear its badge
  useEffect(() => {
    const now = new Date().toISOString();
    if (pathname === "/") {
      localStorage.setItem("gathered_feed_last_seen", now);
      setBadges((b) => ({ ...b, feed: false }));
    } else if (pathname === "/prayer") {
      localStorage.setItem("gathered_prayer_last_seen", now);
      setBadges((b) => ({ ...b, prayer: false }));
    }
  }, [pathname]);

  // Poll for new posts every 60 seconds
  useEffect(() => {
    async function checkNew() {
      const feedSince = localStorage.getItem("gathered_feed_last_seen") ?? new Date(0).toISOString();
      const res = await fetch(`/api/posts/new-count?since=${encodeURIComponent(feedSince)}`);
      if (!res.ok) return;
      const { feedCount, prayerCount } = await res.json();
      setBadges({
        feed: feedCount > 0 && pathname !== "/",
        prayer: prayerCount > 0 && pathname !== "/prayer",
      });
    }
    checkNew();
    const interval = setInterval(checkNew, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInviteClick() {
    if (!session) {
      router.push("/sign-in");
      return;
    }
    const res = await fetch("/api/invite");
    if (res.ok) {
      const data = await res.json();
      setInviteLink(data.inviteUrl);
    }
    setInviteModalOpen(true);
  }

  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteLink);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }

  function handlePostClick() {
    router.push("/");
    setTimeout(() => {
      const el = document.getElementById("new-post-textarea");
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-[#1e1e1e] border-r border-gray-100 dark:border-gray-800 flex-col z-40 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2.5">
            <GatheredLogo />
            <span className="font-playfair text-xl font-bold text-navy dark:text-white tracking-wide">Gathered</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon, badgeKey }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            const hasBadge = badgeKey ? badges[badgeKey as keyof typeof badges] : false;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-navy/10 dark:bg-white/10 text-navy dark:text-white font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span className="relative flex-shrink-0">
                  <Icon className={`w-5 h-5 ${isActive ? "text-navy dark:text-white" : "text-gray-500 dark:text-gray-400"}`} />
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Post button */}
        <div className="px-4 pb-3">
          <button
            onClick={handlePostClick}
            className="flex items-center justify-center gap-2 w-full bg-navy dark:bg-white text-cream dark:text-[#262626] py-2.5 rounded-lg text-sm font-semibold hover:bg-navy-light dark:hover:bg-gray-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Post
          </button>
        </div>

        {/* Invite neighbors */}
        <div className="px-4 pb-3">
          <button
            onClick={handleInviteClick}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-navy/70 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-dashed border-navy/20 dark:border-gray-600"
          >
            <UserPlus className="w-4 h-4" />
            Invite Neighbors
          </button>
        </div>

        {/* User section */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 relative" ref={profileMenuRef}>
          {session ? (
            <>
              {/* Profile dropdown */}
              {profileMenuOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50">
                  <Link
                    href="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-navy dark:text-gray-400" />
                    Settings
                  </Link>
                  <Link
                    href="/directory"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-navy dark:text-gray-400" />
                    Add a Business Page
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {theme === "dark"
                      ? <Sun className="w-4 h-4 text-sage" />
                      : <Moon className="w-4 h-4 text-sage" />
                    }
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setProfileMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}

              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 w-full hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg px-1 py-1 transition-colors"
              >
                <Avatar className="w-9 h-9 border-2 border-sage/60 flex-shrink-0">
                  <AvatarImage src={session.user?.image ?? ""} />
                  <AvatarFallback className="bg-navy text-cream text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Settings &amp; profile</p>
                </div>
                <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${profileMenuOpen ? "rotate-0" : "rotate-180"}`} />
              </button>
            </>
          ) : (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 text-sm font-medium text-navy dark:text-white hover:text-navy-light transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Invite modal */}
      {inviteModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
          onClick={() => setInviteModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-playfair text-lg font-bold text-navy dark:text-white mb-2">Invite Neighbors</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Share your unique link. When neighbors join using it, you&apos;ll be connected in the community.
            </p>
            {inviteLink ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 dark:bg-[#262626] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 truncate">
                  {inviteLink}
                </div>
                <button
                  onClick={copyInviteLink}
                  className="flex items-center gap-1.5 px-3 py-2 bg-navy dark:bg-white text-cream dark:text-[#262626] rounded-lg text-sm font-semibold hover:bg-navy-light dark:hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  {inviteCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {inviteCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sign in to get your invite link.</p>
            )}
            <button
              onClick={() => setInviteModalOpen(false)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-700 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navLinks.slice(0, 5).map(({ href, label, icon: Icon, badgeKey }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            const hasBadge = badgeKey ? badges[badgeKey as keyof typeof badges] : false;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                  isActive ? "text-navy dark:text-white" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" />
                  {hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </span>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          {session ? (
            <Link
              href={`/profile/${session.user?.id}`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg ${
                pathname.startsWith("/profile") ? "text-navy dark:text-white" : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          ) : (
            <Link href="/sign-in" className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-gray-400">
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="Gathered"
      className="w-8 h-8 flex-shrink-0 object-contain invert opacity-60 dark:invert-0 dark:opacity-100"
    />
  );
}
