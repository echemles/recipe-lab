"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { PigmentCloud } from "./PigmentCloud";
import { fadeInVariants, fadeInUpVariants, fadeInScaleVariants, transitionPresets, delayPresets } from "./motion";

function TraditionalFlow() {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2 text-center">Traditional approach</div>
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <div className="px-3 py-2 rounded-lg border border-border bg-surface-1 text-text dark:bg-surface-2 dark:text-text text-sm font-medium">
          Find recipe
        </div>
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="px-3 py-2 rounded-lg border border-border bg-surface-1 text-text dark:bg-surface-2 dark:text-text text-sm font-medium">
          Shop for ingredients
        </div>
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="px-3 py-2 rounded-lg border border-border bg-surface-1 text-text dark:bg-surface-2 dark:text-text text-sm font-medium">
          Cook once
        </div>
      </div>
      <div className="text-xs text-muted mt-1 text-center">Repeat for every meal</div>
    </div>
  );
}

function RecipeLabFlow() {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2 text-center">Recipe Lab approach</div>
      <div className="flex flex-wrap items-center justify-center gap-2 w-full">
        <div className="px-3 py-2 rounded-lg border border-accent/40 bg-accent-soft text-accent dark:text-accent text-sm font-medium">
          Your pantry
        </div>
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="px-3 py-2 rounded-lg border border-accent/40 bg-accent-soft text-accent dark:text-accent text-sm font-medium">
          Build components
        </div>
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="px-3 py-2 rounded-lg border border-accent/40 bg-accent-soft text-accent dark:text-accent text-sm font-medium">
          Mix & match meals
        </div>
      </div>
      <div className="text-xs text-accent dark:text-accent mt-1 text-center">Components reuse across many meals</div>
    </div>
  );
}

export function InsightSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="landing-section py-16 md:py-32 px-4 sm:px-6 relative overflow-hidden flex items-center">
      
      <PigmentCloud
        color="leaf"
        size="md"
        position={{ top: "20%", left: "-15%" }}
        delay={0.4}
      />
      <div className="max-w-5xl mx-auto relative z-10 w-full">
        <motion.h2
          variants={fadeInScaleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth }}
          className="text-2xl sm:text-3xl md:text-6xl font-semibold mb-4 sm:mb-6 text-center md:text-left"
        >
          <span className="font-caveat">Stop planning meals around recipes.</span>
        </motion.h2>

        <motion.p
          variants={fadeInUpVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth, delay: delayPresets.short }}
          className="text-sm sm:text-lg md:text-xl text-muted leading-relaxed max-w-3xl mb-6 sm:mb-12 text-center md:text-left"
        >
          They show you a dish, then send you to the store. Recipe Lab inverts this:
          start with your pantry, build modular components, reuse across meals.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-8 md:gap-12">
          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...transitionPresets.smooth, delay: prefersReducedMotion ? 0 : delayPresets.medium }}
            className="w-full max-w-full p-4 sm:p-8 rounded-2xl border border-border bg-surface-1 dark:border-border dark:bg-surface-2"
          >
            <TraditionalFlow />
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border space-y-2.5 sm:space-y-3 text-sm text-muted leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="text-text mt-0.5 text-base">•</span>
                <span>Unused ingredients spoil</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-text mt-0.5 text-base">•</span>
                <span>Every meal requires planning</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-text mt-0.5 text-base">•</span>
                <span>Locked into specific recipes</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUpVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...transitionPresets.smooth, delay: prefersReducedMotion ? 0 : delayPresets.long }}
            className="w-full max-w-full p-4 sm:p-8 rounded-2xl border border-accent/30 bg-accent-soft"
          >
            <RecipeLabFlow />
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-accent/20 space-y-2.5 sm:space-y-3 text-sm text-muted leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="text-accent mt-0.5 text-base">•</span>
                <span>Use what you already have</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-0.5 text-base">•</span>
                <span>Components ready when you are</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-0.5 text-base">•</span>
                <span>Endless meal combinations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
