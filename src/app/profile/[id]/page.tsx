"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

type UserProfile = {
  id: string;
  name: string | null;
  neighborhood: string | null;
  profilePhoto: string | null;
  createdAt: string;
  prayerCount: number;
  _count: { posts: number; reactions: number };
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-sm mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-[#2a2a2a] animate-pulse mx-auto mb-4" />
        <div className="h-5 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-32 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-[#2a2a2a] rounded animate-pulse w-24 mx-auto" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 text-navy/40 dark:text-gray-500">
        User not found
      </div>
    );
  }

  const initials = (profile.name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const totalPosts = profile._count.posts;

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-navy/5 dark:border-white/10 p-8 text-center">
        {/* Avatar */}
        <Avatar className="w-20 h-20 border-4 border-cream dark:border-white/10 shadow mx-auto mb-4">
          <AvatarImage src={profile.profilePhoto ?? ""} />
          <AvatarFallback className="bg-navy text-cream text-2xl font-bold font-playfair">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h1 className="font-playfair text-2xl font-bold text-navy dark:text-white">
          {profile.name ?? "Anonymous"}
        </h1>

        {/* Neighborhood */}
        {profile.neighborhood && (
          <p className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {profile.neighborhood}
          </p>
        )}

        {/* Member since */}
        <p className="flex items-center justify-center gap-1 text-sm text-gray-400 dark:text-gray-500 mt-1">
          <Calendar className="w-3.5 h-3.5" />
          Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 dark:border-white/10 my-5" />

        {/* Stats */}
        <div className="flex justify-center gap-8 text-center">
          <div>
            <p className="text-xl font-bold text-navy dark:text-white">{totalPosts}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">post{totalPosts !== 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-xl font-bold text-navy dark:text-white">{profile.prayerCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">prayer{profile.prayerCount !== 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-xl font-bold text-navy dark:text-white">{profile._count.reactions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">amens given</p>
          </div>
        </div>
      </div>
    </div>
  );
}
