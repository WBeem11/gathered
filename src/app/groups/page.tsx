"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";

const GROUP_TYPES = [
  { value: "bible_study", label: "Bible Study", emoji: "📖" },
  { value: "moms", label: "Moms Group", emoji: "👩‍👧" },
  { value: "mens", label: "Men&apos;s Group", emoji: "👨" },
  { value: "youth", label: "Youth Group", emoji: "🙌" },
  { value: "neighborhood", label: "Neighborhood", emoji: "🏘️" },
  { value: "young_families", label: "Young Families", emoji: "👨‍👩‍👧‍👦" },
  { value: "seniors", label: "Seniors", emoji: "❤️" },
  { value: "other", label: "Other", emoji: "✝️" },
];

type Group = {
  id: string;
  name: string;
  description: string;
  type: string;
  meetingFrequency: string | null;
  location: string | null;
  isVirtual: boolean;
  createdAt: string;
  leader: { id: string; name: string | null; profilePhoto: string | null };
  _count: { members: number };
};

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "bible_study", meetingFrequency: "", location: "", isVirtual: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/groups").then(r => r.json()).then(setGroups).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const group = await res.json();
      setGroups((prev) => [group, ...prev]);
      setShowForm(false);
      setForm({ name: "", description: "", type: "bible_study", meetingFrequency: "", location: "", isVirtual: false });
    }
    setSubmitting(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <SearchBar />
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👥</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-2">Community Groups</h1>
        <p className="text-navy/60 max-w-md mx-auto">
          Life is better together. Find or start a group to grow in faith and friendship.
        </p>
      </div>

      <div className="flex justify-end mb-6">
        {session ? (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-light text-navy font-semibold">
            + Create a Group
          </Button>
        ) : (
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy">Sign In to Create</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-playfair text-xl text-navy/50">No groups yet — start one!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => {
            const typeInfo = GROUP_TYPES.find(t => t.value === group.type);
            return (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <Card className="p-5 border-0 shadow-sm bg-white hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{typeInfo?.emoji ?? "✝️"}</div>
                    <div className="flex-1">
                      <h3 className="font-playfair font-bold text-navy text-lg leading-tight">{group.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1 border-sage/30 text-sage-700">
                        {typeInfo?.label ?? group.type}
                      </Badge>
                      <p className="text-sm text-navy/70 mt-2 line-clamp-2">{group.description}</p>

                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />{group._count.members} member{group._count.members !== 1 ? "s" : ""}
                        </span>
                        {group.meetingFrequency && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{group.meetingFrequency}
                          </span>
                        )}
                        {group.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{group.isVirtual ? "Virtual" : group.location}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-cream">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={group.leader.profilePhoto ?? ""} />
                          <AvatarFallback className="bg-gold text-navy text-xs">
                            {(group.leader.name ?? "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">Led by {group.leader.name}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-navy">Create a Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Group Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Maple Grove Bible Study" />
            </div>
            <div className="space-y-1.5">
              <Label>Group Type *</Label>
              <Select value={form.type} onValueChange={v => v && setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GROUP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} placeholder="Tell people about your group..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Meeting Frequency</Label>
                <Input value={form.meetingFrequency} onChange={e => setForm({...form, meetingFrequency: e.target.value})} placeholder="Weekly, Tuesdays" />
              </div>
              <div className="space-y-1.5">
                <Label>Location / Neighborhood</Label>
                <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Maple Grove" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isVirtual} onChange={e => setForm({...form, isVirtual: e.target.checked})} />
              This group meets virtually
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-navy text-cream hover:bg-navy-light">
                {submitting ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
