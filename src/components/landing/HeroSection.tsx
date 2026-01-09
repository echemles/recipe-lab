"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const EMOJI_TRAILS = [
  {
    emoji: "🥕",
    startX: -520,
    startY: -420,
    delay: 0.05,
    duration: 4.8,
    spin: -30,
    scale: 1.35,
  },
  {
    emoji: "🍋",
    startX: 480,
    startY: -400,
    delay: 0.18,
    duration: 5.1,
    spin: 36,
    scale: 1.3,
  },
  {
    emoji: "🥑",
    startX: -460,
    startY: 420,
    delay: 0.32,
    duration: 5.3,
    spin: -28,
    scale: 1.45,
  },
  {
    emoji: "🍳",
    startX: 440,
    startY: 420,
    delay: 0.4,
    duration: 5.5,
    spin: 24,
    scale: 1.25,
  },
  {
    emoji: "🥖",
    startX: 0,
    startY: -520,
    delay: 0.22,
    duration: 5.6,
    spin: -32,
    scale: 1.5,
  },
] as const;

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute inset-x-10 top-1/4 bottom-0 bg-gradient-to-b from-white/10 via-white/0 to-white/0 dark:from-white/5 blur-3xl" />
        {EMOJI_TRAILS.map(({ emoji, startX, startY, delay, duration, spin, scale }, index) => (
          <motion.span
            key={`${emoji}-${index}`}
            initial={{ opacity: 0, x: startX, y: startY, scale: scale * 0.65 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: [0, 0.8, 0],
                    x: [startX, startX * 0.4, 0],
                    y: [startY, startY * 0.4, 0],
                    rotate: [0, spin * 1.2, spin * 1.8],
                    scale: [scale * 0.6, scale, scale * 0.15],
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    delay,
                    duration,
                    ease: [0.28, 0.02, 0.08, 1],
                  }
            }
            className="absolute text-6xl sm:text-7xl lg:text-8xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
            style={{ left: "50%", top: "40%" }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-br from-text via-text to-text/60 bg-clip-text text-transparent"
        >
          Cook from what you have.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted leading-relaxed mb-12 max-w-3xl mx-auto"
        >
          Recipe Lab is a pantry-first cooking system. Build meals from your
          ingredients, not someone else&apos;s shopping list.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/recipes">
              <Button className="px-8 py-4 text-lg shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-shadow">
                Start cooking
              </Button>
            </Link>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--surface-2), 0.5)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => {
              document.getElementById("how-it-works")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
            className="px-8 py-4 text-lg border border-border rounded-[--radius-button] backdrop-blur-sm bg-surface-1/30 hover:bg-surface-2/50 transition-colors"
          >
            See how it works
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
