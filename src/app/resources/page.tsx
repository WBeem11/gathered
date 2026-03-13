"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "books", label: "📚 Books" },
  { value: "baby_gear", label: "👶 Baby Gear" },
  { value: "furniture", label: "🪑 Furniture" },
  { value: "tools", label: "🔧 Tools" },
  { value: "clothing", label: "👔 Clothing" },
  { value: "food", label: "🥫 Food/Pantry" },
  { value: "other", label: "🎁 Other" },
];

const CONDITIONS = ["excellent", "good", "fair", "poor"];

type Resource = {
  id: string;
  name: string;
  description: string;
  condition: string | null;
  category: string;
  isAvailable: boolean;
  isFree: boolean;
  contactInfo: string | null;
  neighborhood: string | null;
  createdAt: string;
  poster: { id: string; name: string | null; neighborhood: string | null; profilePhoto: string | null };
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", condition: "good", category: "other",
    isFree: true, contactInfo: "", neighborhood: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/resources?${params}`);
    if (res.ok) setResources(await res.json());
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const resource = await res.json();
      setResources((prev) => [resource, ...prev]);
      setShowForm(false);
    }
    setSubmitting(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎁</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-2">Resource Sharing</h1>
        <p className="text-navy/60 max-w-md mx-auto">
          Give, lend, and share with your neighbors. Inspired by generosity, rooted in faith.
        </p>
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === c.value ? "bg-navy text-cream" : "bg-white text-navy/70 hover:bg-cream border border-navy/10"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {session ? (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-light text-navy font-semibold">
            + Share an Item
          </Button>
        ) : (
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy">Sign In to Share</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-44 animate-pulse" />)}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-playfair text-xl text-navy/50">Nothing shared yet — be generous!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const catInfo = CATEGORIES.find(c => c.value === resource.category);
            return (
              <Card key={resource.id} className="p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{catInfo?.label?.split(" ")[0] ?? "🎁"}</span>
                  <div className="flex gap-1.5">
                    {resource.isFree && (
                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Free</Badge>
                    )}
                    {resource.condition && (
                      <Badge variant="outline" className="text-xs capitalize">{resource.condition}</Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-playfair font-bold text-navy text-lg leading-tight">{resource.name}</h3>
                <p className="text-sm text-navy/70 mt-1 flex-1">{resource.description}</p>

                <div className="mt-3 pt-3 border-t border-cream">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={resource.poster.profilePhoto ?? ""} />
                        <AvatarFallback className="bg-sage text-white text-xs">
                          {(resource.poster.name ?? "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium text-navy">{resource.poster.name}</p>
                        {resource.neighborhood && (
                          <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />{resource.neighborhood}
                          </p>
                        )}
                      </div>
                    </div>
                    {resource.contactInfo && (
                      <a
                        href={resource.contactInfo.includes("@") ? `mailto:${resource.contactInfo}` : undefined}
                        className="text-xs font-semibold text-gold hover:underline"
                      >
                        I want this →
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(resource.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-navy">Share an Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Item Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Baby crib, set of books..." />
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} placeholder="Describe the item, size, color, any details..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={v => v && setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== "all").map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={v => v && setForm({...form, condition: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Contact Info</Label>
                <Input value={form.contactInfo} onChange={e => setForm({...form, contactInfo: e.target.value})} placeholder="email@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Neighborhood</Label>
                <Input value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} placeholder="Edina" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isFree} onChange={e => setForm({...form, isFree: e.target.checked})} />
              This item is free
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-navy text-cream hover:bg-navy-light">
                {submitting ? "Sharing..." : "Share Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
