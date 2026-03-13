"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Globe, Phone, Search } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "contractors", label: "🔨 Contractors" },
  { value: "healthcare", label: "🏥 Healthcare" },
  { value: "legal", label: "⚖️ Legal" },
  { value: "financial", label: "💰 Financial" },
  { value: "food", label: "🍽️ Food" },
  { value: "retail", label: "🛍️ Retail" },
  { value: "services", label: "🔧 Services" },
  { value: "education", label: "📚 Education" },
];

type Business = {
  id: string;
  name: string;
  ownerName: string | null;
  category: string;
  description: string;
  christianStatement: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  neighborhood: string | null;
  owner: { id: string; name: string | null };
};

export default function DirectoryPage() {
  const { data: session } = useSession();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", ownerName: "", category: "services",
    description: "", christianStatement: "", website: "", phone: "", address: "", neighborhood: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    const res = await fetch(`/api/directory?${params}`);
    if (res.ok) setBusinesses(await res.json());
    setLoading(false);
  }, [category, search]);

  useEffect(() => { fetchBusinesses(); }, [fetchBusinesses]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/directory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const biz = await res.json();
      setBusinesses((prev) => [biz, ...prev]);
      setShowForm(false);
    }
    setSubmitting(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏪</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-2">Christian Business Directory</h1>
        <p className="text-navy/60 max-w-md mx-auto">
          Support businesses owned by people of faith. Built on trust, integrity, and community.
        </p>
      </div>

      {/* Search + Action */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search businesses..."
            className="pl-9 border-navy/20"
          />
        </div>
        {session ? (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-light text-navy font-semibold">
            + List Your Business
          </Button>
        ) : (
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy">Sign In to List</Button>
          </Link>
        )}
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
              category === c.value ? "bg-navy text-cream" : "bg-white text-navy/70 hover:bg-cream border border-navy/10"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />)}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-playfair text-xl text-navy/50">No businesses found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((biz) => {
            const catInfo = CATEGORIES.find(c => c.value === biz.category);
            return (
              <Card key={biz.id} className="p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-playfair font-bold text-navy text-lg leading-tight">{biz.name}</h3>
                    {biz.ownerName && <p className="text-xs text-muted-foreground mt-0.5">Owner: {biz.ownerName}</p>}
                  </div>
                  <span className="text-lg ml-2">{catInfo?.label?.split(" ")[0] ?? "🏪"}</span>
                </div>

                <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-medium self-start mb-2 capitalize">
                  {catInfo?.label?.replace(/^.\s/, "") ?? biz.category}
                </span>

                <p className="text-sm text-navy/70 mb-2 flex-1">{biz.description}</p>

                {biz.christianStatement && (
                  <p className="text-xs text-sage italic border-l-2 border-sage/30 pl-2 mb-3">
                    &ldquo;{biz.christianStatement}&rdquo;
                  </p>
                )}

                <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-auto pt-3 border-t border-cream">
                  {biz.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{biz.address}</span>}
                  {biz.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 flex-shrink-0" />{biz.phone}</span>}
                  {biz.website && <span className="flex items-center gap-1 truncate"><Globe className="w-3 h-3 flex-shrink-0" />{biz.website}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-navy">List Your Business</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Business Name *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Faithful Plumbing Co." />
              </div>
              <div className="space-y-1.5">
                <Label>Owner Name</Label>
                <Input value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} placeholder="John Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category ?? ""} onValueChange={v => v && setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter(c => c.value !== "all").map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={2} placeholder="What does your business do?" />
            </div>
            <div className="space-y-1.5">
              <Label>Why we&apos;re a Christian business</Label>
              <Textarea value={form.christianStatement} onChange={e => setForm({...form, christianStatement: e.target.value})} rows={2} placeholder="We operate our business on Biblical principles of honesty and service..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(612) 555-0100" />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="www.example.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main St, Edina, MN" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-navy text-cream hover:bg-navy-light">
                {submitting ? "Saving..." : "List Business"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
