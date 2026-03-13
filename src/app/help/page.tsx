"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PostCard from "@/components/feed/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Link from "next/link";

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

const EXAMPLES = [
  "Babysitting or childcare",
  "Help moving furniture",
  "Youth looking for odd jobs",
  "Borrowing tools or equipment",
  "Rides to appointments",
  "Meal train for a family",
];

export default function HelpPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/posts?category=help");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category: "help", isAnonymous: false }),
    });

    if (res.ok) {
      const post = await res.json();
      setPosts((prev) => [post, ...prev]);
      setContent("");
      setShowForm(false);
    }
    setSubmitting(false);
  }

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🤝</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-2">
          Help Board
        </h1>
        <p className="text-navy/60 max-w-md mx-auto">
          Practical needs within the community. Ask for help or offer yours.
        </p>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {EXAMPLES.map((ex) => (
          <span
            key={ex}
            className="text-xs bg-white border border-navy/10 text-navy/70 px-3 py-1.5 rounded-full shadow-sm"
          >
            {ex}
          </span>
        ))}
      </div>

      {/* Submit */}
      {session ? (
        <div className="mb-6">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-white rounded-2xl border border-navy/10 p-4 text-left text-navy/50 hover:border-gold/40 transition-colors shadow-sm"
            >
              Post a help request or offer...
            </button>
          ) : (
            <Card className="p-5 border-0 shadow-sm bg-white">
              <h3 className="font-playfair text-lg font-semibold text-navy mb-3">Post a Help Request</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="w-9 h-9 border-2 border-cream flex-shrink-0">
                    <AvatarImage src={session.user?.image ?? ""} />
                    <AvatarFallback className="bg-navy text-cream text-sm font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe what you need or what you're offering to help with..."
                    rows={4}
                    className="resize-none border-navy/10 focus-visible:ring-gold flex-1"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pl-12">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={submitting || !content.trim()}
                    className="bg-navy hover:bg-navy-light text-cream"
                  >
                    {submitting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      ) : (
        <Card className="p-5 mb-6 border-0 shadow-sm text-center bg-white">
          <p className="text-navy/70 mb-3">Sign in to post a help request</p>
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

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-navy/40">
          <p className="text-4xl mb-3">🤝</p>
          <p className="font-playfair text-lg text-navy/60">No help requests yet</p>
          <p className="text-sm mt-1">Be the first to ask or offer</p>
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
