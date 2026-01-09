"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GradientOrb } from "./GradientOrb";
import { StepIcon } from "./StepIcon";

const steps = [
  {
    number: 1 as const,
    title: "Log your pantry",
    description: "Proteins, grains, sauces. What you already own.",
  },
  {
    number: 2 as const,
    title: "Build components",
    description: "Batch-cook modular pieces. Reuse them across meals.",
  },
  {
    number: 3 as const,
    title: "Assemble on demand",
    description: "Combine components into complete dishes. No shopping required.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section id="how-it-works" ref={ref} className="py-20 md:py-32 px-6 relative overflow-hidden">
      <GradientOrb
        color="green"
        size="md"
        position={{ top: "10%", right: "-10%" }}
        delay={0.3}
      />
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-semibold mb-16 text-center"
        >
          Three steps. One system.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border border-border/20 rounded-2xl p-8 relative backdrop-blur-sm bg-surface-1/30 hover:bg-surface-1/50 hover:border-border/40 transition-colors hover:shadow-2xl hover:shadow-accent/5"
            >
              <StepIcon step={step.number} />
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
