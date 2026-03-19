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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThumbsUp, MapPin, Globe, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "contractor", label: "Contractor" },
  { value: "dentist", label: "Dentist" },
  { value: "doctor", label: "Doctor" },
  { value: "lawyer", label: "Lawyer" },
  { value: "financial", label: "Financial" },
  { value: "landscaping", label: "Landscaping" },
  { value: "auto", label: "Auto Repair" },
  { value: "childcare", label: "Childcare" },
  { value: "coffee", label: "Coffee Shop" },
  { value: "other", label: "Other" },
];

type Rec = {
  id: string;
  businessName: string;
  category: string;
  description: string;
  whyRecommend: string;
  contactInfo: string | null;
  website: string | null;
  phone: string | null;
  neighborhood: string | null;
  photoUrl: string | null;
  featuredPartner: boolean;
  createdAt: string;
  author: { id: string; name: string | null; neighborhood: string | null; profilePhoto: string | null };
  endorsements: { id: string; userId: string }[];
  _count: { endorsements: number };
};

export default function RecommendationsPage() {
  const { data: session } = useSession();
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ businessName: "", category: "contractor", description: "", whyRecommend: "", contactInfo: "", website: "", phone: "", neighborhood: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchRecs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/recommendations?${params}`);
    if (res.ok) setRecs(await res.json());
    setLoading(false);
  }, [category]);

  useEffect(() => { fetchRecs(); }, [fetchRecs]);

  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/business-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSubmitted(true);
      setShowForm(false);
      setForm({ businessName: "", category: "contractor", description: "", whyRecommend: "", contactInfo: "", website: "", phone: "", neighborhood: "" });
      setSubmitting(false);
      return;
    }
    if (res.ok) {
      const rec = await res.json();
      setRecs((prev) => [rec, ...prev]);
      setShowForm(false);
      setForm({ businessName: "", category: "contractor", description: "", whyRecommend: "", contactInfo: "", website: "", phone: "", neighborhood: "" });
    }
    setSubmitting(false);
  }

  async function handleEndorse(id: string) {
    if (!session) return;
    const res = await fetch(`/api/recommendations/${id}/endorse`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setRecs((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                endorsements: data.endorsed
                  ? [...r.endorsements, { id: Date.now().toString(), userId: session.user.id }]
                  : r.endorsements.filter((e) => e.userId !== session.user.id),
              }
            : r
        )
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <SearchBar />
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏪</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy dark:text-white mb-2">Businesses</h1>
        <p className="text-navy/60 dark:text-gray-400 max-w-md mx-auto">
          Trust the people who trust Jesus. Recommend local businesses and service providers you love.
        </p>
      </div>

      {submitted && (
        <div className="mb-6 p-4 rounded-xl bg-sage/10 border border-sage/30 text-sage text-sm text-center">
          Thanks for your submission! We&apos;ll review it and add it to the directory soon.
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
                category === c.value ? "bg-navy text-cream dark:bg-white dark:text-[#262626]" : "bg-white dark:bg-[#1e1e1e] text-navy/70 dark:text-gray-300 hover:bg-cream dark:hover:bg-white/10 border border-navy/10 dark:border-white/10"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        {session ? (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-light text-navy font-semibold">
            + Add Recommendation
          </Button>
        ) : (
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy">Sign In to Recommend</Button>
          </Link>
        )}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}</div>
      ) : recs.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-playfair text-xl text-navy/50 dark:text-gray-500">No recommendations yet</p>
        </div>
      ) : (
        <>
          {/* Featured Founding Partners */}
          {recs.some(r => r.featuredPartner) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold tracking-widest text-gold uppercase">⭐ Featured Founding Partners</span>
              </div>
              <div className="flex flex-col gap-3">
                {recs.filter(r => r.featuredPartner).map((rec) => {
                  const categoryLabel = CATEGORIES.find(c => c.value === rec.category)?.label ?? rec.category;
                  const initial = rec.businessName[0].toUpperCase();
                  const card = (
                    <Card key={rec.id} className="border border-gold/40 bg-white dark:bg-[#1e1e1e] hover:shadow-md transition-shadow overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        {/* Avatar / logo */}
                        <div className="shrink-0">
                          {rec.photoUrl ? (
                            <img src={rec.photoUrl} alt={rec.businessName} className="w-14 h-14 rounded-full object-cover border-2 border-gold/30" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-navy/10 dark:bg-white/10 flex items-center justify-center border-2 border-gold/30">
                              <span className="text-xl font-bold text-navy dark:text-white">{initial}</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-navy dark:text-white text-base leading-tight">{rec.businessName}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{categoryLabel}{rec.neighborhood ? ` · ${rec.neighborhood}` : ""}</p>
                            </div>
                            {rec.website && (
                              <button className="shrink-0 w-9 h-9 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                <ExternalLink className="w-4 h-4 text-navy dark:text-white" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-navy/70 dark:text-gray-300 mt-1.5 line-clamp-2">{rec.description}</p>
                          <span className="inline-block mt-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-semibold">⭐ Founding Partner</span>
                        </div>
                      </div>
                    </Card>
                  );
                  return rec.website ? (
                    <a key={rec.id} href={rec.website} target="_blank" rel="noopener noreferrer" className="block">
                      {card}
                    </a>
                  ) : <div key={rec.id}>{card}</div>;
                })}
              </div>
              <div className="border-t border-cream my-6" />
            </div>
          )}
        <div className="grid gap-4 md:grid-cols-2">
          {recs.filter(r => !r.featuredPartner).map((rec) => {
            const endorsed = session?.user?.id ? rec.endorsements.some((e) => e.userId === session.user.id) : false;
            return (
              <Card key={rec.id} className="p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-playfair font-bold text-navy text-lg">{rec.businessName}</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
                      {CATEGORIES.find(c => c.value === rec.category)?.label ?? rec.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-navy/70 mt-2 mb-1">{rec.description}</p>
                <p className="text-sm text-navy/80 italic mb-3">&ldquo;{rec.whyRecommend}&rdquo;</p>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground mb-3">
                  {rec.neighborhood && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{rec.neighborhood}</span>
                  )}
                  {rec.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{rec.phone}</span>
                  )}
                  {rec.website && (
                    <span className="flex items-center gap-1 truncate"><Globe className="w-3 h-3" />{rec.website}</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-cream">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={rec.author.profilePhoto ?? ""} />
                      <AvatarFallback className="bg-sage text-white text-xs">
                        {(rec.author.name ?? "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{rec.author.name}</span>
                    <span className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(rec.createdAt), { addSuffix: true })}</span>
                  </div>
                  <button
                    onClick={() => handleEndorse(rec.id)}
                    disabled={!session}
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors ${
                      endorsed ? "bg-green-100 text-green-700" : "text-navy/60 hover:bg-cream border border-navy/10"
                    } disabled:opacity-50`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Endorse{rec.endorsements.length > 0 ? ` · ${rec.endorsements.length}` : ""}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
        </>
      )}

      {/* Add form dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-navy">Add a Recommendation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Business Name *</Label>
              <Input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} required placeholder="ABC Plumbing" />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={v => v && setForm({...form, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(c => c.value !== "all").map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={2} placeholder="What does this business do?" />
            </div>
            <div className="space-y-1.5">
              <Label>Why do you recommend them? *</Label>
              <Textarea value={form.whyRecommend} onChange={e => setForm({...form, whyRecommend: e.target.value})} required rows={2} placeholder="They did amazing work on our kitchen..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(612) 555-0100" />
              </div>
              <div className="space-y-1.5">
                <Label>Neighborhood</Label>
                <Input value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} placeholder="Edina" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="www.example.com" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-navy text-cream hover:bg-navy-light">
                {submitting ? "Saving..." : "Add Recommendation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
