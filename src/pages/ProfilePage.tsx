import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Loader2, MapPin, UserPlus, UserMinus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // If no username, show own profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", "username", username || "self"],
    queryFn: async () => {
      if (username) {
        const { data, error } = await supabase.from("profiles").select("*").eq("username", username).single();
        if (error) throw error;
        return data;
      } else if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (error) throw error;
        return data;
      }
      return null;
    },
    enabled: !!username || !!user,
  });

  const isOwnProfile = profile?.user_id === user?.id;

  const { data: posts } = useQuery({
    queryKey: ["user-posts", profile?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, reactions(id, user_id), comments(id), rooms(id)")
        .eq("user_id", profile!.user_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((p) => ({ ...p, profiles: { username: profile!.username, display_name: profile!.display_name, avatar_url: profile!.avatar_url } })) as any[];
    },
    enabled: !!profile?.user_id,
  });

  const { data: followerCount } = useQuery({
    queryKey: ["followers-count", profile?.user_id],
    queryFn: async () => {
      const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile!.user_id);
      return count || 0;
    },
    enabled: !!profile?.user_id,
  });

  const { data: followingCount } = useQuery({
    queryKey: ["following-count", profile?.user_id],
    queryFn: async () => {
      const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile!.user_id);
      return count || 0;
    },
    enabled: !!profile?.user_id,
  });

  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", user?.id, profile?.user_id],
    queryFn: async () => {
      const { data } = await supabase.from("follows").select("id").eq("follower_id", user!.id).eq("following_id", profile!.user_id).maybeSingle();
      return !!data;
    },
    enabled: !!user && !!profile && !isOwnProfile,
  });

  const toggleFollow = async () => {
    if (!user || !profile) return;
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.user_id);
    } else {
      await supabase.from("follows").insert({ follower_id: user.id, following_id: profile.user_id });
    }
    queryClient.invalidateQueries({ queryKey: ["is-following"] });
    queryClient.invalidateQueries({ queryKey: ["followers-count"] });
  };

  if (profileLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!profile) {
    return <div className="py-12 text-center text-muted-foreground">User not found</div>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/80 bg-background/82 backdrop-blur-xl px-4 py-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-lg font-bold font-heading">{profile.display_name}</h1>
      </header>

      {/* Profile header */}
      <div className="m-3 rounded-2xl border border-border/70 bg-card/66 px-4 py-6 shadow-[0_24px_60px_-42px_hsl(var(--ember)/0.35)] backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{profile.display_name?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold font-heading text-foreground">{profile.display_name}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-2 text-sm text-foreground/90">{profile.bio}</p>}
            {profile.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {profile.location}
              </p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span><strong className="text-foreground">{followingCount ?? 0}</strong> <span className="text-muted-foreground">following</span></span>
              <span><strong className="text-foreground">{followerCount ?? 0}</strong> <span className="text-muted-foreground">followers</span></span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          {isOwnProfile ? (
            <Link to="/settings">
              <Button variant="outline" size="sm" className="w-full border-border text-foreground">
                <Edit className="h-4 w-4 mr-1" /> Edit profile
              </Button>
            </Link>
          ) : (
            <Button
              variant={isFollowing ? "outline" : "default"}
              size="sm"
              className={isFollowing ? "w-full border-border text-foreground" : "w-full bg-gradient-ember text-primary-foreground"}
              onClick={toggleFollow}
            >
              {isFollowing ? <><UserMinus className="h-4 w-4 mr-1" /> Unfollow</> : <><UserPlus className="h-4 w-4 mr-1" /> Follow</>}
            </Button>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="px-2 pb-3 sm:px-3">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="rounded-2xl border border-border/70 bg-card/62 py-12 text-center text-sm text-muted-foreground backdrop-blur-md">No posts yet</p>
        )}
      </div>
    </div>
  );
}
