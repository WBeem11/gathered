"use client";

import { useState, useEffect, useCallback } from "react";
import PostCard from "@/components/feed/PostCard";
import NewPostForm from "@/components/feed/NewPostForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchBar from "@/components/ui/SearchBar";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "general", label: "Updates" },
  { value: "prayer", label: "🙏 Prayer" },
  { value: "help", label: "🤝 Help" },
  { value: "marketplace", label: "🛒 Market" },
];

type Post = {
  id: string;
  content: string;
  category: string;
  location: string | null;
  isAnonymous: boolean;
  createdAt: string;
  author: { id: string; name: string | null; location: string | null; profilePhoto: string | null };
  comments: { id: string; content: string; createdAt: string; author: { id: string; name: string | null; profilePhoto: string | null } }[];
  reactions: { id: string; userId: string; type: string }[];
  _count: { comments: number; reactions: number };
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/posts?${params}`);
    if (res.ok) {
      const data = await res.json();
      setPosts(data);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function handleNewPost(post: unknown) {
    setPosts((prev) => [post as Post, ...prev]);
  }

  return (
    <div>
      <SearchBar />
      <NewPostForm onPost={handleNewPost} />

      {/* Filter tabs */}
      <Tabs value={category} onValueChange={setCategory} className="my-4">
        <TabsList className="bg-white border border-gray-100 shadow-sm h-auto p-1 gap-0.5">
          {CATEGORIES.map((c) => (
            <TabsTrigger
              key={c.value}
              value={c.value}
              className="data-[state=active]:bg-navy data-[state=active]:text-cream text-sm px-4 py-1.5 rounded-md"
            >
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-navy/40">
          <p className="text-4xl mb-3">✝️</p>
          <p className="font-playfair text-lg text-navy/60">No posts yet — be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}

