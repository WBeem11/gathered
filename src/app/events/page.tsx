import { CalendarDays } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-5">
        <CalendarDays className="w-8 h-8 text-sage" />
      </div>
      <h1 className="font-playfair text-3xl font-bold text-navy dark:text-white mb-3">Events — Coming Soon</h1>
      <p className="text-navy/60 dark:text-white/60 max-w-sm text-base leading-relaxed">
        Find Christian events, gatherings, and meetups across the Twin Cities. This feature is on its way.
      </p>
    </div>
  );
}
