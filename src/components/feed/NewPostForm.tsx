"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface NewPostFormProps {
  onPost: (post: unknown) => void;
}

export default function NewPostForm({ onPost }: NewPostFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!session) {
    return (
      <Card className="p-5 bg-white border-0 shadow-sm text-center">
        <p className="text-navy/70 mb-3">Join the conversation in your Christian community</p>
        <div className="flex justify-center gap-3">
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-navy text-cream hover:bg-navy-light">Join Gathered</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const initials = (session.user?.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category, isAnonymous }),
    });

    if (res.ok) {
      const post = await res.json();
      onPost(post);
      setContent("");
      setCategory("general");
      setIsAnonymous(false);
    }
    setSubmitting(false);
  }

  return (
    <Card className="p-5 bg-white border-0 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border-2 border-cream flex-shrink-0">
            <AvatarImage src={session.user?.image ?? ""} />
            <AvatarFallback className="bg-navy text-cream text-sm font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with your community..."
              rows={3}
              className="resize-none border-navy/10 focus-visible:ring-gold"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <Select value={category} onValueChange={v => v && setCategory(v)}>
                  <SelectTrigger className="w-[160px] border-navy/20 text-sm h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">💬 Update</SelectItem>
                    <SelectItem value="prayer">🙏 Prayer Request</SelectItem>
                    <SelectItem value="help">🤝 Help Request</SelectItem>
                    <SelectItem value="marketplace">🛒 Marketplace</SelectItem>
                  </SelectContent>
                </Select>
                <label className="flex items-center gap-1.5 text-sm text-navy/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  Post anonymously
                </label>
              </div>
              <Button
                type="submit"
                disabled={submitting || !content.trim()}
                className="bg-navy hover:bg-navy-light text-cream font-semibold px-6"
              >
                {submitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}
