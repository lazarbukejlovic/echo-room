import { MotionVariant } from "./backgroundData";

type AmbientGradientLayerProps = {
  variant: MotionVariant;
};

export default function AmbientGradientLayer({ variant }: AmbientGradientLayerProps) {
  const isAuth = variant === "auth";

  return (
    <div className="absolute inset-0">
      <div className="ambient-base absolute inset-0" />

      <div className={`ambient-blob ambient-blob-a ${isAuth ? "opacity-80" : "opacity-60"}`} />
      <div className={`ambient-blob ambient-blob-b ${isAuth ? "opacity-70" : "opacity-50"}`} />
      <div className={`ambient-blob ambient-blob-c ${isAuth ? "opacity-70" : "opacity-50"}`} />
      <div className={`ambient-blob ambient-blob-d ${isAuth ? "opacity-60" : "opacity-40"}`} />

      <div className={`ambient-center-glow absolute left-1/2 top-[20%] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl ${isAuth ? "opacity-75" : "opacity-45"}`} />
      <div className="ambient-noise absolute inset-0 opacity-30" />
      <div className="ambient-vignette absolute inset-0" />
    </div>
  );
}
