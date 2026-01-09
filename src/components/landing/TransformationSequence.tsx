"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { IngredientIcon } from "./IngredientIcon";

type IngredientName = "carrot" | "lemon" | "chicken" | "rice" | "avocado" | "egg";

interface Ingredient {
  id: string;
  name: string;
  icon: IngredientName;
  position: { x: number; y: number };
}

interface ComponentData {
  id: string;
  label: string;
  color: "green" | "orange" | "brown";
}

const INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Chicken", icon: "chicken", position: { x: -80, y: -40 } },
  { id: "i2", name: "Rice", icon: "rice", position: { x: 80, y: -40 } },
  { id: "i3", name: "Lime", icon: "lemon", position: { x: -60, y: 50 } },
  { id: "i4", name: "Avocado", icon: "avocado", position: { x: 60, y: 50 } },
];

const COMPONENTS: ComponentData[] = [
  { id: "c1", label: "Shredded Chicken", color: "orange" },
  { id: "c2", label: "Cilantro-Lime Rice", color: "green" },
];

const MEAL_NAME = "Chicken Rice Bowl";

type Phase = "ingredients" | "transforming" | "components" | "assembling" | "complete";

const colorClasses: Record<string, string> = {
  green: "border-green-500/60 bg-green-500/15 text-green-700 dark:text-green-400",
  orange: "border-orange-500/60 bg-orange-500/15 text-orange-700 dark:text-orange-400",
  brown: "border-amber-700/60 bg-amber-700/15 text-amber-800 dark:text-amber-400",
};

export function TransformationSequence() {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("ingredients");

  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase("complete");
      return;
    }

    const timers = [
      setTimeout(() => setPhase("transforming"), 800),
      setTimeout(() => setPhase("components"), 1600),
      setTimeout(() => setPhase("assembling"), 2400),
      setTimeout(() => setPhase("complete"), 3200),
    ];

    return () => timers.forEach(clearTimeout);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="flex gap-2">
          {INGREDIENTS.slice(0, 2).map((ing) => (
            <div key={ing.id} className="w-10 h-10 text-accent/70">
              <IngredientIcon name={ing.icon} animate={false} className="w-full h-full" />
            </div>
          ))}
        </div>
        <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex gap-2">
          {COMPONENTS.map((comp) => (
            <span
              key={comp.id}
              className={`px-3 py-1.5 text-sm rounded-full border font-medium ${colorClasses[comp.color]}`}
            >
              {comp.label}
            </span>
          ))}
        </div>
        <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="px-4 py-2 rounded-xl border-2 border-green-500/60 bg-green-500/10 font-semibold text-green-700 dark:text-green-400">
          {MEAL_NAME}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[12rem] sm:h-48 w-full max-w-2xl mx-auto" aria-label="Animation showing ingredients transforming into components, then into a meal">
      <AnimatePresence mode="wait">
        {(phase === "ingredients" || phase === "transforming") && (
          <motion.div
            key="ingredients"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            transition={{ duration: 0.4 }}
          >
            {INGREDIENTS.map((ing, index) => (
              <motion.div
                key={ing.id}
                className="absolute w-12 h-12 text-accent/80"
                initial={{ opacity: 0, scale: 0.5, x: ing.position.x * 1.5, y: ing.position.y * 1.5 }}
                animate={{
                  opacity: phase === "transforming" ? 0.6 : 1,
                  scale: phase === "transforming" ? 0.7 : 1,
                  x: phase === "transforming" ? ing.position.x * 0.3 : ing.position.x,
                  y: phase === "transforming" ? ing.position.y * 0.3 : ing.position.y,
                  filter: phase === "transforming" ? "blur(2px)" : "blur(0px)",
                }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <IngredientIcon name={ing.icon} className="w-full h-full" />
              </motion.div>
            ))}
          </motion.div>
        )}

        {(phase === "components" || phase === "assembling") && (
          <motion.div
            key="components"
            className="absolute inset-0 flex items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {COMPONENTS.map((comp, index) => (
              <motion.div
                key={comp.id}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl border-2 font-medium ${colorClasses[comp.color]}`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: phase === "assembling" ? 0.7 : 1,
                  y: 0,
                  scale: phase === "assembling" ? 0.9 : 1,
                  x: phase === "assembling" ? (index === 0 ? 60 : -60) : 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {comp.label}
              </motion.div>
            ))}
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div
            key="complete"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border-2 border-green-500/60 bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-sm"
              initial={{ boxShadow: "0 0 0 rgba(34, 197, 94, 0)" }}
              animate={{ boxShadow: "0 8px 32px rgba(34, 197, 94, 0.2)" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-lg sm:text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
                {MEAL_NAME}
              </div>
              <div className="flex gap-2">
                {COMPONENTS.map((comp, index) => (
                  <motion.span
                    key={comp.id}
                    className={`px-2 py-1 text-xs rounded-full border ${colorClasses[comp.color]}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {comp.label}
                  </motion.span>
                ))}
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 15 }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
