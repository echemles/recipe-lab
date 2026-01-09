"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GradientOrb } from "./GradientOrb";
import { StepIcon } from "./StepIcon";
import { ComponentChipSet, DEMO_CHIPS } from "./ComponentChipSet";
import { fadeInVariants, fadeInUpVariants, cardVariants, transitionPresets, delayPresets } from "./motion";

const steps = [
  {
    number: 1 as const,
    title: "Log your pantry",
    description: "Proteins, grains, sauces, spices. Track what you already own so the system knows what you can make.",
    examples: ["Chicken breast", "Jasmine rice", "Black beans", "Soy sauce"],
  },
  {
    number: 2 as const,
    title: "Build components",
    description: "Batch-cook modular pieces. Reuse them across meals.",
    examples: null,
  },
  {
    number: 3 as const,
    title: "Assemble on demand",
    description: "Combine components into complete dishes in minutes. Tonight's dinner is already half-done.",
    examples: ["Burrito bowl", "Grain salad", "Stir-fry", "Tacos"],
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15, margin: "-10% 0px" });

  return (
    <section id="how-it-works" ref={ref} className="landing-section py-20 md:py-32 px-6 relative overflow-hidden">
      <GradientOrb
        color="green"
        size="md"
        position={{ top: "10%", right: "-10%" }}
        delay={0.3}
      />
      <div className="max-w-5xl mx-auto">
        <motion.h2
          variants={fadeInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth }}
          className="text-2xl sm:text-3xl md:text-5xl font-semibold mb-10 sm:mb-16 text-center"
        >
          Three steps. One system.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              whileHover="hover"
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="border border-border/20 rounded-2xl p-6 sm:p-8 relative backdrop-blur-sm bg-surface-1/30 hover:bg-surface-1/50 hover:border-border/40 transition-colors hover:shadow-2xl hover:shadow-accent/5"
            >
              <StepIcon step={step.number} />
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
              {step.number === 1 && step.examples && (
                <div className="mt-6 pt-4 border-t border-border/20">
                  <div className="flex flex-wrap gap-2">
                    {step.examples.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 text-xs rounded-lg border border-border/40 bg-surface-1/50 text-muted"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {step.number === 2 && (
                <div className="mt-6 pt-4 border-t border-border/20">
                  <ComponentChipSet chips={DEMO_CHIPS} />
                </div>
              )}
              {step.number === 3 && step.examples && (
                <div className="mt-6 pt-4 border-t border-border/20">
                  <div className="text-xs text-muted mb-2">Possible meals:</div>
                  <div className="flex flex-wrap gap-2">
                    {step.examples.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 text-xs rounded-lg border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
