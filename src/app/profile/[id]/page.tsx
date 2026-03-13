"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Church } from "lucide-react";
import { format } from "date-fns";
import PostCard from "@/components/feed/PostCard";

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  location: string | null;
  profilePhoto: string | null;
  bio: string | null;
  createdAt: string;
  church: { id: string; name: string } | null;
  posts: {
    id: string; content: string; category: string; location: string | null;
    isAnonymous: boolean; createdAt: string;
    author: { id: string; name: string | null; location: string | null; profilePhoto: string | null };
    comments: { id: string; content: string; createdAt: string; author: { id: string; name: string | null; profilePhoto: string | null } }[];
    reactions: { id: string; userId: string; type: string }[];
    _count: { comments: number; reactions: number };
  }[];
};

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center text-navy/40 animate-pulse">Loading profile...</div>;
  }
  if (!profile) {
    return <div className="container mx-auto px-4 py-12 text-center text-navy/40">User not found</div>;
  }

  const initials = (profile.name ?? "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const isOwnProfile = session?.user?.id === id;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card className="p-6 border-0 shadow-sm bg-white mb-6">
        <div className="flex items-start gap-5">
          <Avatar className="w-20 h-20 border-4 border-cream shadow">
            <AvatarImage src={profile.profilePhoto ?? ""} />
            <AvatarFallback className="bg-navy text-cream text-2xl font-bold font-playfair">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-playfair text-2xl font-bold text-navy">{profile.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>
              )}
              {profile.church && (
                <span className="flex items-center gap-1"><Church className="w-4 h-4" />{profile.church.name}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
              </span>
            </div>
            {profile.bio && <p className="text-navy/70 mt-3">{profile.bio}</p>}
            {isOwnProfile && (
              <Badge className="mt-2 bg-gold/10 text-gold border-gold/20">Your Profile</Badge>
            )}
          </div>
        </div>
      </Card>

      <h2 className="font-playfair text-xl font-bold text-navy mb-4">Posts</h2>
      {profile.posts.length === 0 ? (
        <div className="text-center py-12 text-navy/40">
          <p>No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profile.posts.filter(p => !p.isAnonymous).map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
