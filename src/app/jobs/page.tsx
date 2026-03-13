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
import { MapPin, DollarSign, Clock } from "lucide-react";
import Link from "next/link";

const JOB_TYPES = [
  { value: "all", label: "All Jobs" },
  { value: "babysitting", label: "🍼 Babysitting" },
  { value: "lawn_care", label: "🌿 Lawn Care" },
  { value: "snow_shoveling", label: "❄️ Snow Shoveling" },
  { value: "tutoring", label: "📚 Tutoring" },
  { value: "pet_sitting", label: "🐾 Pet Sitting" },
  { value: "cleaning", label: "🧹 Cleaning" },
  { value: "errands", label: "🛒 Errands" },
  { value: "other", label: "✨ Other" },
];

type Job = {
  id: string;
  type: string;
  description: string;
  payRate: string | null;
  frequency: string | null;
  contactMethod: string;
  neighborhood: string | null;
  familyName: string | null;
  createdAt: string;
  poster: { id: string; name: string | null; neighborhood: string | null; profilePhoto: string | null };
};

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "babysitting", description: "", payRate: "", frequency: "",
    contactMethod: "", neighborhood: "", familyName: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("type", typeFilter);
    const res = await fetch(`/api/jobs?${params}`);
    if (res.ok) setJobs(await res.json());
    setLoading(false);
  }, [typeFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const job = await res.json();
      setJobs((prev) => [job, ...prev]);
      setShowForm(false);
    }
    setSubmitting(false);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">💼</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-2">Jobs Board</h1>
        <p className="text-navy/60 max-w-md mx-auto">
          Connecting families with trustworthy teens and young adults in our community. Perfect for lawn care, babysitting, tutoring, and more.
        </p>
      </div>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {JOB_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                typeFilter === t.value ? "bg-navy text-cream" : "bg-white text-navy/70 hover:bg-cream border border-navy/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {session ? (
          <Button onClick={() => setShowForm(true)} className="bg-gold hover:bg-gold-light text-navy font-semibold">
            + Post a Job
          </Button>
        ) : (
          <Link href="/sign-in">
            <Button variant="outline" className="border-navy/30 text-navy">Sign In to Post</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-40 animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-playfair text-xl text-navy/50">No jobs posted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const typeInfo = JOB_TYPES.find(t => t.value === job.type);
            return (
              <Card key={job.id} className="p-5 border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{typeInfo?.label?.split(" ")[0] ?? "💼"}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-playfair font-bold text-navy text-lg">
                          {typeInfo?.label?.replace(/^.\s/, "") ?? job.type}
                          {job.familyName && ` — ${job.familyName} Family`}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-muted-foreground">
                          {job.payRate && (
                            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.payRate}</span>
                          )}
                          {job.frequency && (
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.frequency}</span>
                          )}
                          {job.neighborhood && (
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.neighborhood}</span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
                        Open
                      </Badge>
                    </div>

                    <p className="text-navy/70 mt-2 text-sm">{job.description}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-cream flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={job.poster.profilePhoto ?? ""} />
                          <AvatarFallback className="bg-navy text-cream text-xs">
                            {(job.poster.name ?? "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {job.poster.name} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <a
                        href={job.contactMethod.includes("@") ? `mailto:${job.contactMethod}` : `tel:${job.contactMethod}`}
                        className="text-sm font-semibold text-navy hover:text-gold transition-colors"
                      >
                        Contact: {job.contactMethod}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-playfair text-navy">Post a Job</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Job Type *</Label>
              <Select value={form.type} onValueChange={v => v && setForm({...form, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.filter(t => t.value !== "all").map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} placeholder="Describe the job, schedule, requirements..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Pay Rate</Label>
                <Input value={form.payRate} onChange={e => setForm({...form, payRate: e.target.value})} placeholder="$15/hr or $50/week" />
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <Input value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} placeholder="Weekly, As needed..." />
              </div>
              <div className="space-y-1.5">
                <Label>Family/Your Name</Label>
                <Input value={form.familyName} onChange={e => setForm({...form, familyName: e.target.value})} placeholder="Johnson" />
              </div>
              <div className="space-y-1.5">
                <Label>Neighborhood</Label>
                <Input value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} placeholder="Maple Grove" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Contact Method *</Label>
              <Input value={form.contactMethod} onChange={e => setForm({...form, contactMethod: e.target.value})} required placeholder="email@example.com or (612) 555-0100" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-navy text-cream hover:bg-navy-light">
                {submitting ? "Posting..." : "Post Job"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
