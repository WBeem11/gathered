"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, Mail, MapPin, FileText, Check, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", neighborhood: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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
      }
      setLoading(false);
    }
    if (session) load();
  }, [session]);

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

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
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

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar className="w-14 h-14 border-2 border-gold/40">
              <AvatarImage src={session?.user?.image ?? ""} />
              <AvatarFallback className="bg-navy text-cream text-lg font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
              <p className="text-xs text-gray-400">Profile photo is managed via Google or sign-up</p>
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

        {/* Feedback messages */}
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
