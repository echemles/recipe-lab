"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { flowLineVariants, flowLineSegmentVariants, transitionPresets, delayPresets } from "./motion";

interface FlowLineDividerProps {
  className?: string;
}

export function FlowLineDivider({ className = "" }: FlowLineDividerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`landing-divider w-full flex flex-col items-center px-6 py-8 ${className}`}
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 400 60"
        className="w-full max-w-5xl h-12"
        variants={flowLineVariants}
        initial="hidden"
        transition={{ ...transitionPresets.smooth }}
      >
        <motion.line
          x1="200"
          y1="0"
          x2="200"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 2"
          className="text-border/60"
          variants={flowLineSegmentVariants}
          initial="hidden"
          animate={isInView && !prefersReducedMotion ? "visible" : "visible"}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        <motion.line
          x1="40"
          y1="30"
          x2="360"
          y2="30"
          stroke="url(#flowGradient)"
          strokeWidth="1"
          variants={flowLineSegmentVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: delayPresets.short, ease: "easeOut" }
          }
        />

        <motion.line
          x1="200"
          y1="40"
          x2="200"
          y2="60"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 2"
          className="text-border/60"
          variants={flowLineSegmentVariants}
          initial="hidden"
          animate={isInView && !prefersReducedMotion ? "visible" : "visible"}
          transition={{ duration: 0.3, delay: delayPresets.medium, ease: "easeOut" }}
        />

        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="rgba(var(--border), 0.6)" />
            <stop offset="50%" stopColor="rgba(var(--accent), 0.4)" />
            <stop offset="70%" stopColor="rgba(var(--border), 0.6)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}
