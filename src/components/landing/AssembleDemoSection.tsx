"use client";

import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { PigmentCloud } from "./PigmentCloud";
import { fadeInVariants, fadeInUpVariants, componentTileVariants, mealCardVariants, mealSlotVariants, checkmarkVariants, completionTitleVariants, transitionPresets, delayPresets } from "./motion";

interface ComponentData {
  id: string;
  label: string;
  color: "accent" | "orange" | "brown" | "red" | "cream";
}

const AVAILABLE_COMPONENTS: ComponentData[] = [
  { id: "ac1", label: "Roasted Chicken", color: "orange" },
  { id: "ac2", label: "Garlic Rice", color: "accent" },
  { id: "ac3", label: "Charred Corn", color: "cream" },
  { id: "ac4", label: "Black Beans", color: "brown" },
  { id: "ac5", label: "Pickled Onions", color: "red" },
];

const SLOT_COUNT = 3;
const DISH_NAME_MAP: Record<string, string> = {
  "ac1-ac2-ac3": "Chicken Street Bowl",
  "ac1-ac2-ac4": "Weeknight Burrito Plate",
  "ac1-ac2-ac5": "Citrus Chicken Tacos",
  "ac1-ac3-ac4": "Backyard Grill Bowl",
  "ac1-ac3-ac5": "Smoky Chicken Stack",
  "ac1-ac4-ac5": "Chicken Cantina Wrap",
  "ac2-ac3-ac4": "Garden Grain Plate",
  "ac2-ac3-ac5": "Farmstand Veggie Bowl",
  "ac2-ac4-ac5": "Market Bean Salad",
  "ac3-ac4-ac5": "Roasted Veggie Tacos",
};

const getDishName = (components: ComponentData[]) => {
  const key = components
    .map((component) => component.id)
    .sort()
    .join("-");

  return DISH_NAME_MAP[key] ?? "Pantry Supper Plate";
};

const colorClasses: Record<string, { border: string; bg: string; text: string }> = {
  accent: {
    border: "border-accent/8",
    bg: "bg-gradient-to-br from-accent-soft/70 via-accent-soft/60 to-accent-soft/50",
    text: "text-accent dark:text-accent",
  },
  orange: {
    border: "border-accent/8",
    bg: "bg-gradient-to-br from-accent-soft/70 via-accent-soft/60 to-accent-soft/50",
    text: "text-accent dark:text-accent",
  },
  brown: {
    border: "border-leaf/8",
    bg: "bg-gradient-to-br from-leaf-soft/65 via-leaf-soft/55 to-leaf-soft/45",
    text: "text-leaf dark:text-leaf",
  },
  red: {
    border: "border-tomato/8",
    bg: "bg-gradient-to-br from-tomato-soft/65 via-tomato-soft/55 to-tomato-soft/45",
    text: "text-tomato dark:text-tomato",
  },
  cream: {
    border: "border-accent/3",
    bg: "bg-gradient-to-br from-accent-soft/45 via-accent-soft/35 to-accent-soft/25",
    text: "text-muted",
  },
};

export function AssembleDemoSection() {
  const ref = useRef(null);
  const mealCardRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolled = useRef(false);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();
  const [filledSlots, setFilledSlots] = useState<ComponentData[]>([]);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

  const handleAddComponent = useCallback((component: ComponentData) => {
    if (filledSlots.length >= SLOT_COUNT || usedIds.has(component.id)) return;

    setFilledSlots((prev) => [...prev, component]);
    setUsedIds((prev) => new Set(prev).add(component.id));
  }, [filledSlots.length, usedIds]);

  const handleReset = useCallback(() => {
    setFilledSlots([]);
    setUsedIds(new Set());
    hasAutoScrolled.current = false;
  }, []);

  const isComplete = filledSlots.length >= SLOT_COUNT;
  const selectedDishName = isComplete ? getDishName(filledSlots.slice(0, SLOT_COUNT)) : undefined;

  useEffect(() => {
    if (!isComplete || prefersReducedMotion || hasAutoScrolled.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches) {
      mealCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      hasAutoScrolled.current = true;
    }
  }, [isComplete, prefersReducedMotion]);

  return (
    <section ref={ref} className="landing-section py-20 md:py-32 px-6 relative overflow-hidden">
      <PigmentCloud
        color="tomato"
        size="md"
        position={{ top: "20%", left: "-10%" }}
        delay={0.2}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h2
          variants={fadeInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth }}
          className="text-2xl sm:text-3xl md:text-6xl font-semibold mb-4 text-center"
        >
          <span className="font-caveat">Snap components into meals.</span>
        </motion.h2>

        <motion.p
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth, delay: delayPresets.short }}
          className="text-base sm:text-lg text-muted text-center mb-8 sm:mb-12 px-4"
        >
          Choose any three pantry components to unlock tonight&apos;s dish name.
        </motion.p>

        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.gentle, delay: delayPresets.medium }}
          className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center justify-center"
        >
          <div className="flex flex-col gap-3" role="group" aria-label="Available components">
            {AVAILABLE_COMPONENTS.map((component) => {
              const isUsed = usedIds.has(component.id);
              const colors = colorClasses[component.color];

              return (
                <motion.button
                  key={component.id}
                  onClick={() => handleAddComponent(component)}
                  disabled={isUsed || isComplete}
                  variants={componentTileVariants}
                  initial="hidden"
                  animate={isUsed ? "used" : "visible"}
                  whileHover={!isUsed && !isComplete && !prefersReducedMotion ? { scale: 1.02, y: -2 } : undefined}
                  whileTap={!isUsed && !isComplete ? { scale: 0.98 } : undefined}
                  transition={{ ...transitionPresets.spring }}
                  className={`
                    px-5 py-3 rounded-xl font-medium text-left
                    transition-all cursor-pointer
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2
                    disabled:cursor-not-allowed
                    ${colors.border} ${colors.bg} ${colors.text}
                    hover:shadow-soft hover:from-white/15 hover:to-white/8
                  `}
                  aria-pressed={isUsed}
                  aria-label={`Add ${component.label} to meal${isUsed ? " (already added)" : ""}`}
                >
                  {component.label}
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center" aria-hidden="true">
            <motion.svg
              className="w-8 h-8 text-muted/40 md:rotate-0 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              animate={{ x: [0, 1, 0], y: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </div>

          <motion.div
            className={`
              relative w-full max-w-xs sm:w-64 rounded-2xl p-5 sm:p-6
              transition-all duration-500
              ${isComplete
                ? "bg-gradient-to-br from-surface-1/95 via-surface-1 to-surface-2/25 shadow-soft"
                : "bg-gradient-to-br from-surface-1/98 via-surface-1 to-surface-2/15"
              }
            `}
            ref={mealCardRef}
            animate={isComplete && !prefersReducedMotion ? { scale: [1, 1.02, 1] } : undefined}
            transition={{ duration: 0.4 }}
            role="region"
            aria-label={`Meal assembly card with ${filledSlots.length} of ${SLOT_COUNT} components${selectedDishName ? `: ${selectedDishName}` : ""}`}
            aria-live="polite"
          >
            <div className="mb-4 min-h-[2.5rem] flex items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.h4
                    key="complete-title"
                    variants={completionTitleVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...transitionPresets.gentle }}
                    className="text-base sm:text-lg font-semibold text-accent dark:text-accent"
                  >
                    {selectedDishName}
                  </motion.h4>
                ) : (
                  <motion.h4
                    key="incomplete-title"
                    className="text-base sm:text-lg font-semibold text-muted"
                  >
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">Waiting for a dish name</span>
                  </motion.h4>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-2">
              {Array.from({ length: SLOT_COUNT }).map((_, index) => {
                const component = filledSlots[index];
                const colors = component ? colorClasses[component.color] : null;

                return (
                  <div
                    key={index}
                    className={`
                      h-9 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium px-2
                      transition-all duration-400
                      ${component
                        ? `${colors?.bg} ${colors?.text} shadow-soft-inner`
                        : "bg-gradient-to-br from-surface-2/25 to-surface-2/15 text-muted/35"
                      }
                    `}
                  >
                    <AnimatePresence mode="wait">
                      {component ? (
                        <motion.span
                          key={component.id}
                          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8, x: -20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          {component.label}
                        </motion.span>
                      ) : (
                        <motion.span key={`empty-${index}`}>
                          Slot {index + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {isComplete && (
              <motion.div
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: delayPresets.short, ...transitionPresets.spring }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent/85 to-accent/75 rounded-full flex items-center justify-center shadow-soft"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <div className="mt-8 min-h-[2.5rem] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="reset-button"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: delayPresets.long }}
                className="text-center"
              >
                <button
                  onClick={handleReset}
                  className="text-sm text-muted hover:text-text underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
                >
                  Reset demo
                </button>
              </motion.div>
            ) : (
              <motion.span key="reset-placeholder" className="sr-only">
                Waiting for reset
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
