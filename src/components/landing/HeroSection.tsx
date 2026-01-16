"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { TransformationSequence } from "./TransformationSequence";
import { fadeInVariants, heroHeadlineVariants, heroSubcopyVariants, heroCTAVariants, buttonHoverVariants, transitionPresets, delayPresets } from "./motion";

export function HeroSection() {
  return (
    <section className="landing-section hero-section min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute inset-x-10 top-1/4 bottom-0 bg-gradient-to-b from-accent/5 via-accent/0 to-transparent dark:from-accent/3 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.h1
          variants={heroHeadlineVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitionPresets.slow }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6 bg-gradient-to-br from-text via-text to-text/60 bg-clip-text text-transparent"
        >
          <span className="font-caveat">Cook from what you have.</span>
        </motion.h1>

        <motion.p
          variants={heroSubcopyVariants}
          initial="hidden"
          animate="visible"
          transition={{ ...transitionPresets.smooth, delay: delayPresets.short }}
          className="text-sm sm:text-lg md:text-xl text-muted leading-relaxed mb-6 sm:mb-12 max-w-3xl mx-auto px-2 sm:px-4"
        >
          Recipe Lab is a pantry-first cooking system. Build meals from your
          ingredients, not someone else&apos;s shopping list.
        </motion.p>

        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8, delay: delayPresets.long }}
          className="mb-6 sm:mb-12"
        >
          <TransformationSequence />
        </motion.div>

        <motion.div
          variants={heroCTAVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: delayPresets.medium, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link 
              href="/recipes"
              className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg tracking-[0.015em] bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 rounded-[--radius-button] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-md shadow-accent/20 transition-all w-full sm:w-auto"
            >
              Start cooking
            </Link>
          </motion.div>

          <motion.div
            variants={heroSubcopyVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ ...transitionPresets.spring }}
          >
            <Button 
              variant="secondary" 
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              See how it works
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
