"use client";

import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { IngredientIcon } from "./IngredientIcon";

type IngredientName = "carrots" | "leeks-in-bag" | "bag-with-bread" | "jar-with-rice" | "bag-with-pears" | "jar-with-beans";

interface Ingredient {
  id: string;
  name: string;
  icon: IngredientName;
  position: { x: number; y: number };
}

interface ComponentData {
  id: string;
  label: string;
  color: "accent" | "orange" | "brown";
}

const INGREDIENTS: Ingredient[] = [
  { id: "i1", name: "Bread", icon: "bag-with-bread", position: { x: -80, y: -40 } },
  { id: "i2", name: "Rice", icon: "jar-with-rice", position: { x: 80, y: -40 } },
  { id: "i3", name: "Leeks", icon: "leeks-in-bag", position: { x: -60, y: 50 } },
  { id: "i4", name: "Pears", icon: "bag-with-pears", position: { x: 60, y: 50 } },
];

const COMPONENTS: ComponentData[] = [
  { id: "c1", label: "Shredded Chicken", color: "orange" },
  { id: "c2", label: "Cilantro-Lime Rice", color: "accent" },
];

const MEAL_NAME = "Chicken Rice Bowl";

type Phase = "ingredients" | "transforming" | "components" | "assembling" | "complete";

const colorClasses: Record<string, string> = {
  accent: "border-accent/60 bg-accent/15 text-accent dark:text-accent",
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
              <img 
                src={`/illustrations/${ing.icon}.png`}
                alt={ing.name}
                className="w-full h-full object-contain opacity-70"
              />
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
        <div className="px-4 py-2 rounded-xl border-2 border-accent/60 bg-accent/10 font-semibold text-accent dark:text-accent">
          <span className="font-caveat text-lg">{MEAL_NAME}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[10rem] sm:min-h-[12rem] sm:h-48 w-full max-w-2xl mx-auto" aria-label="Animation showing ingredients transforming into components, then into a meal">
      <AnimatePresence mode="wait">
        {(phase === "ingredients" || phase === "transforming") && (
          <motion.div
            key="ingredients"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {INGREDIENTS.map((ing, index) => (
              <motion.div
                key={ing.id}
                className="absolute w-10 h-10 sm:w-12 sm:h-12 text-accent/80"
                initial={{ opacity: 0, x: ing.position.x * 1.2, y: ing.position.y * 1.2 }}
                animate={{
                  opacity: phase === "transforming" ? 0.4 : 1,
                  x: phase === "transforming" ? 0 : ing.position.x,
                  y: phase === "transforming" ? 0 : ing.position.y,
                }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                  <img 
                  src={`/illustrations/${ing.icon}.png`}
                  alt={ing.name}
                  className="w-full h-full object-contain opacity-80"
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {(phase === "components" || phase === "assembling") && (
          <motion.div
            key="components"
            className="absolute inset-0 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {COMPONENTS.map((comp, index) => (
              <motion.div
                key={comp.id}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-xl border-2 font-medium ${colorClasses[comp.color]}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: phase === "assembling" ? 0.5 : 1,
                  y: 0,
                  x: phase === "assembling" ? (index === 0 ? 40 : -40) : 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.12,
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border-2 border-accent/60 bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm">
              <div className="text-lg sm:text-xl font-semibold text-accent dark:text-accent mb-2">
                <span className="font-caveat text-xl sm:text-2xl">{MEAL_NAME}</span>
              </div>
              <div className="flex gap-2">
                {COMPONENTS.map((comp, index) => (
                  <motion.span
                    key={comp.id}
                    className={`px-2 py-1 text-xs rounded-full border ${colorClasses[comp.color]}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.08, duration: 0.4 }}
                  >
                    {comp.label}
                  </motion.span>
                ))}
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
