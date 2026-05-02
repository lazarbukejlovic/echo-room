import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/PostCard";
import { Bookmark, Loader2 } from "lucide-react";

export default function SavedPostsPage() {
  const { user } = useAuth();

  const { data: savedPosts, isLoading } = useQuery({
    queryKey: ["saved-posts"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) return [];

      const postIds = data.map((s) => s.post_id);
      const { data: posts, error: postsErr } = await supabase
        .from("posts")
        .select("*, reactions(id, user_id), comments(id), rooms(id)")
        .in("id", postIds);
      if (postsErr) throw postsErr;

      const userIds = [...new Set((posts || []).map((p) => p.user_id))] as string[];
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, display_name, avatar_url").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      return (posts || []).map((post) => ({ ...post, profiles: profileMap.get(post.user_id), saved_posts: [{ id: "saved" }] })) as any[];
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-border/80 bg-background/82 backdrop-blur-xl px-4 py-3">
        <Bookmark className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold font-heading">Saved</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !savedPosts || savedPosts.length === 0 ? (
        <div className="px-4 py-20">
          <div className="mx-auto max-w-sm rounded-3xl border border-border/70 bg-card/62 p-8 text-center shadow-[0_24px_60px_-42px_hsl(var(--ember)/0.35)] backdrop-blur-md">
            <Bookmark className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold font-heading">No saved posts</h2>
            <p className="mt-1 text-sm text-muted-foreground">Save posts to revisit them later</p>
          </div>
        </div>
      ) : (
        <div className="px-2 pb-3 sm:px-3">
          {savedPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
