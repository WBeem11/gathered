"use client";

import { CalendarDays } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center">
            <CalendarDays className="w-8 h-8 text-navy" />
          </div>
        </div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-2">Events</h1>
        <p className="text-navy/60 max-w-md mx-auto">
          Community gatherings, church events, and neighborhood meetups across the Twin Cities.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border-0 p-10 text-center">
        <div className="text-4xl mb-3">🗓️</div>
        <h2 className="font-playfair text-xl font-bold text-navy mb-2">Coming Soon</h2>
        <p className="text-navy/50 text-sm max-w-xs mx-auto">
          Events are on the way. Check back soon to discover what&apos;s happening in your community.
        </p>
      </div>
    </div>
  );
}
