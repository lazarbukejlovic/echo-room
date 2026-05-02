import { Flame, Globe2, Radio, Users } from "lucide-react";

const activityItems = [
  "Design thread is live",
  "Mila joined from Berlin",
  "Remote work rituals room active",
  "12 active listeners",
  "2 new followers",
  "Voice room active",
];

const locations = ["🇺🇸 New York", "🇬🇧 London", "🇩🇪 Berlin", "🇫🇷 Paris", "🇳🇱 Amsterdam", "🇭🇷 Zagreb"];

const quickStats = [
  { label: "Users Online", value: "14", icon: Users },
  { label: "Active Rooms", value: "3", icon: Radio },
  { label: "Live Threads", value: "6", icon: Flame },
  { label: "Global", value: "24/7", icon: Globe2 },
];

export default function LiveActivityPanel() {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-4 space-y-3">
        <section className="rounded-2xl border border-border/70 bg-card/72 p-4 shadow-[0_24px_60px_-44px_hsl(var(--ember)/0.4)] backdrop-blur-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Live Activity</h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary social-pulse" />
              Live now
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border/70 bg-background/65 px-2.5 py-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wide">{label}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/68 p-4 shadow-[0_20px_60px_-46px_hsl(var(--ember)/0.4)] backdrop-blur-2xl">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Trending Discussions</h3>
          <ul className="space-y-2">
            {activityItems.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-lg border border-border/60 bg-background/62 px-2.5 py-2 text-xs text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary social-pulse" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/66 p-4 shadow-[0_20px_60px_-46px_hsl(var(--ember)/0.35)] backdrop-blur-2xl">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Presence by Location</h3>
          <div className="flex flex-wrap gap-1.5">
            {locations.map((location) => (
              <span key={location} className="rounded-full border border-border/70 bg-background/65 px-2 py-1 text-[11px] text-muted-foreground">
                {location}
              </span>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}
