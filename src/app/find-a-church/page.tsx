"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Phone, Clock, Users } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";

const DENOMINATIONS = [
  { value: "all", label: "All Denominations" },
  { value: "evangelical", label: "Evangelical" },
  { value: "baptist", label: "Baptist" },
  { value: "lutheran", label: "Lutheran" },
  { value: "methodist", label: "Methodist" },
  { value: "presbyterian", label: "Presbyterian" },
  { value: "catholic", label: "Catholic" },
  { value: "non-denominational", label: "Non-Denominational" },
  { value: "charismatic", label: "Charismatic" },
];

const STYLES = [
  { value: "all", label: "All Styles" },
  { value: "traditional", label: "Traditional" },
  { value: "contemporary", label: "Contemporary" },
  { value: "blended", label: "Blended" },
];

type Church = {
  id: string;
  name: string;
  denomination: string | null;
  address: string | null;
  neighborhood: string | null;
  serviceTimes: string | null;
  website: string | null;
  phone: string | null;
  description: string | null;
  photoUrl: string | null;
  serviceStyle: string | null;
  featuredPartner: boolean;
  attendees: { id: string; user: { id: string; name: string | null; profilePhoto: string | null } }[];
  _count: { attendees: number };
};

export default function FindAChurchPage() {
  const { data: session } = useSession();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [denomination, setDenomination] = useState("all");
  const [serviceStyle, setServiceStyle] = useState("all");

  const fetchChurches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (denomination !== "all") params.set("denomination", denomination);
    if (serviceStyle !== "all") params.set("serviceStyle", serviceStyle);
    const res = await fetch(`/api/churches?${params}`);
    if (res.ok) setChurches(await res.json());
    setLoading(false);
  }, [denomination, serviceStyle]);

  useEffect(() => { fetchChurches(); }, [fetchChurches]);

  async function handleAttend(churchId: string) {
    if (!session) return;
    const res = await fetch(`/api/churches/${churchId}/attend`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setChurches((prev) =>
        prev.map((c) =>
          c.id === churchId
            ? {
                ...c,
                attendees: data.attending
                  ? [...c.attendees, { id: Date.now().toString(), user: { id: session.user.id, name: session.user.name ?? null, profilePhoto: session.user.image ?? null } }]
                  : c.attendees.filter((a) => a.user.id !== session.user.id),
              }
            : c
        )
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <SearchBar />
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">⛪</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-navy mb-3">
          Find a Church Home
        </h1>
        <p className="text-navy/70 max-w-xl mx-auto leading-relaxed">
          Finding a church home is one of the best things you can do for your faith and family.
          Explore these wonderful Twin Cities congregations and find where you belong.
        </p>
        <div className="mt-4 inline-block bg-gold/10 border border-gold/20 px-5 py-3 rounded-xl">
          <p className="text-sm text-navy/70 italic">
            &ldquo;And let us not neglect our meeting together, as some people do, but encourage one another.&rdquo; — Hebrews 10:25
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Select value={denomination} onValueChange={v => v && setDenomination(v)}>
          <SelectTrigger className="w-[200px] border-navy/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DENOMINATIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={serviceStyle} onValueChange={v => v && setServiceStyle(v)}>
          <SelectTrigger className="w-[180px] border-navy/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STYLES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {churches.length} church{churches.length !== 1 ? "es" : ""} listed
        </span>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Featured Founding Partner Churches */}
          {churches.some(c => c.featuredPartner) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold tracking-widest text-gold uppercase">⭐ Featured Founding Partners</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {churches.filter(c => c.featuredPartner).map((church) => (
                  <Card key={church.id} className="border-2 border-gold/40 shadow-sm bg-gradient-to-br from-white to-gold/5 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-2 bg-gradient-to-r from-gold to-gold/60" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-playfair font-bold text-navy text-xl leading-tight">{church.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">Founding Partner</span>
                            {church.denomination && (
                              <Badge variant="outline" className="text-xs border-navy/20 text-navy/70">{church.denomination}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {church.description && <p className="text-sm text-navy/70 mt-2">{church.description}</p>}
                      {church.neighborhood && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><MapPin className="w-3 h-3" />{church.neighborhood}</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <div className="border-t border-cream my-6" />
            </div>
          )}
        <div className="grid gap-6 md:grid-cols-2">
          {churches.filter(c => !c.featuredPartner).map((church) => {
            const isAttending = session?.user?.id
              ? church.attendees.some((a) => a.user.id === session.user.id)
              : false;
            return (
              <Card key={church.id} className="border-0 shadow-sm bg-white overflow-hidden hover:shadow-md transition-shadow">
                {/* Color header */}
                <div className="h-2 bg-gradient-to-r from-navy to-navy-light" />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-playfair font-bold text-navy text-xl leading-tight">{church.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {church.denomination && (
                          <Badge variant="outline" className="text-xs border-navy/20 text-navy/70">
                            {church.denomination}
                          </Badge>
                        )}
                        {church.serviceStyle && (
                          <Badge variant="outline" className="text-xs border-sage/30 text-sage capitalize">
                            {church.serviceStyle}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-3xl">✝️</div>
                  </div>

                  {church.description && (
                    <p className="text-sm text-navy/70 mb-4 leading-relaxed">{church.description}</p>
                  )}

                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    {church.address && (
                      <p className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0 text-gold" />{church.address}</p>
                    )}
                    {church.serviceTimes && (
                      <p className="flex items-center gap-2"><Clock className="w-4 h-4 flex-shrink-0 text-gold" />{church.serviceTimes}</p>
                    )}
                    {church.phone && (
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0 text-gold" />{church.phone}</p>
                    )}
                    {church.website && (
                      <p className="flex items-center gap-2"><Globe className="w-4 h-4 flex-shrink-0 text-gold" />{church.website}</p>
                    )}
                  </div>

                  {/* Attendees */}
                  {church._count.attendees > 0 && (
                    <div className="mb-4 pb-3 border-b border-cream">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {church._count.attendees} community member{church._count.attendees !== 1 ? "s" : ""} attend here
                      </p>
                      <div className="flex -space-x-2">
                        {church.attendees.slice(0, 8).map((attendee) => (
                          <Avatar key={attendee.id} className="w-7 h-7 border-2 border-white">
                            <AvatarImage src={attendee.user.profilePhoto ?? ""} />
                            <AvatarFallback className="bg-navy text-cream text-xs">
                              {(attendee.user.name ?? "?")[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {church._count.attendees > 8 && (
                          <div className="w-7 h-7 rounded-full bg-cream border-2 border-white flex items-center justify-center text-xs text-navy/60 font-medium">
                            +{church._count.attendees - 8}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    {church.website && (
                      <a
                        href={church.website.startsWith("http") ? church.website : `https://${church.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gold hover:underline font-medium"
                      >
                        Visit Website →
                      </a>
                    )}
                    {session ? (
                      <Button
                        onClick={() => handleAttend(church.id)}
                        size="sm"
                        className={`ml-auto ${
                          isAttending
                            ? "bg-sage/20 text-sage hover:bg-sage/30 border border-sage/30"
                            : "bg-navy hover:bg-navy-light text-cream"
                        }`}
                      >
                        {isAttending ? "✓ I attend here" : "I attend here"}
                      </Button>
                    ) : (
                      <Link href="/sign-in" className="ml-auto">
                        <Button size="sm" variant="outline" className="border-navy/30 text-navy text-xs">
                          Sign in to mark attendance
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        </>
      )}

      {/* CTA */}
      <div className="mt-12 text-center bg-navy rounded-2xl p-8 text-cream">
        <h2 className="font-playfair text-2xl font-bold mb-2">Don&apos;t see your church?</h2>
        <p className="text-cream/70 mb-4 max-w-md mx-auto">
          Our directory is admin-curated to ensure accuracy. Contact us to have your church added.
        </p>
        <a href="mailto:hello@gathered.community" className="inline-flex items-center gap-2 bg-gold hover:bg-gold-light text-navy font-semibold px-5 py-2.5 rounded-lg transition-colors">
          Request to Add Your Church
        </a>
      </div>
    </div>
  );
}
