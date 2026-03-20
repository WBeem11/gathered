"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import PostCard from "@/components/feed/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";

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

export default function PrayerPage() {
  const { data: session } = useSession();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/posts?category=prayer");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const recaptchaToken = executeRecaptcha ? await executeRecaptcha("create_prayer") : undefined;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category: "prayer", isAnonymous, recaptchaToken }),
    });

    if (res.ok) {
      const post = await res.json();
      setPosts((prev) => [post, ...prev]);
      setContent("");
      setIsAnonymous(false);
      setShowForm(false);
    }
    setSubmitting(false);
  }

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <SearchBar />
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🙏</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy dark:text-white mb-2">
          Prayer Requests
        </h1>
        <p className="text-navy/60 dark:text-gray-400 max-w-md mx-auto">
          Share your needs. We believe in the power of prayer and standing together.
        </p>
      </div>

      {/* Submit */}
      {session ? (
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-white dark:bg-[#1e1e1e] rounded-2xl border border-navy/10 dark:border-white/10 p-4 text-left text-navy/50 dark:text-gray-400 hover:border-gold/40 transition-colors shadow-sm"
            >
              Share a prayer request with the community...
            </button>
          ) : (
            <Card className="p-5 border-0 shadow-sm bg-white dark:bg-[#1e1e1e]">
              <h3 className="font-playfair text-lg font-semibold text-navy dark:text-white mb-3">Share a Prayer Request</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-9 h-9 border-2 border-cream flex-shrink-0">
                    <AvatarImage src={session.user?.image ?? ""} />
                    <AvatarFallback className="bg-navy text-cream text-sm font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What would you like prayer for?"
                    rows={4}
                    className="resize-none border-navy/10 focus-visible:ring-gold flex-1"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-3 pl-12">
                  <label className="flex items-center gap-1.5 text-sm text-navy/70 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded"
                    />
                    Post anonymously
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitting || !content.trim()}
                      className="bg-navy hover:bg-navy-light text-cream"
                    >
                      {submitting ? "Sharing..." : "Share Request"}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-5 mb-6 border-0 shadow-sm text-center bg-white dark:bg-[#1e1e1e]">
          <p className="text-navy/70 dark:text-gray-300 mb-3">Sign in to share a prayer request</p>
          <div className="flex justify-center gap-3">
            <Link href="/sign-in">
              <Button variant="outline" className="border-navy/30 text-navy">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-navy text-cream hover:bg-navy-light">Join Gathered</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Count */}
      {!loading && (
        <p className="text-sm text-navy/50 dark:text-gray-500 mb-4">
          {posts.length} prayer request{posts.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Prayer posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-navy/40 dark:text-gray-500">
          <p className="text-4xl mb-3">🙏</p>
          <p className="font-playfair text-lg text-navy/60 dark:text-gray-400">No prayer requests yet</p>
          <p className="text-sm mt-1">Be the first to share</p>
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
