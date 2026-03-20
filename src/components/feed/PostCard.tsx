"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, MapPin, Send, MoreHorizontal, Trash2, Flag, Link as LinkIcon, Check, Bookmark, CheckCircle2 } from "lucide-react";
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
  isAnswered?: boolean;
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

export default function PostCard({ post, onUpdate, onDelete, isSaved: initialSaved = false, onToggleSave }: {
  post: Post;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  isSaved?: boolean;
  onToggleSave?: (postId: string, saved: boolean) => void;
}) {
  const { data: session } = useSession();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [localReactions, setLocalReactions] = useState(post.reactions);
  const [localComments, setLocalComments] = useState(post.comments);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [isAnswered, setIsAnswered] = useState(post.isAnswered ?? false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = session?.user?.id === post.author.id;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasReacted = session?.user?.id
    ? localReactions.some((r) => r.userId === session.user.id)
    : false;

  async function handleReact() {
    if (!session) return;
    const res = await fetch(`/api/posts/${post.id}/react`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.reacted) {
        setLocalReactions((prev) => [...prev, { id: Date.now().toString(), userId: session.user.id, type: "amen" }]);
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

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    setMenuOpen(false);
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleted(true);
      onDelete?.(post.id);
    }
  }

  async function handleReport() {
    setMenuOpen(false);
    const reason = prompt("Why are you reporting this post? (optional)");
    if (reason === null) return; // user cancelled
    await fetch(`/api/posts/${post.id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setReported(true);
  }

  async function handleSave() {
    if (!session) return;
    const res = await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
    if (res.ok) {
      const { saved: nowSaved } = await res.json();
      setSaved(nowSaved);
      onToggleSave?.(post.id, nowSaved);
    }
  }

  async function handleAnswer() {
    setMenuOpen(false);
    const res = await fetch(`/api/posts/${post.id}/answer`, { method: "POST" });
    if (res.ok) {
      const { isAnswered: nowAnswered } = await res.json();
      setIsAnswered(nowAnswered);
    }
  }

  function handleShare() {
    setMenuOpen(false);
    const url = `${window.location.origin}/?post=${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (deleted) return null;

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
              <AvatarFallback className="bg-navy text-cream text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              {post.isAnonymous ? (
                <p className="font-semibold text-navy dark:text-white text-sm">{authorName}</p>
              ) : (
                <Link href={`/profile/${post.author.id}`} className="font-semibold text-navy dark:text-white text-sm hover:underline">
                  {authorName}
                </Link>
              )}
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

          <div className="flex items-center gap-2">
            {isAnswered && post.category === "prayer" ? (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Answered
              </span>
            ) : (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${catInfo.color}`}>
                {catInfo.label}
              </span>
            )}

            {/* Three-dot menu */}
            {session && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-navy dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-8 z-50 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg py-1 w-44">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                      {copied ? "Link copied!" : "Copy link"}
                    </button>

                    {!isOwner && (
                      <button
                        onClick={handleReport}
                        disabled={reported}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        <Flag className="w-4 h-4" />
                        {reported ? "Reported" : "Report post"}
                      </button>
                    )}

                    {isOwner && post.category === "prayer" && (
                      <button
                        onClick={handleAnswer}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isAnswered ? "Unmark as Answered" : "Mark as Answered"}
                      </button>
                    )}

                    {isOwner && (
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-navy/80 dark:text-gray-100 leading-relaxed">{post.content}</p>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div className={post.content ? "mt-3" : ""}>
            <img src={post.imageUrl} alt="Post image" className="w-full rounded-xl object-cover max-h-96" />
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

          {session && (
            <button
              onClick={handleSave}
              className={`ml-auto p-1.5 rounded-full transition-colors ${
                saved
                  ? "text-navy dark:text-white"
                  : "text-gray-400 dark:text-gray-500 hover:text-navy dark:hover:text-white"
              }`}
              title={saved ? "Remove bookmark" : "Save post"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          )}
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
