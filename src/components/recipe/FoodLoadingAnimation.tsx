"use client";

interface FoodLoadingAnimationProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<FoodLoadingAnimationProps["size"]>, string> = {
  sm: "w-24 h-24",
  md: "w-32 h-32",
  lg: "w-40 h-40",
};

export function FoodLoadingAnimation({
  message,
  size = "md",
  className = "",
}: FoodLoadingAnimationProps) {
  return (
    <div className={`flex flex-col items-center text-center gap-4 ${className}`}>
      <div
        className={`relative ${SIZE_CLASSES[size]} rounded-full shadow-md overflow-hidden`}
        aria-hidden="true"
      >
        <video
          src="/food-animation.webm"
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="pointer-events-none absolute inset-0 rounded-full border border-accent/30" />
      </div>
      {message && (
        <p className="text-sm text-muted leading-relaxed max-w-xs">
          {message}
        </p>
      )}
    </div>
  );
}
