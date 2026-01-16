"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface FlowLineTerminusProps {
  className?: string;
}

export function FlowLineTerminus({ className = "" }: FlowLineTerminusProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center ${className}`}
      aria-hidden="true"
    >
      <motion.svg
        viewBox="0 0 40 60"
        className="w-10 h-16"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4 }}
      >
        <motion.line
          x1="20"
          y1="0"
          x2="20"
          y2="30"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 2"
          className="text-border/60"
          initial={{ pathLength: 0 }}
          animate={isInView && !prefersReducedMotion ? { pathLength: 1 } : { pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
        }
        className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/40 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-accent dark:text-accent"
        >
          <path d="M12 2C6.48 2 2 6 2 10c0 2.5 1.5 5 4 6.5V22l4-3h2c5.52 0 10-4 10-9s-4.48-8-10-8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </motion.div>
    </div>
  );
}
