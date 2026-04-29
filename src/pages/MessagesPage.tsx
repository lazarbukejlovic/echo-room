import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, MessageCircle, Send, PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function MessagesPage() {
  const { user } = useAuth();
  const { threadId } = useParams();

  if (threadId) return <ConversationView threadId={threadId} />;
  return <InboxView />;
}

function InboxView() {
  const { user } = useAuth();

  const { data: threads, isLoading } = useQuery({
    queryKey: ["dm-threads"],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships } = await supabase
        .from("direct_thread_members")
        .select("thread_id")
        .eq("user_id", user.id);
      if (!memberships || memberships.length === 0) return [];

      const threadIds = memberships.map((m) => m.thread_id);
      const { data: threads } = await supabase
        .from("direct_threads")
        .select("*")
        .in("id", threadIds)
        .order("updated_at", { ascending: false });

      // Get other member profiles and last message
      const result = await Promise.all(
        (threads || []).map(async (thread) => {
          const { data: members } = await supabase
            .from("direct_thread_members")
            .select("user_id")
            .eq("thread_id", thread.id)
            .neq("user_id", user.id);
          const otherUserId = members?.[0]?.user_id;
          const { data: profile } = otherUserId
            ? await supabase.from("profiles").select("*").eq("user_id", otherUserId).single()
            : { data: null };
          const { data: lastMsg } = await supabase
            .from("direct_messages")
            .select("content, created_at")
            .eq("thread_id", thread.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          return { ...thread, otherProfile: profile, lastMessage: lastMsg };
        })
      );
      return result;
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-xl">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3">
        <h1 className="text-lg font-bold font-heading">Messages</h1>
        <Link to="/messages/new" className="text-primary hover:text-primary/80"><PenSquare className="h-5 w-5" /></Link>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !threads || threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold font-heading">No messages yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Start a private chat with someone</p>
        </div>
      ) : (
        <div>
          {threads.map((thread: any) => (
            <Link
              key={thread.id}
              to={`/messages/${thread.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary/30 transition-colors"
            >
              <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                {thread.otherProfile?.avatar_url ? (
                  <img src={thread.otherProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">{thread.otherProfile?.display_name?.[0] || "?"}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{thread.otherProfile?.display_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground truncate">{thread.lastMessage?.content || "No messages yet"}</p>
              </div>
              {thread.lastMessage?.created_at && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(thread.lastMessage.created_at), { addSuffix: false })}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ConversationView({ threadId }: { threadId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["dm-messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Get other user profile
  const { data: otherProfile } = useQuery({
    queryKey: ["dm-other-profile", threadId],
    queryFn: async () => {
      const { data: members } = await supabase
        .from("direct_thread_members")
        .select("user_id")
        .eq("thread_id", threadId)
        .neq("user_id", user!.id);
      if (!members?.[0]) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", members[0].user_id).single();
      return data;
    },
    enabled: !!user,
  });

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`dm-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages", filter: `thread_id=eq.${threadId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["dm-messages", threadId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [threadId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !message.trim()) return;
    setSending(true);
    try {
      await supabase.from("direct_messages").insert({ thread_id: threadId, user_id: user.id, content: message.trim() });
      setMessage("");
      // Update thread timestamp
      await supabase.from("direct_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto">
      <header className="flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3 flex-shrink-0">
        <Link to="/messages" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          {otherProfile?.avatar_url ? <img src={otherProfile.avatar_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xs font-semibold text-muted-foreground">{otherProfile?.display_name?.[0]}</span>}
        </div>
        <h1 className="text-base font-semibold font-heading">{otherProfile?.display_name || "..."}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => {
            const isOwn = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm", isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md")}>
                  {msg.content}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-muted-foreground py-12">Say hello 👋</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border bg-background px-4 py-3 flex items-center gap-2 flex-shrink-0 mb-20 md:mb-0">
        <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} className="bg-card border-border" />
        <Button size="icon" onClick={sendMessage} disabled={sending || !message.trim()} className="bg-gradient-ember text-primary-foreground flex-shrink-0">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
