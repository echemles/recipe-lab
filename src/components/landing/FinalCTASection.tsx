"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GradientOrb } from "./GradientOrb";
import { fadeInVariants, fadeInUpVariants, fadeInScaleVariants, buttonHoverVariants, transitionPresets, delayPresets } from "./motion";

const SAMPLE_MEALS = [
  { name: "Buddha Bowl", components: ["Shredded Chicken", "Cilantro-Lime Rice", "Black Beans"] },
  { name: "Taco Night", components: ["Shredded Chicken", "Black Beans", "Pickled Onions"] },
  { name: "Grain Salad", components: ["Cilantro-Lime Rice", "Black Beans", "Chipotle Crema"] },
];

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="landing-section py-20 md:py-32 px-6 relative overflow-hidden">
      <GradientOrb
        color="green"
        size="lg"
        position={{ top: "-20%", right: "-10%" }}
        delay={0.2}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h2
          variants={fadeInScaleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth }}
          className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-4 text-center"
        >
          Stop planning meals around recipes.
        </motion.h2>

        <motion.p
          variants={fadeInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth, delay: delayPresets.short }}
          className="text-base sm:text-lg md:text-xl text-muted leading-relaxed mb-8 sm:mb-10 text-center max-w-2xl mx-auto px-4"
        >
          Start building meals around what you have.
        </motion.p>

        <motion.div
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth, delay: prefersReducedMotion ? 0 : delayPresets.medium }}
          className="mb-8 sm:mb-12"
        >
          <div className="text-center text-sm text-muted mb-4">Same components, endless possibilities</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {SAMPLE_MEALS.map((meal, index) => (
              <motion.div
                key={meal.name}
                variants={fadeInUpVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : delayPresets.long + index * 0.1, ease: "easeOut" }}
                className="p-4 rounded-xl border border-green-500/30 bg-green-500/5"
              >
                <div className="font-semibold text-green-700 dark:text-green-400 mb-2">{meal.name}</div>
                <div className="flex flex-wrap gap-1.5">
                  {meal.components.map((comp) => (
                    <span
                      key={comp}
                      className="px-2 py-0.5 text-xs rounded-md border border-border/30 bg-surface-1/50 text-muted"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={fadeInScaleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="tap"
          transition={{ delay: prefersReducedMotion ? 0 : delayPresets.extraLong, ...transitionPresets.spring }}
          className="text-center"
        >
          <Link href="/recipes">
            <Button className="px-12 py-4 text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/40 transition-shadow">
              Start cooking
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
