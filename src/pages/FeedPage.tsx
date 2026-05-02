import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/PostCard";
import { Loader2, MessageCircle, Radio } from "lucide-react";
import { Link } from "react-router-dom";

const globalPresence = ["🇺🇸 New York", "🇩🇪 Berlin", "🇬🇧 London", "🇳🇱 Amsterdam", "🇮🇹 Milan", "🇭🇷 Zagreb", "🇧🇦 Sarajevo"];
const liveStatus = ["Global conversations", "Room active", "Typing...", "Trending", "Now joining"];

type FeedStatState = {
  usersOnline: string;
  activeRooms: string;
  liveThreads: string;
  trending: string;
};

const rotatingStatStates: FeedStatState[] = [
  { usersOnline: "14", activeRooms: "3", liveThreads: "6", trending: "Now" },
  { usersOnline: "16", activeRooms: "4", liveThreads: "7", trending: "Design" },
  { usersOnline: "13", activeRooms: "2", liveThreads: "5", trending: "Remote" },
  { usersOnline: "15", activeRooms: "5", liveThreads: "8", trending: "Product" },
  { usersOnline: "17", activeRooms: "3", liveThreads: "6", trending: "Live" },
];

export default function FeedPage() {
  const [statIndex, setStatIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, reactions(id, user_id), comments(id), rooms(id)`)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const userIds = [...new Set((data || []).map((p) => p.user_id))] as string[];
      if (userIds.length === 0) return [];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      return (data || []).map((post) => ({ ...post, profiles: profileMap.get(post.user_id) })) as any[];
    },
  });

  // Active rooms count for header
  const { data: activeRoomCount } = useQuery({
    queryKey: ["active-room-count"],
    queryFn: async () => {
      const { count } = await supabase.from("rooms").select("*", { count: "exact", head: true }).eq("is_active", true);
      return count || 0;
    },
  });

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTransitioning(true);

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        setStatIndex((current) => (current + 1) % rotatingStatStates.length);
        setTransitioning(false);
      }, 190);
    }, 24000);

    return () => {
      window.clearInterval(intervalId);
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const currentStats = rotatingStatStates[statIndex];

  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/82 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold font-heading text-foreground">Feed</h1>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary social-pulse" />
              Live now
            </span>
            {activeRoomCount && activeRoomCount > 0 ? (
              <Link
                to="/search"
                className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Radio className="h-3 w-3 animate-pulse" />
                {activeRoomCount} active {activeRoomCount === 1 ? "room" : "rooms"}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="flex items-center border-t border-border/70 px-4 py-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary social-pulse" />
            Live feed metrics
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border/70 px-4 py-2.5 sm:grid-cols-4">
          <StatPill label="Users Online" value={currentStats.usersOnline} transitioning={transitioning} />
          <StatPill label="Active Rooms" value={currentStats.activeRooms} transitioning={transitioning} />
          <StatPill label="Live Threads" value={currentStats.liveThreads} transitioning={transitioning} />
          <StatPill label="Trending" value={currentStats.trending} transitioning={transitioning} />
        </div>

        <div className="space-y-2 border-t border-border/70 px-4 py-2.5">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 p-2">
            <div className="social-marquee flex w-max items-center gap-2 whitespace-nowrap text-xs text-muted-foreground">
              {[...globalPresence, ...globalPresence].map((chip, index) => (
                <span key={`${chip}-${index}`} className="rounded-full border border-border/80 bg-card/75 px-2 py-1">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {liveStatus.map((status) => (
              <span key={status} className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-primary/90" />
                {status}
              </span>
            ))}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="px-4 py-20">
          <div className="mx-auto max-w-sm rounded-3xl border border-border/70 bg-card/62 p-8 text-center shadow-[0_24px_60px_-42px_hsl(var(--ember)/0.35)] backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold font-heading text-foreground">No posts yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to share something worth talking about.</p>
          </div>
        </div>
      ) : (
        <div className="px-2 pb-3 sm:px-3">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, transitioning }: { label: string; value: string; transitioning: boolean }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/55 px-2.5 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 h-5 text-sm font-semibold text-foreground transition-all duration-200 ${transitioning ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"}`}>
        {value}
      </p>
    </div>
  );
}
