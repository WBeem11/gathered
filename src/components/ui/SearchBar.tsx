"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Briefcase, Church, Users, MapPin } from "lucide-react";

type SearchResult = {
  title: string;
  subtitle?: string;
  type: "Rec" | "Church" | "Group" | "Job";
  href: string;
};

const TYPE_CONFIG = {
  Rec:    { label: "Businesses",  icon: Briefcase, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  Church: { label: "Churches",    icon: Church,    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  Group:  { label: "Groups",      icon: Users,     color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  Job:    { label: "Jobs",        icon: MapPin,    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
} as const;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Escape to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const showDropdown = open && query.length > 1;
  const groupedTypes = (["Rec", "Church", "Group", "Job"] as const).filter(
    (t) => results.some((r) => r.type === t)
  );

  return (
    <div ref={wrapperRef} className="relative w-full mb-5">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search churches, businesses, groups, jobs..."
          className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-white/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results popup */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-600 border-t-navy dark:border-t-white rounded-full animate-spin" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div>
              {groupedTypes.map((type) => {
                const group = results.filter((r) => r.type === type);
                const { label, icon: Icon, color } = TYPE_CONFIG[type];
                return (
                  <div key={type}>
                    <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
                    </div>
                    {group.map((result, i) => (
                      <Link
                        key={i}
                        href={result.href}
                        onClick={() => { setOpen(false); setQuery(""); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${color}`}>
                          {type}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{result.title}</p>
                          {result.subtitle && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{result.subtitle}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                );
              })}
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
                Press <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">Esc</kbd> to close
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
