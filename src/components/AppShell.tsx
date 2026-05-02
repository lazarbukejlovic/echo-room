import { Outlet, NavLink } from "react-router-dom";
import { Home, Search, PlusSquare, MessageCircle, Bell, User, Bookmark, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CreatePostDialog from "./CreatePostDialog";
import AnimatedAmbientBackground from "./background/AnimatedAmbientBackground";
import LiveActivityPanel from "./LiveActivityPanel";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/search", icon: Search, label: "Discover" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function AppShell() {
  const { signOut } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="relative isolate flex min-h-screen overflow-x-clip bg-background">
      <AnimatedAmbientBackground variant="app" />

      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-20 hidden h-screen flex-col border-r border-border/80 bg-sidebar-background/78 p-4 backdrop-blur-xl md:flex md:w-64 lg:w-72">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-ember">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold font-heading text-foreground">EchoRoom</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )
            }
          >
            <Bookmark className="h-5 w-5" />
            Saved
          </NavLink>
        </nav>

        <button
          onClick={() => setShowCreate(true)}
          className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-ember px-4 py-3 text-sm font-semibold text-primary-foreground glow-ember transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <PlusSquare className="h-5 w-5" />
          New Post
        </button>

        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 pb-20 md:pb-0">
        <div className="mx-auto w-full max-w-[1200px] px-2 pt-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <section className="relative min-w-0 rounded-[1.35rem] border border-border/80 bg-background/68 shadow-[0_34px_90px_-62px_hsl(var(--ember)/0.52)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-b from-background/82 via-background/74 to-background/86" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-primary/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 rounded-[1.35rem] border border-primary/10" />
              <div className="relative z-10">
                <Outlet />
              </div>
            </section>

            <LiveActivityPanel />
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/85 backdrop-blur-xl px-2 py-2 md:hidden">
        {navItems.slice(0, 2).map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn("flex h-10 w-10 items-center justify-center rounded-xl transition-colors", isActive ? "text-primary" : "text-muted-foreground")
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
        <button
          onClick={() => setShowCreate(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-ember text-primary-foreground glow-ember"
        >
          <PlusSquare className="h-5 w-5" />
        </button>
        {navItems.slice(2).map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn("flex h-10 w-10 items-center justify-center rounded-xl transition-colors", isActive ? "text-primary" : "text-muted-foreground")
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </nav>

      <CreatePostDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
