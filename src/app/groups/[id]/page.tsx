"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, MapPin, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

const GROUP_TYPES: Record<string, { label: string; emoji: string }> = {
  bible_study: { label: "Bible Study", emoji: "📖" },
  moms: { label: "Moms Group", emoji: "👩‍👧" },
  mens: { label: "Men's Group", emoji: "👨" },
  youth: { label: "Youth Group", emoji: "🙌" },
  neighborhood: { label: "Neighborhood", emoji: "🏘️" },
  young_families: { label: "Young Families", emoji: "👨‍👩‍👧‍👦" },
  seniors: { label: "Seniors", emoji: "❤️" },
  other: { label: "Other", emoji: "✝️" },
};

type GroupDetail = {
  id: string;
  name: string;
  description: string;
  type: string;
  meetingFrequency: string | null;
  location: string | null;
  isVirtual: boolean;
  createdAt: string;
  leader: { id: string; name: string | null; profilePhoto: string | null; neighborhood: string | null };
  members: { id: string; joinedAt: string; user: { id: string; name: string | null; profilePhoto: string | null; neighborhood: string | null } }[];
  _count: { members: number };
};

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${id}`).then(r => r.json()).then(setGroup).finally(() => setLoading(false));
  }, [id]);

  const isMember = session?.user?.id ? group?.members.some(m => m.user.id === session.user.id) : false;

  async function handleJoin() {
    if (!session || !group) return;
    setJoining(true);
    const res = await fetch(`/api/groups/${id}/join`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      if (data.joined) {
        setGroup(prev => prev ? {
          ...prev,
          members: [...prev.members, { id: Date.now().toString(), joinedAt: new Date().toISOString(), user: { id: session.user.id, name: session.user.name ?? null, profilePhoto: session.user.image ?? null, neighborhood: session.user.neighborhood ?? null } }],
        } : prev);
      } else {
        setGroup(prev => prev ? {
          ...prev,
          members: prev.members.filter(m => m.user.id !== session.user.id),
        } : prev);
      }
    }
    setJoining(false);
  }

  if (loading) return <div className="container mx-auto px-4 py-12 text-center"><div className="animate-pulse text-navy/40">Loading group...</div></div>;
  if (!group) return <div className="container mx-auto px-4 py-12 text-center text-navy/40">Group not found</div>;

  const typeInfo = GROUP_TYPES[group.type] ?? { label: group.type, emoji: "✝️" };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Link href="/groups" className="inline-flex items-center gap-1.5 text-navy/60 hover:text-navy text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Groups
      </Link>

      <Card className="p-6 border-0 shadow-sm bg-white mb-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">{typeInfo.emoji}</div>
          <div className="flex-1">
            <h1 className="font-playfair text-2xl font-bold text-navy">{group.name}</h1>
            <Badge variant="outline" className="text-sm mt-1 border-sage/30 text-sage">{typeInfo.label}</Badge>
            <p className="text-navy/70 mt-3 leading-relaxed">{group.description}</p>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />{group._count.members} member{group._count.members !== 1 ? "s" : ""}
              </span>
              {group.meetingFrequency && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />{group.meetingFrequency}
                </span>
              )}
              {group.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />{group.isVirtual ? "Virtual" : group.location}
                </span>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-cream flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={group.leader.profilePhoto ?? ""} />
                  <AvatarFallback className="bg-gold text-navy text-sm font-bold">
                    {(group.leader.name ?? "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Group Leader</p>
                  <p className="text-sm font-semibold text-navy">{group.leader.name}</p>
                </div>
              </div>

              {session && (
                <Button
                  onClick={handleJoin}
                  disabled={joining || group.leader.id === session.user.id}
                  className={isMember ? "border-navy text-navy bg-white hover:bg-cream border" : "bg-navy text-cream hover:bg-navy-light"}
                >
                  {joining ? "..." : isMember ? "Leave Group" : "Join Group"}
                </Button>
              )}
              {!session && (
                <Link href="/sign-in">
                  <Button className="bg-navy text-cream hover:bg-navy-light">Sign In to Join</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Members */}
      <h2 className="font-playfair text-xl font-bold text-navy mb-4">Members</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {group.members.map((member) => (
          <Card key={member.id} className="p-3 border-0 shadow-sm bg-white flex items-center gap-2.5">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarImage src={member.user.profilePhoto ?? ""} />
              <AvatarFallback className="bg-sage text-white text-sm font-semibold">
                {(member.user.name ?? "?")[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy truncate">{member.user.name}</p>
              {member.user.neighborhood && (
                <p className="text-xs text-muted-foreground truncate">{member.user.neighborhood}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
