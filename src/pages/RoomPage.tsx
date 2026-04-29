import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Loader2, Radio, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function RoomPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: room } = useQuery({
    queryKey: ["room", postId],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").eq("post_id", postId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["room-messages", room?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("room_messages")
        .select("*, profiles:user_id!inner(username, display_name, avatar_url)")
        .eq("room_id", room!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!room?.id,
  });

  // Join room
  useEffect(() => {
    if (!room?.id || !user?.id) return;
    supabase.from("room_members").upsert({ room_id: room.id, user_id: user.id, is_online: true }).then();
    return () => {
      supabase.from("room_members").update({ is_online: false }).eq("room_id", room.id).eq("user_id", user.id).then();
    };
  }, [room?.id, user?.id]);

  // Realtime subscription
  useEffect(() => {
    if (!room?.id) return;
    const channel = supabase
      .channel(`room-${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_messages", filter: `room_id=eq.${room.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["room-messages", room.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [room?.id, queryClient]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: memberCount } = useQuery({
    queryKey: ["room-members", room?.id],
    queryFn: async () => {
      const { count } = await supabase.from("room_members").select("*", { count: "exact", head: true }).eq("room_id", room!.id).eq("is_online", true);
      return count || 0;
    },
    enabled: !!room?.id,
    refetchInterval: 10000,
  });

  const sendMessage = async () => {
    if (!user || !room || !message.trim()) return;
    setSending(true);
    try {
      await supabase.from("room_messages").insert({ room_id: room.id, user_id: user.id, content: message.trim() });
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!room) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3 flex-shrink-0">
        <Link to={`/post/${postId}`} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary animate-pulse-ember" />
            <h1 className="text-base font-bold font-heading">{room.name}</h1>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" /> {memberCount || 0} online
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messagesLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg: any) => {
            const isOwn = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                {!isOwn && (
                  <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {msg.profiles?.avatar_url ? (
                      <img src={msg.profiles.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">{msg.profiles?.display_name?.[0] || "?"}</span>
                    )}
                  </div>
                )}
                <div className={cn("max-w-[75%]", isOwn && "text-right")}>
                  {!isOwn && <p className="text-xs font-medium text-muted-foreground mb-0.5">{msg.profiles?.display_name}</p>}
                  <div className={cn("rounded-2xl px-3 py-2 text-sm", isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md")}>
                    {msg.content}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Radio className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Room is open. Say something!</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3 flex items-center gap-2 flex-shrink-0 mb-20 md:mb-0">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-card border-border"
        />
        <Button size="icon" onClick={sendMessage} disabled={sending || !message.trim()} className="bg-gradient-ember text-primary-foreground flex-shrink-0">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
