import AmbientGradientLayer from "./AmbientGradientLayer";
import NetworkLayer from "./NetworkLayer";
import SocialActivityLayer from "./SocialActivityLayer";
import { MotionVariant } from "./backgroundData";

type AnimatedAmbientBackgroundProps = {
  variant?: MotionVariant;
};

export default function AnimatedAmbientBackground({ variant = "app" }: AnimatedAmbientBackgroundProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <AmbientGradientLayer variant={variant} />
      <NetworkLayer variant={variant} />
      <SocialActivityLayer variant={variant} />
    </div>
  );
}
