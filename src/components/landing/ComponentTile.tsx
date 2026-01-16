"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { forwardRef } from "react";
import { componentTileVariants, transitionPresets } from "./motion";

export interface ComponentTileData {
  id: string;
  label: string;
  color?: "accent" | "orange" | "brown" | "red" | "cream";
}

interface ComponentTileProps {
  data: ComponentTileData;
  variant?: "default" | "used" | "chip";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
}

const colorClasses: Record<string, string> = {
  accent: "border-accent/40 bg-accent/10 text-accent dark:text-accent",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  brown: "border-amber-700/40 bg-amber-700/10 text-amber-800 dark:text-amber-400",
  red: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  cream: "border-yellow-600/40 bg-yellow-600/10 text-yellow-800 dark:text-yellow-400",
  default: "border-border/40 bg-surface-1/50 text-text",
};


export const ComponentTile = forwardRef<HTMLButtonElement, ComponentTileProps>(
  function ComponentTile(
    { data, variant = "default", onClick, disabled = false, className = "", tabIndex = 0 },
    ref
  ) {
    const prefersReducedMotion = useReducedMotion();
    const colorClass = colorClasses[data.color || "default"];
    const isChip = variant === "chip";
    const isUsed = variant === "used";

    const baseClasses = isChip
      ? "px-3 py-1.5 text-sm rounded-full"
      : "px-4 py-2.5 text-base rounded-xl";

    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled || isUsed}
        tabIndex={tabIndex}
        variants={componentTileVariants}
        initial="hidden"
        animate={isUsed ? "used" : "visible"}
        whileHover={!isUsed && !prefersReducedMotion ? "hover" : undefined}
        whileFocus={!isUsed && !prefersReducedMotion ? "hover" : undefined}
        transition={{ ...transitionPresets.spring }}
        className={`
          inline-flex items-center gap-2 border font-medium
          transition-colors cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          ${baseClasses}
          ${colorClass}
          ${className}
        `}
        aria-pressed={isUsed}
      >
        <span className="truncate">{data.label}</span>
      </motion.button>
    );
  }
);
