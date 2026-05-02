import { MotionVariant, movingSignals, networkLinks, networkNodes } from "./backgroundData";

type NetworkLayerProps = {
  variant: MotionVariant;
};

export default function NetworkLayer({ variant }: NetworkLayerProps) {
  const isAuth = variant === "auth";

  return (
    <div className={`absolute inset-0 ${isAuth ? "opacity-90" : "opacity-65"}`}>
      <div className="network-grid absolute inset-0" />

      {networkLinks.map((link, index) => (
        <div
          key={`${link.className}-${index}`}
          className={`network-link absolute hidden h-px bg-gradient-to-r from-primary/35 via-primary/10 to-transparent lg:block ${link.className}`}
          style={{ animationDelay: link.delay, animationDuration: link.duration }}
        />
      ))}

      {networkNodes.map((node, index) => (
        <span
          key={`${node.className}-${index}`}
          className={`network-node absolute rounded-full bg-primary/70 ${node.size} ${node.className}`}
          style={{ animationDelay: node.delay }}
        />
      ))}

      {movingSignals.map((signal, index) => (
        <span
          key={`${signal.className}-${index}`}
          className={`network-signal absolute h-1.5 w-1.5 rounded-full bg-primary/80 ${signal.className}`}
          style={{ animationDelay: signal.delay, animationDuration: signal.duration }}
        />
      ))}
    </div>
  );
}
