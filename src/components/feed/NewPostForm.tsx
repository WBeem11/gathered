"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Camera, Image as ImageIcon, X, Loader2 } from "lucide-react";
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  if (!session) {
    return (
      <Card className="p-5 bg-white dark:bg-[#1e1e1e] border-0 shadow-sm text-center">
        <p className="text-navy/70 dark:text-white/70 mb-3">Join the conversation in your Christian community</p>
        <div className="flex justify-center gap-3">
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy dark:border-white/30 dark:text-white">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-navy text-cream hover:bg-navy-light dark:bg-white dark:text-[#262626]">Join Gathered</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const initials = (session.user?.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("Image must be under 10MB."); return; }

    setUploading(true);
    setUploadError("");
    setImagePreview(URL.createObjectURL(file));

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload-post-image", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      setImageUrl(data.url);
    } else {
      setUploadError(data.error ?? "Upload failed.");
      setImagePreview(null);
    }
    setUploading(false);
  }

  function removeImage() {
    setImageUrl(null);
    setImagePreview(null);
    setUploadError("");
    if (galleryRef.current) galleryRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;
    setSubmitting(true);

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category, isAnonymous, imageUrl }),
    });

    if (res.ok) {
      const post = await res.json();
      onPost(post);
      setContent("");
      setCategory("general");
      setIsAnonymous(false);
      setImageUrl(null);
      setImagePreview(null);
    }
    setSubmitting(false);
  }

  const canSubmit = (content.trim().length > 0 || !!imageUrl) && !uploading;

  return (
    <Card className="p-5 bg-white dark:bg-[#1e1e1e] border-0 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border-2 border-cream flex-shrink-0">
            <AvatarImage src={session.user?.image ?? ""} />
            <AvatarFallback className="bg-navy text-cream text-sm font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              id="new-post-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with your community..."
              rows={3}
              className="resize-none border-navy/10 dark:border-white/10 dark:bg-[#262626] dark:text-white focus-visible:ring-gold"
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Post image"
                  className="max-h-64 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            )}

            {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

            {/* Hidden file inputs */}
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
            />

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={category} onValueChange={v => v && setCategory(v)}>
                  <SelectTrigger className="w-[150px] border-navy/20 dark:border-white/20 dark:bg-[#262626] dark:text-white text-sm h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">💬 Update</SelectItem>
                    <SelectItem value="prayer">🙏 Prayer Request</SelectItem>
                    <SelectItem value="help">🤝 Help Request</SelectItem>
                    <SelectItem value="marketplace">🛒 Marketplace</SelectItem>
                  </SelectContent>
                </Select>

                {/* Photo buttons */}
                {!imagePreview && (
                  <>
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white border border-navy/20 dark:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors"
                      title="Choose from library"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white border border-navy/20 dark:border-white/20 rounded-lg px-2.5 py-1.5 transition-colors"
                      title="Take a photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Camera</span>
                    </button>
                  </>
                )}

                <label className="flex items-center gap-1.5 text-sm text-navy/70 dark:text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  Anonymous
                </label>
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                className="bg-navy hover:bg-navy-light dark:bg-white dark:text-[#262626] dark:hover:bg-gray-200 text-cream font-semibold px-6"
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
