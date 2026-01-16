"use client";

import { motion } from "framer-motion";

type PigmentCloudColor = "orange" | "tomato" | "leaf";
type PigmentCloudSize = "sm" | "md" | "lg";

interface PigmentCloudProps {
  color: PigmentCloudColor;
  size?: PigmentCloudSize;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  delay?: number;
}

const colorMap: Record<PigmentCloudColor, string> = {
  orange: "from-[hsl(28_85%_55%/0.20)] via-[hsl(36_80%_60%/0.12)] to-transparent",
  tomato: "from-[hsl(6_70%_55%/0.18)] via-[hsl(12_65%_52%/0.10)] to-transparent",
  leaf: "from-[hsl(120_25%_50%/0.16)] via-[hsl(95_22%_48%/0.08)] to-transparent",
};

const sizeMap: Record<PigmentCloudSize, string> = {
  sm: "w-64 h-64",
  md: "w-96 h-96",
  lg: "w-[32rem] h-[32rem]",
};

export function PigmentCloud({ color, size = "md", position, delay = 0 }: PigmentCloudProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 2,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`absolute ${sizeMap[size]} rounded-full bg-gradient-radial ${colorMap[color]} blur-3xl pointer-events-none -z-10`}
      style={position}
    />
  );
}
