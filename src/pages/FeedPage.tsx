import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/PostCard";
import { Loader2, MessageCircle, Radio } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeedPage() {
  const { user } = useAuth();

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

  return (
    <div className="mx-auto max-w-xl">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold font-heading text-foreground">Feed</h1>
        </div>
        {activeRoomCount && activeRoomCount > 0 ? (
          <Link
            to="/search"
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            {activeRoomCount} active {activeRoomCount === 1 ? "room" : "rooms"}
          </Link>
        ) : null}
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold font-heading text-foreground">No posts yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to share something worth talking about.</p>
        </div>
      ) : (
        <div>
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
