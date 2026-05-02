import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Share2, Radio, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface PostData {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  reactions?: { id: string; user_id: string }[];
  comments?: { id: string }[];
  rooms?: { id: string }[];
  saved_posts?: { id: string }[];
}

interface Props {
  post: PostData;
}

export default function PostCard({ post }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profile = post.profiles;
  const isLiked = post.reactions?.some((r) => r.user_id === user?.id) ?? false;
  const isSaved = post.saved_posts?.some(() => true) ?? false;
  const likeCount = post.reactions?.length ?? 0;
  const commentCount = post.comments?.length ?? 0;
  const hasRoom = (post.rooms?.length ?? 0) > 0;

  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);
  const [optimisticCount, setOptimisticCount] = useState(likeCount);
  const [optimisticSaved, setOptimisticSaved] = useState(isSaved);

  const toggleLike = async () => {
    if (!user) return;
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    setOptimisticCount((c) => c + (newLiked ? 1 : -1));

    if (newLiked) {
      await supabase.from("reactions").insert({ post_id: post.id, user_id: user.id, type: "like" });
    } else {
      await supabase.from("reactions").delete().eq("post_id", post.id).eq("user_id", user.id);
    }
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const toggleSave = async () => {
    if (!user) return;
    const newSaved = !optimisticSaved;
    setOptimisticSaved(newSaved);

    if (newSaved) {
      await supabase.from("saved_posts").insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from("saved_posts").delete().eq("post_id", post.id).eq("user_id", user.id);
    }
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["saved-posts"] });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
  };

  const isOfficial = profile?.username === "echoroom";

  return (
    <article className="my-3 rounded-2xl border border-border/75 bg-card/72 px-4 py-4 shadow-[0_20px_50px_-42px_hsl(var(--ember)/0.4)] backdrop-blur-lg animate-fade-in transition-colors hover:bg-card/88 hover:border-border">
      <div className="flex items-start gap-3">
        <Link to={`/user/${profile?.username}`}>
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0",
            isOfficial ? "bg-gradient-ember" : "bg-secondary"
          )}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className={cn(
                "text-sm font-semibold",
                isOfficial ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {profile?.display_name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link to={`/user/${profile?.username}`} className="font-semibold text-foreground text-sm hover:underline truncate">
              {profile?.display_name || "Unknown"}
            </Link>
            {isOfficial && (
              <span className="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Official
              </span>
            )}
            <span className="text-muted-foreground text-xs">@{profile?.username}</span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
          </div>

          <Link to={`/post/${post.id}`}>
            {post.content && <p className="mt-1.5 text-sm text-foreground whitespace-pre-wrap leading-relaxed">{post.content}</p>}
            {post.image_url && (
              <img src={post.image_url} alt="" className="mt-3 w-full rounded-xl object-cover max-h-96 border border-border/80" />
            )}
          </Link>

          {/* Room indicator — more prominent */}
          {hasRoom && (
            <Link
              to={`/post/${post.id}/room`}
              className="mt-2.5 flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/15 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Room active — join the conversation</span>
              <Users className="h-3 w-3 ml-auto text-primary/60" />
            </Link>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={toggleLike} className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/65 px-2.5 py-1.5 group transition-colors hover:border-primary/30 hover:bg-primary/10">
              <Heart
                className={cn(
                  "h-4 w-4 transition-colors",
                  optimisticLiked ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary"
                )}
              />
              <span className={cn("text-xs", optimisticLiked ? "text-primary" : "text-muted-foreground")}>
                {optimisticCount > 0 ? optimisticCount : ""}
              </span>
            </button>
            <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 rounded-full border border-border/70 bg-background/65 px-2.5 py-1.5 group transition-colors hover:bg-secondary/55">
              <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-xs text-muted-foreground">{commentCount > 0 ? commentCount : ""}</span>
            </Link>
            <button onClick={copyLink} className="group rounded-full border border-border/70 bg-background/65 p-1.5 transition-colors hover:bg-secondary/55">
              <Share2 className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <button onClick={toggleSave} className="group ml-auto rounded-full border border-border/70 bg-background/65 p-1.5 transition-colors hover:border-primary/30 hover:bg-primary/10">
              <Bookmark
                className={cn(
                  "h-4 w-4 transition-colors",
                  optimisticSaved ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
