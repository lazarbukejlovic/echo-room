import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Users, Radio, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import PostCard from "@/components/PostCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query.trim()) return { users: [], posts: [] };
      const [usersRes, postsRes] = await Promise.all([
        supabase.from("profiles").select("*").or(`username.ilike.%${query}%,display_name.ilike.%${query}%`).limit(10),
        supabase.from("posts").select("id, content, created_at, user_id").ilike("content", `%${query}%`).limit(10),
      ]);
      return { users: usersRes.data || [], posts: postsRes.data || [] };
    },
    enabled: query.length >= 2,
  });

  // Suggested people (users the current user doesn't follow)
  const { data: suggestedPeople } = useQuery({
    queryKey: ["suggested-people", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: following } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);
      const followingIds = (following || []).map((f) => f.following_id);
      const excludeIds = [user.id, ...followingIds];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .not("user_id", "in", `(${excludeIds.join(",")})`)
        .limit(6);
      return profiles || [];
    },
    enabled: !!user,
  });

  // Trending posts (most reactions recently)
  const { data: trendingPosts } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select("*, reactions(id, user_id), comments(id), rooms(id)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!posts || posts.length === 0) return [];

      // Sort by engagement
      const sorted = posts
        .map((p) => ({
          ...p,
          engagement: (p.reactions?.length || 0) + (p.comments?.length || 0) * 2,
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5);

      const userIds = [...new Set(sorted.map((p) => p.user_id))] as string[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      return sorted.map((post) => ({ ...post, profiles: profileMap.get(post.user_id) })) as any[];
    },
  });

  // Active rooms
  const { data: activeRooms } = useQuery({
    queryKey: ["active-rooms"],
    queryFn: async () => {
      const { data: rooms } = await supabase
        .from("rooms")
        .select("*, posts(id, content, user_id), room_members(id)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(4);
      if (!rooms) return [];

      const userIds = [...new Set(rooms.map((r: any) => r.posts?.user_id).filter(Boolean))] as string[];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      return rooms.map((r: any) => ({
        ...r,
        postProfile: profileMap.get(r.posts?.user_id),
        memberCount: Array.isArray(r.room_members) ? r.room_members.length : 0,
      }));
    },
  });

  const isSearching = query.length >= 2;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/82 backdrop-blur-xl px-4 py-3">
        <h1 className="text-lg font-bold font-heading mb-3">Discover</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people or posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
      </header>

      <div className="px-4 py-4 sm:px-5">
        {/* Search results */}
        {isSearching ? (
          <>
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {results && results.users.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> People
                </h2>
                <div className="space-y-1 rounded-2xl border border-border/65 bg-card/55 p-2 backdrop-blur-md">
                  {results.users.map((u: any) => (
                    <UserRow key={u.id} user={u} />
                  ))}
                </div>
              </div>
            )}
            {results && results.posts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Posts</h2>
                <div className="space-y-1 rounded-2xl border border-border/65 bg-card/55 p-2 backdrop-blur-md">
                  {results.posts.map((p: any) => (
                    <Link key={p.id} to={`/post/${p.id}`} className="block rounded-xl p-3 hover:bg-secondary/50 transition-colors">
                      <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {!isLoading && results && results.users.length === 0 && results.posts.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
            )}
          </>
        ) : (
          <>
            {/* Active Rooms */}
            {activeRooms && activeRooms.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  Active Rooms
                </h2>
                <div className="space-y-2 rounded-2xl border border-border/65 bg-card/55 p-3 backdrop-blur-md">
                  {activeRooms.map((room: any) => (
                    <Link
                      key={room.id}
                      to={`/post/${room.post_id}/room`}
                      className="flex items-start gap-3 rounded-xl p-3 bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 flex-shrink-0">
                        <Radio className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-1">{room.posts?.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            by {room.postProfile?.display_name || "Unknown"}
                          </span>
                          <span className="text-xs text-primary font-medium">
                            {room.memberCount} {room.memberCount === 1 ? "member" : "members"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Suggested People */}
            {suggestedPeople && suggestedPeople.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  People to follow
                </h2>
                <div className="space-y-1 rounded-2xl border border-border/65 bg-card/55 p-2 backdrop-blur-md">
                  {suggestedPeople.map((u: any) => (
                    <UserRow key={u.id} user={u} showBio />
                  ))}
                </div>
              </section>
            )}

            {/* Trending Posts */}
            {trendingPosts && trendingPosts.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-primary" />
                  Trending
                </h2>
                <div className="-mx-2 sm:-mx-1">
                  {trendingPosts.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, showBio = false }: { user: any; showBio?: boolean }) {
  return (
    <Link
      to={`/user/${user.username}`}
      className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-secondary/50 transition-colors"
    >
      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-muted-foreground">
            {user.display_name?.[0]?.toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{user.display_name}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
        {showBio && user.bio && (
          <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">{user.bio}</p>
        )}
      </div>
    </Link>
  );
}
