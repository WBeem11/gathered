"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, MapPin, Send } from "lucide-react";
import Link from "next/link";

interface Author {
  id: string;
  name: string | null;
  location: string | null;
  profilePhoto: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null; profilePhoto: string | null };
}

interface Post {
  id: string;
  content: string;
  category: string;
  location: string | null;
  isAnonymous: boolean;
  imageUrl?: string | null;
  createdAt: string;
  author: Author;
  comments: Comment[];
  reactions: { id: string; userId: string; type: string }[];
  _count: { comments: number; reactions: number };
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  general:        { label: "Update",      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  prayer:         { label: "Prayer",      color: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300" },
  help:           { label: "Help Needed", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300" },
  marketplace:    { label: "Marketplace", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300" },
  recommendation: { label: "Rec",         color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
};

export default function PostCard({ post, onUpdate }: { post: Post; onUpdate?: () => void }) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localReactions, setLocalReactions] = useState(post.reactions);
  const [localComments, setLocalComments] = useState(post.comments);

  const hasReacted = session?.user?.id
    ? localReactions.some((r) => r.userId === session.user.id)
    : false;

  async function handleReact() {
    if (!session) return;
    const res = await fetch(`/api/posts/${post.id}/react`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.reacted) {
        setLocalReactions((prev) => [
          ...prev,
          { id: Date.now().toString(), userId: session.user.id, type: "amen" },
        ]);
      } else {
        setLocalReactions((prev) => prev.filter((r) => r.userId !== session.user.id));
      }
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !commentText.trim()) return;
    setSubmittingComment(true);

    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentText }),
    });

    if (res.ok) {
      const comment = await res.json();
      setLocalComments((prev) => [...prev, comment]);
      setCommentText("");
      onUpdate?.();
    }
    setSubmittingComment(false);
  }

  const authorName = post.isAnonymous ? "Anonymous" : post.author.name ?? "Someone";
  const initials = post.isAnonymous
    ? "A"
    : (post.author.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const catInfo = CATEGORY_LABELS[post.category] ?? { label: post.category, color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm border border-navy/5 dark:border-white/10 overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-cream dark:border-white/10">
              {!post.isAnonymous && <AvatarImage src={post.author.profilePhoto ?? ""} />}
              <AvatarFallback className="bg-navy text-cream text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-navy dark:text-white text-sm">{authorName}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {!post.isAnonymous && post.author.location && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {post.author.location}
                  </span>
                )}
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catInfo.color}`}>
            {catInfo.label}
          </span>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-navy/80 dark:text-gray-100 leading-relaxed">{post.content}</p>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className={post.content ? "mt-3" : ""}>
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full rounded-xl object-cover max-h-96"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-cream dark:border-white/10">
          <button
            onClick={handleReact}
            disabled={!session}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              hasReacted
                ? "bg-gold/20 text-gold"
                : "text-navy/60 dark:text-gray-400 hover:bg-cream dark:hover:bg-white/10 hover:text-navy dark:hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            🙏 <span>{post.category === "prayer" ? "Praying" : "Amen"}{localReactions.length > 0 ? ` · ${localReactions.length}` : ""}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-navy/60 dark:text-gray-400 hover:text-navy dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-cream dark:hover:bg-white/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{localComments.length > 0 ? `${localComments.length} comment${localComments.length !== 1 ? "s" : ""}` : "Comment"}</span>
          </button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-cream dark:border-white/10 bg-cream/50 dark:bg-[#262626] px-5 py-4 space-y-3">
          {localComments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5">
              <Avatar className="w-7 h-7 border border-navy/10 dark:border-white/10 flex-shrink-0">
                <AvatarImage src={comment.author.profilePhoto ?? ""} />
                <AvatarFallback className="bg-sage text-white text-xs">
                  {(comment.author.name ?? "?")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-white dark:bg-[#1e1e1e] rounded-xl px-3 py-2 flex-1 shadow-sm">
                <p className="text-xs font-semibold text-navy dark:text-white">{comment.author.name}</p>
                <p className="text-sm text-navy/80 dark:text-gray-200 mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))}

          {session ? (
            <form onSubmit={handleComment} className="flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a kind word..."
                rows={1}
                className="resize-none flex-1 text-sm min-h-0 py-2 dark:bg-[#1e1e1e] dark:text-white dark:border-white/10 dark:placeholder:text-gray-500"
              />
              <Button
                type="submit"
                size="sm"
                disabled={submittingComment || !commentText.trim()}
                className="bg-navy hover:bg-navy-light text-cream self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              <Link href="/sign-in" className="text-gold hover:underline">Sign in</Link> to comment
            </p>
          )}
        </div>
      )}
    </div>
  );
}
