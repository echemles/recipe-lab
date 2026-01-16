"use client";

import { motion } from "framer-motion";

type GradientOrbColor = "blue" | "purple" | "orange";
type GradientOrbSize = "sm" | "md" | "lg";

interface GradientOrbProps {
  color: GradientOrbColor;
  size?: GradientOrbSize;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  delay?: number;
}

const colorMap: Record<GradientOrbColor, string> = {
  blue: "from-blue-500/30 via-cyan-500/20 to-transparent",
  purple: "from-purple-500/30 via-pink-500/20 to-transparent",
  orange: "from-orange-500/30 via-amber-500/20 to-transparent",
};

const sizeMap: Record<GradientOrbSize, string> = {
  sm: "w-64 h-64",
  md: "w-96 h-96",
  lg: "w-[32rem] h-[32rem]",
};

export function GradientOrb({ color, size = "md", position, delay = 0 }: GradientOrbProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`absolute ${sizeMap[size]} rounded-full bg-gradient-radial ${colorMap[color]} blur-3xl pointer-events-none -z-10`}
      style={position}
    />
  );
}
