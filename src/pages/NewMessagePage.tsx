import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewMessagePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["search-users-dm", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user!.id)
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);
      return data || [];
    },
    enabled: !!user && query.length >= 2,
  });

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    try {
      // Check existing thread
      const { data: myThreads } = await supabase.from("direct_thread_members").select("thread_id").eq("user_id", user.id);
      if (myThreads && myThreads.length > 0) {
        const threadIds = myThreads.map((t) => t.thread_id);
        const { data: shared } = await supabase
          .from("direct_thread_members")
          .select("thread_id")
          .eq("user_id", otherUserId)
          .in("thread_id", threadIds);
        if (shared && shared.length > 0) {
          navigate(`/messages/${shared[0].thread_id}`);
          return;
        }
      }

      // Create new thread
      const { data: newThread, error } = await supabase.from("direct_threads").insert({}).select().single();
      if (error) throw error;
      await supabase.from("direct_thread_members").insert([
        { thread_id: newThread.id, user_id: user.id },
        { thread_id: newThread.id, user_id: otherUserId },
      ]);
      navigate(`/messages/${newThread.id}`);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/messages" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-bold font-heading">New message</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search for someone..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 bg-card border-border" />
        </div>
      </header>

      <div className="px-4 py-4">
        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
        {users && users.map((u: any) => (
          <button
            key={u.id}
            onClick={() => startConversation(u.user_id)}
            className="w-full flex items-center gap-3 rounded-xl p-2 hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
              {u.avatar_url ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-sm font-semibold text-muted-foreground">{u.display_name?.[0]}</span>}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{u.display_name}</p>
              <p className="text-xs text-muted-foreground">@{u.username}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
