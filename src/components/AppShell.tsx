import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Search, PlusSquare, MessageCircle, Bell, User, Bookmark, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import CreatePostDialog from "./CreatePostDialog";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/search", icon: Search, label: "Discover" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function AppShell() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-border p-4 sticky top-0 h-screen">
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
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/90 backdrop-blur-lg px-2 py-2 md:hidden">
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
