import { useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageCircle, Radio } from "lucide-react";
import AnimatedAmbientBackground from "@/components/background/AnimatedAmbientBackground";

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, username: username || `user_${Date.now()}` },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Welcome to EchoRoom!", description: "Check your email to confirm your account." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <AnimatedAmbientBackground variant="auth" />

      <div className="pointer-events-none absolute left-[8%] top-[20%] hidden rounded-2xl border border-primary/20 bg-card/55 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md lg:block social-float">
        "Design thread is live"
      </div>
      <div className="pointer-events-none absolute right-[9%] top-[28%] hidden rounded-2xl border border-primary/20 bg-card/55 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md lg:block social-float" style={{ animationDelay: "1.2s" }}>
        "3 people typing..."
      </div>
      <div className="pointer-events-none absolute left-[12%] top-[72%] hidden rounded-full border border-primary/20 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-md md:block social-drift">
        🇪🇸 Madrid
      </div>
      <div className="pointer-events-none absolute right-[14%] top-[76%] hidden rounded-full border border-primary/20 bg-card/50 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-md md:block social-drift" style={{ animationDelay: "1.5s" }}>
        14 users online
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        <div className="relative rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-[0_32px_120px_-48px_hsl(var(--ember)/0.6)] backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute inset-x-8 -top-8 h-20 rounded-full bg-primary/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-12 -bottom-10 h-16 rounded-full bg-primary/20 blur-2xl" />

          {/* Brand */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-ember glow-ember">
              <MessageCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">EchoRoom</h1>
            <p className="mt-2 text-sm text-muted-foreground">Where posts become conversations</p>
            <p className="mt-1 text-xs text-muted-foreground/90">A live social platform where ideas become active rooms.</p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary">
              <Radio className="h-3.5 w-3.5 social-pulse" />
              Live now: global conversations
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="your_username"
                    required
                    className="bg-card border-border"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-card border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-card border-border"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-ember text-primary-foreground glow-ember" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
