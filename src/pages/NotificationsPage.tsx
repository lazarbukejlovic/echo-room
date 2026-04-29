import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Bell, Heart, MessageCircle, Radio, UserPlus, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const iconMap: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  room: Radio,
  message: MessageCircle,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      // Mark unread as read
      const unreadIds = (data || []).filter((n) => !n.is_read).map((n) => n.id);
      if (unreadIds.length > 0) {
        await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
      }

      // Fetch actor profiles
      const actorIds = [...new Set((data || []).map((n) => n.actor_id).filter(Boolean))] as string[];
      const { data: profiles } = actorIds.length > 0
        ? await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", actorIds)
        : { data: [] };
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      return (data || []).map((n) => ({ ...n, actorProfile: profileMap.get(n.actor_id || "") }));
    },
    enabled: !!user,
  });

  return (
    <div className="mx-auto max-w-xl">
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-border bg-background/80 backdrop-blur-lg px-4 py-3">
        <Bell className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-bold font-heading">Notifications</h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <Bell className="h-12 w-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold font-heading">No new notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div>
          {notifications.map((n: any) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border ${!n.is_read ? "bg-primary/5" : ""}`}>
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {n.actorProfile?.avatar_url ? (
                    <img src={n.actorProfile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Icon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{n.content}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
