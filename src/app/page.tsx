"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PostCard from "@/components/feed/PostCard";
import NewPostForm from "@/components/feed/NewPostForm";
import SearchBar from "@/components/ui/SearchBar";

const FEED_TABS = [
  { value: "foryou",   label: "For You" },
  { value: "recent",   label: "Recent" },
  { value: "nearby",   label: "Nearby" },
  { value: "trending", label: "Trending" },
];

const CATEGORIES = [
  { value: "all",         label: "All" },
  { value: "general",     label: "Updates" },
  { value: "prayer",      label: "🙏 Prayer" },
  { value: "help",        label: "🤝 Help" },
  { value: "marketplace", label: "🛒 Market" },
];

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

export default function HomePage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [feed, setFeed] = useState("foryou");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ feed });
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/posts?${params}`);
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, [feed, category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function handleNewPost(post: unknown) {
    setPosts((prev) => [post as Post, ...prev]);
  }

  function handleDeletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const EMPTY_MESSAGES: Record<string, { icon: string; text: string }> = {
    foryou:   { icon: "✝️", text: "Nothing nearby yet — be the first to post!" },
    recent:   { icon: "✝️", text: "No posts yet — be the first to share!" },
    nearby:   { icon: "📍", text: session ? "No posts from your neighborhood yet." : "Sign in to see posts nearby." },
    trending: { icon: "🔥", text: "Nothing trending yet — start the conversation!" },
  };

  const empty = EMPTY_MESSAGES[feed] ?? EMPTY_MESSAGES.recent;

  return (
    <div>
      <SearchBar />
      <NewPostForm onPost={handleNewPost} />

      {/* Feed tabs */}
      <div className="mt-4 mb-2">
        <div className="flex gap-1 bg-white dark:bg-[#1e1e1e] rounded-xl p-1 shadow-sm border border-gray-100 dark:border-white/10">
          {FEED_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFeed(tab.value)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                feed === tab.value
                  ? "bg-navy dark:bg-white text-cream dark:text-[#262626]"
                  : "text-navy/50 dark:text-gray-400 hover:text-navy dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              category === c.value
                ? "bg-navy dark:bg-white text-cream dark:text-[#262626] border-navy dark:border-white"
                : "border-gray-200 dark:border-white/20 text-navy/60 dark:text-gray-400 hover:border-navy/40 dark:hover:border-white/40 bg-white dark:bg-[#1e1e1e]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">{empty.icon}</p>
          <p className="font-playfair text-lg text-navy/60 dark:text-gray-400">{empty.text}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} onDelete={handleDeletePost} />
          ))}
        </div>
      )}
    </div>
  );
}
