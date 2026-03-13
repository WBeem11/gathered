"use client";

import Link from "next/link";
import { MapPin, Church, Users, BookOpen } from "lucide-react";

export default function RightSidebar() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0">
      {/* Community card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-navy" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Community</span>
        </div>
        <h3 className="font-playfair text-lg font-bold text-navy mt-1">Twin Cities Metro</h3>
        <p className="text-sm text-gray-500 mt-1">Minneapolis · St. Paul · Surrounding suburbs</p>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Explore</h4>
        <div className="space-y-2">
          <Link href="/find-a-church" className="flex items-center gap-3 text-sm text-gray-700 hover:text-navy transition-colors py-1">
            <Church className="w-4 h-4 text-navy/60" />
            Find a Church Home
          </Link>
          <Link href="/groups" className="flex items-center gap-3 text-sm text-gray-700 hover:text-navy transition-colors py-1">
            <Users className="w-4 h-4 text-navy/60" />
            Join a Small Group
          </Link>
          <Link href="/prayer" className="flex items-center gap-3 text-sm text-gray-700 hover:text-navy transition-colors py-1">
            <BookOpen className="w-4 h-4 text-navy/60" />
            Prayer Requests
          </Link>
        </div>
      </div>

      {/* Verse of the day */}
      <div className="bg-navy rounded-xl p-4 text-cream">
        <p className="text-xs font-semibold text-gold uppercase tracking-wide mb-2">Verse of the Day</p>
        <p className="text-sm leading-relaxed italic text-cream/90">
          &ldquo;And let us consider how to stir up one another to love and good works.&rdquo;
        </p>
        <p className="text-xs text-cream/50 mt-2">— Hebrews 10:24</p>
      </div>

      <p className="text-xs text-gray-400 px-1">
        © {new Date().getFullYear()} Gathered · Serving the Twin Cities
      </p>
    </aside>
  );
}
