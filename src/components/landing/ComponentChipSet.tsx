"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { staggerContainerVariants, staggerChipVariants, transitionPresets } from "./motion";

interface ChipData {
  id: string;
  label: string;
  color?: "accent" | "orange" | "brown" | "red" | "cream";
}

interface ComponentChipSetProps {
  chips: ChipData[];
  className?: string;
}

const colorClasses: Record<string, string> = {
  accent: "border-accent/40 bg-accent-soft text-accent dark:text-accent hover:bg-accent/25",
  orange: "border-accent/40 bg-accent-soft text-accent dark:text-accent hover:bg-accent/25",
  brown: "border-leaf/40 bg-leaf-soft text-leaf dark:text-leaf hover:bg-leaf/20",
  red: "border-tomato/40 bg-tomato-soft text-tomato dark:text-tomato hover:bg-tomato/20",
  cream: "border-accent/30 bg-accent-soft text-muted hover:bg-accent/20",
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
  { id: "chip2", label: "Cilantro-Lime Rice", color: "accent" },
  { id: "chip3", label: "Black Beans", color: "brown" },
  { id: "chip4", label: "Pickled Onions", color: "red" },
  { id: "chip5", label: "Chipotle Crema", color: "cream" },
];
