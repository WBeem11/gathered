"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, Mail, MapPin, FileText, Check, AlertCircle, Camera, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", email: "", neighborhood: "", bio: "" });
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/sign-in");
  }, [status, router]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          neighborhood: data.neighborhood ?? "",
          bio: data.bio ?? "",
        });
        setAvatarUrl(data.profilePhoto ?? session?.user?.image ?? "");
      }
      setLoading(false);
    }
    if (session) load();
  }, [session]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    // Show local preview immediately
    const preview = URL.createObjectURL(file);
    setAvatarUrl(preview);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
    const data = await res.json();

    if (res.ok) {
      setAvatarUrl(data.url);
      await updateSession(); // refresh session so navbar avatar updates
    } else {
      setUploadError(data.error ?? "Upload failed. Please try again.");
      setAvatarUrl(session?.user?.image ?? ""); // revert on error
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
    }
    setSaving(false);
  }

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (loading || status === "loading") {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-[#1e1e1e] rounded-2xl h-24 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-navy/10 dark:bg-white/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-navy dark:text-white" />
        </div>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-navy dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Profile card */}
        <Card className="p-6 bg-white dark:bg-[#1e1e1e] border-0 shadow-sm">
          <h2 className="font-semibold text-navy dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4" /> Profile
          </h2>

          {/* Avatar upload */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative group">
              <Avatar className="w-16 h-16 border-2 border-gold/40">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-navy text-cream text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Camera className="w-5 h-5 text-white" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-sm font-medium text-navy dark:text-white hover:underline disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Change profile photo"}
              </button>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG or GIF · Max 5MB</p>
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <User className="w-3.5 h-3.5" /> Display Name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="border-gray-200 dark:border-gray-700 dark:bg-[#262626] dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="neighborhood" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <MapPin className="w-3.5 h-3.5" /> Neighborhood
              </Label>
              <Input
                id="neighborhood"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                placeholder="e.g. South Minneapolis, Edina, Eagan..."
                className="border-gray-200 dark:border-gray-700 dark:bg-[#262626] dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <FileText className="w-3.5 h-3.5" /> Bio
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell your neighbors a bit about yourself..."
                rows={3}
                className="resize-none border-gray-200 dark:border-gray-700 dark:bg-[#262626] dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Account card */}
        <Card className="p-6 bg-white dark:bg-[#1e1e1e] border-0 shadow-sm">
          <h2 className="font-semibold text-navy dark:text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Account
          </h2>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="border-gray-200 dark:border-gray-700 dark:bg-[#262626] dark:text-white"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">Used to sign in. Changing this will update your login email.</p>
          </div>
        </Card>

        {/* Privacy card */}
        <Card className="p-6 bg-white dark:bg-[#1e1e1e] border-0 shadow-sm">
          <h2 className="font-semibold text-navy dark:text-white mb-1">Privacy</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Control how your information is shown to others</p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <MapPin className="w-4 h-4 text-navy/60 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Neighborhood visibility</p>
                <p className="text-xs text-gray-400 mt-0.5">Your neighborhood is shown on your public profile to help neighbors connect with people nearby.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <User className="w-4 h-4 text-navy/60 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Anonymous posting</p>
                <p className="text-xs text-gray-400 mt-0.5">You can choose to post anonymously on a per-post basis using the checkbox when creating a post.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            Changes saved successfully!
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-navy dark:bg-white text-cream dark:text-[#262626] hover:bg-navy-light dark:hover:bg-gray-200 px-8 font-semibold"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
