import { MotionVariant, avatarChips, presenceChips, socialMessages, statusChips } from "./backgroundData";

type SocialActivityLayerProps = {
  variant: MotionVariant;
};

export default function SocialActivityLayer({ variant }: SocialActivityLayerProps) {
  const isAuth = variant === "auth";

  return (
    <div className={`absolute inset-0 ${isAuth ? "opacity-100" : "opacity-70"}`}>
      {socialMessages.map((item, index) => (
        <div
          key={`${item.text}-${index}`}
          className={`social-chip social-chip-message social-float absolute px-3 py-1.5 text-[11px] ${item.className} ${
            index > 9 ? "hidden xl:block" : "hidden md:block"
          }`}
          style={{ animationDelay: item.delay, animationDuration: item.duration }}
        >
          {item.text}
        </div>
      ))}

      {presenceChips.map((item, index) => (
        <div
          key={`${item.text}-${index}`}
          className={`social-chip social-chip-presence social-drift absolute px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
            item.className
          } ${index > 6 ? "hidden 2xl:block" : "hidden lg:block"}`}
          style={{ animationDelay: item.delay, animationDuration: item.duration }}
        >
          {item.text}
        </div>
      ))}

      {statusChips.map((item, index) => (
        <div
          key={`${item.text}-${index}`}
          className={`social-chip social-chip-status social-fade absolute items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            item.className
          } ${index > 4 ? "hidden lg:flex" : "hidden md:flex"}`}
          style={{ animationDelay: item.delay, animationDuration: item.duration }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary social-pulse" />
          {item.text}
        </div>
      ))}

      {avatarChips.map((item, index) => (
        <div
          key={`${item.initials}-${index}`}
          className={`social-chip social-chip-avatar social-float absolute h-7 w-7 items-center justify-center text-[10px] font-semibold ${
            item.className
          } ${index > 5 ? "hidden xl:flex" : "hidden sm:flex"}`}
          style={{ animationDelay: item.delay, animationDuration: item.duration }}
        >
          {item.initials}
        </div>
      ))}
    </div>
  );
}
