"use client";

import { motion, useReducedMotion } from "framer-motion";

type IngredientName = "carrot" | "lemon" | "chicken" | "rice" | "avocado" | "egg";

interface IngredientIconProps {
  name: IngredientName;
  className?: string;
  animate?: boolean;
}

const iconPaths: Record<IngredientName, { paths: string[]; viewBox: string }> = {
  carrot: {
    viewBox: "0 0 48 48",
    paths: [
      "M32 8c-2 0-4 1-5 3l-18 26c-1 2 0 4 2 5s4 0 5-2l18-26c1-2 0-4-2-5z",
      "M30 6c2-3 6-4 9-2s4 6 2 9",
      "M26 14l-4 6M22 20l-4 6M18 26l-4 6",
    ],
  },
  lemon: {
    viewBox: "0 0 48 48",
    paths: [
      "M24 8c-9 0-16 7-16 16s7 16 16 16 16-7 16-16-7-16-16-16z",
      "M24 14c-5.5 0-10 4.5-10 10",
      "M20 24c0-2.2 1.8-4 4-4",
    ],
  },
  chicken: {
    viewBox: "0 0 48 48",
    paths: [
      "M12 40l4-8c2-4 6-6 10-6h8c4 0 7 3 7 7v3c0 2-2 4-4 4H12z",
      "M34 26c0-6-4-10-10-10s-10 4-10 10",
      "M20 16c-2-4-2-8 0-10M28 16c2-4 2-8 0-10",
    ],
  },
  rice: {
    viewBox: "0 0 48 48",
    paths: [
      "M24 6c-2 0-4 8-4 18s2 18 4 18 4-8 4-18-2-18-4-18z",
      "M16 12c-1 1-2 10 2 18s8 12 10 11",
      "M32 12c1 1 2 10-2 18s-8 12-10 11",
    ],
  },
  avocado: {
    viewBox: "0 0 48 48",
    paths: [
      "M24 6c-8 0-14 6-14 14 0 10 6 22 14 22s14-12 14-22c0-8-6-14-14-14z",
      "M24 22c-4 0-7 3-7 7s3 7 7 7 7-3 7-7-3-7-7-7z",
    ],
  },
  egg: {
    viewBox: "0 0 48 48",
    paths: [
      "M24 6c-8 0-14 10-14 20 0 8 6 14 14 14s14-6 14-14c0-10-6-20-14-20z",
      "M30 28c0 3.3-2.7 6-6 6",
    ],
  },
};

export function IngredientIcon({ name, className = "w-12 h-12", animate = true }: IngredientIconProps) {
  const prefersReducedMotion = useReducedMotion();
  const { paths, viewBox } = iconPaths[name];
  const shouldAnimate = animate && !prefersReducedMotion;

  return (
    <svg viewBox={viewBox} fill="none" className={className}>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            shouldAnimate
              ? { duration: 0.8, delay: i * 0.15, ease: "easeInOut" }
              : { duration: 0 }
          }
        />
      ))}
    </svg>
  );
}
