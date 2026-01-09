"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { staggerContainerVariants, staggerChipVariants, transitionPresets } from "./motion";

interface ChipData {
  id: string;
  label: string;
  color?: "green" | "orange" | "brown" | "red" | "cream";
}

interface ComponentChipSetProps {
  chips: ChipData[];
  className?: string;
}

const colorClasses: Record<string, string> = {
  green: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20",
  orange: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20",
  brown: "border-amber-700/50 bg-amber-700/10 text-amber-800 dark:text-amber-400 hover:bg-amber-700/20",
  red: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20",
  cream: "border-yellow-600/50 bg-yellow-600/10 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-600/20",
  default: "border-border/50 bg-surface-1/50 text-text hover:bg-surface-2/50",
};

export function ComponentChipSet({ chips, className = "" }: ComponentChipSetProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      variants={staggerContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`flex flex-wrap gap-2 justify-center ${className}`}
    >
      {chips.map((chip) => (
        <motion.span
          key={chip.id}
          variants={prefersReducedMotion ? undefined : staggerChipVariants}
          whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
          transition={{ ...transitionPresets.spring }}
          className={`
            inline-flex items-center px-3 py-1.5 text-sm font-medium
            rounded-full border cursor-default
            transition-colors
            ${colorClasses[chip.color || "default"]}
          `}
        >
          {chip.label}
        </motion.span>
      ))}
    </motion.div>
  );
}

export const DEMO_CHIPS: ChipData[] = [
  { id: "chip1", label: "Shredded Chicken", color: "orange" },
  { id: "chip2", label: "Cilantro-Lime Rice", color: "green" },
  { id: "chip3", label: "Black Beans", color: "brown" },
  { id: "chip4", label: "Pickled Onions", color: "red" },
  { id: "chip5", label: "Chipotle Crema", color: "cream" },
];
