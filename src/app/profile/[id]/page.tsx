"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Calendar, Bookmark } from "lucide-react";
import { format } from "date-fns";
import PostCard from "@/components/feed/PostCard";

type Post = {
  id: string;
  content: string;
  category: string;
  location: string | null;
  isAnonymous: boolean;
  imageUrl?: string | null;
  createdAt: string;
  author: { id: string; name: string | null; location: string | null; profilePhoto: string | null };
  comments: { id: string; content: string; createdAt: string; author: { id: string; name: string | null; profilePhoto: string | null } }[];
  reactions: { id: string; userId: string; type: string }[];
  _count: { comments: number; reactions: number };
};

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
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"overview" | "saved">("overview");
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);

  const isOwnProfile = session?.user?.id === id;

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab !== "saved" || !isOwnProfile) return;
    setSavedLoading(true);
    fetch("/api/saved-posts")
      .then(r => r.ok ? r.json() : [])
      .then((posts: Post[]) => {
        setSavedPosts(posts);
        setSavedIds(new Set(posts.map(p => p.id)));
      })
      .finally(() => setSavedLoading(false));
  }, [tab, isOwnProfile]);

  function handleToggleSave(postId: string, nowSaved: boolean) {
    if (!nowSaved) {
      setSavedPosts(prev => prev.filter(p => p.id !== postId));
      setSavedIds(prev => { const s = new Set(prev); s.delete(postId); return s; });
    }
  }

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
    return <div className="text-center py-16 text-navy/40 dark:text-gray-500">User not found</div>;
  }

  const initials = (profile.name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const totalPosts = profile._count.posts;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Profile card */}
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-navy/5 dark:border-white/10 p-8 text-center mb-6">
        <Avatar className="w-20 h-20 border-4 border-cream dark:border-white/10 shadow mx-auto mb-4">
          <AvatarImage src={profile.profilePhoto ?? ""} />
          <AvatarFallback className="bg-navy text-cream text-2xl font-bold font-playfair">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="font-playfair text-2xl font-bold text-navy dark:text-white">
          {profile.name ?? "Anonymous"}
        </h1>

        {profile.neighborhood && (
          <p className="flex items-center justify-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {profile.neighborhood}
          </p>
        )}

        <p className="flex items-center justify-center gap-1 text-sm text-gray-400 dark:text-gray-500 mt-1">
          <Calendar className="w-3.5 h-3.5" />
          Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
        </p>

        <div className="border-t border-gray-100 dark:border-white/10 my-5" />

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

      {/* Saved tab — only visible on own profile */}
      {isOwnProfile && (
        <>
          <div className="flex gap-1 bg-white dark:bg-[#1e1e1e] rounded-xl p-1 shadow-sm border border-gray-100 dark:border-white/10 mb-4">
            <button
              onClick={() => setTab("overview")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                tab === "overview"
                  ? "bg-navy dark:bg-white text-cream dark:text-[#262626]"
                  : "text-navy/50 dark:text-gray-400 hover:text-navy dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("saved")}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                tab === "saved"
                  ? "bg-navy dark:bg-white text-cream dark:text-[#262626]"
                  : "text-navy/50 dark:text-gray-400 hover:text-navy dark:hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved
            </button>
          </div>

          {tab === "saved" && (
            <div className="space-y-4">
              {savedLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-2xl h-36 animate-pulse" />
                ))
              ) : savedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No saved posts yet</p>
                </div>
              ) : (
                savedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isSaved={savedIds.has(post.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
