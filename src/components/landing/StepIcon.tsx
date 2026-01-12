"use client";

import { motion } from "framer-motion";

interface StepIconProps {
  step: 1 | 2 | 3;
  isInView?: boolean;
}

export function StepIcon({ step, isInView = false }: StepIconProps) {
  const icons = {
    1: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <motion.path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.path
          d="M9 22V12h6v10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.8 }}
        />
      </svg>
    ),
    2: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.path
          d="M12 6v6l4 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.9 }}
        />
      </svg>
    ),
    3: (
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <motion.path
          d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.path
          d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    ),
  };

  return (
    <div className="w-16 h-16 text-accent/70 mb-6">
      {icons[step]}
    </div>
  );
}
