import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Radio, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PostDetailPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, reactions(id, user_id), comments(id), rooms(id)`)
        .eq("id", postId!)
        .single();
      if (error) throw error;
      // Fetch profile separately
      const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("user_id", data.user_id).single();
      return { ...data, profiles: profile } as any;
    },
    enabled: !!postId,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles:user_id(username, display_name, avatar_url)")
        .eq("post_id", postId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const handleComment = async () => {
    if (!user || !comment.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({ post_id: postId!, user_id: user.id, content: comment.trim() });
      if (error) throw error;
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const openRoom = async () => {
    if (!user || !postId) return;
    try {
      const { data: existing } = await supabase.from("rooms").select("id").eq("post_id", postId).single();
      if (existing) {
        window.location.href = `/post/${postId}/room`;
        return;
      }
      const { error } = await supabase.from("rooms").insert({ post_id: postId, created_by: user.id, name: "Discussion" });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      window.location.href = `/post/${postId}/room`;
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!post) {
    return <div className="py-12 text-center text-muted-foreground">Post not found</div>;
  }

  const roomsArr = Array.isArray(post.rooms) ? post.rooms : post.rooms ? [post.rooms] : [];
  const hasRoom = roomsArr.length > 0;

  return (
    <div className="mx-auto max-w-xl">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold font-heading">Post</h1>
      </header>

      <PostCard post={post} />

      {/* Open room */}
      <div className="border-b border-border px-4 py-3">
        <button
          onClick={openRoom}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
        >
          <Radio className="h-4 w-4 text-primary" />
          {hasRoom ? "Join the room" : "Open a room"}
        </button>
      </div>

      {/* Comments */}
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Comments</h2>
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((c: any) => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  {c.profiles?.avatar_url ? (
                    <img src={c.profiles.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">{c.profiles?.display_name?.[0] || "?"}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.profiles?.display_name}</span>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
        )}
      </div>

      {/* Comment input */}
      {user && (
        <div className="sticky bottom-20 md:bottom-0 border-t border-border bg-background px-4 py-3 flex items-end gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={1}
            className="resize-none bg-card border-border text-sm flex-1"
          />
          <Button size="icon" onClick={handleComment} disabled={submitting || !comment.trim()} className="bg-gradient-ember text-primary-foreground flex-shrink-0">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
