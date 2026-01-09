"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ComponentTileData } from "./ComponentTile";
import { mealCardVariants, mealSlotVariants, transitionPresets } from "./motion";

interface MealCardFrameProps {
  name: string;
  slots: number;
  filledComponents: ComponentTileData[];
  className?: string;
}


export function MealCardFrame({
  name,
  slots,
  filledComponents,
  className = "",
}: MealCardFrameProps) {
  const prefersReducedMotion = useReducedMotion();
  const filledCount = filledComponents.length;
  const cardState = filledCount === 0 ? "empty" : filledCount >= slots ? "complete" : "partial";

  const colorClasses: Record<string, string> = {
    green: "border-green-500/60 bg-green-500/20 text-green-700 dark:text-green-400",
    orange: "border-orange-500/60 bg-orange-500/20 text-orange-700 dark:text-orange-400",
    brown: "border-amber-700/60 bg-amber-700/20 text-amber-800 dark:text-amber-400",
    red: "border-red-500/60 bg-red-500/20 text-red-700 dark:text-red-400",
    cream: "border-yellow-600/60 bg-yellow-600/20 text-yellow-800 dark:text-yellow-400",
    default: "border-border/60 bg-surface-2/50 text-text",
  };

  return (
    <motion.div
      variants={mealCardVariants}
      initial="empty"
      animate={cardState}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      className={`
        relative border-2 border-dashed rounded-2xl p-6
        bg-surface-1/30 backdrop-blur-sm
        ${className}
      `}
      role="region"
      aria-label={`${name} meal card with ${filledCount} of ${slots} components`}
      aria-live="polite"
    >
      <h4 className="text-lg font-semibold mb-4 text-center">{name}</h4>

      <div className="flex flex-col gap-2">
        {Array.from({ length: slots }).map((_, index) => {
          const component = filledComponents[index];
          const slotState = component ? "filled" : "empty";

          return (
            <motion.div
              key={index}
              variants={mealSlotVariants}
              initial="empty"
              animate={slotState}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className={`
                h-10 rounded-lg border flex items-center justify-center text-sm font-medium
                ${
                  component
                    ? colorClasses[component.color || "default"]
                    : "border-dashed border-border/40 text-muted"
                }
              `}
            >
              {component ? component.label : `Slot ${index + 1}`}
            </motion.div>
          );
        })}
      </div>

      {cardState === "complete" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4, delay: 0.2 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
