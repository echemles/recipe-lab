"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PigmentCloud } from "./PigmentCloud";
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
    <section id="how-it-works" ref={ref} className="landing-section py-16 md:py-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Watercolor illustration - left side */}
      <motion.div 
        className="absolute top-1/3 left-[5%] w-[280px] h-[240px] sm:w-[320px] sm:h-[280px] md:w-[360px] md:h-[320px] lg:w-[400px] lg:h-[360px] pointer-events-none select-none"
        aria-hidden="true"
        initial={{ opacity: 0, x: -60, y: -40, rotate: -8 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0, rotate: 0 } : { opacity: 0, x: -60, y: -40, rotate: -8 }}
        transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src="/illustrations/jar-with-rice.png" 
          alt="" 
          className="w-full h-full object-contain blur-[1px]"
          style={{ opacity: isInView ? 0.32 : 0.16 }}
        />
      </motion.div>
      
      {/* Watercolor illustration - right side */}
      <motion.div 
        className="absolute top-[20%] right-[5%] w-[260px] h-[280px] sm:w-[300px] sm:h-[320px] md:w-[340px] md:h-[360px] lg:w-[380px] lg:h-[400px] pointer-events-none select-none"
        aria-hidden="true"
        initial={{ opacity: 0, x: 60, y: -40, rotate: 8 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0, rotate: 0 } : { opacity: 0, x: 60, y: -40, rotate: 8 }}
        transition={{ duration: 1.2, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src="/illustrations/bag-with-asparagus.png" 
          alt="" 
          className="w-full h-full object-contain blur-[1px]"
          style={{ opacity: isInView ? 0.28 : 0.14 }}
        />
      </motion.div>
      
      {/* Watercolor illustration - bottom center */}
      <motion.div 
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[280px] h-[240px] sm:w-[320px] sm:h-[280px] md:w-[360px] md:h-[320px] pointer-events-none select-none"
        aria-hidden="true"
        initial={{ opacity: 0, y: 50, rotate: -5 }}
        animate={isInView ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 0, y: 50, rotate: -5 }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src="/illustrations/sack-with-pasta.png" 
          alt="" 
          className="w-full h-full object-contain blur-[1px]"
          style={{ opacity: isInView ? 0.24 : 0.12 }}
        />
      </motion.div>
      
      <PigmentCloud
        color="orange"
        size="md"
        position={{ top: "10%", right: "-10%" }}
        delay={0.3}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.h2
          variants={fadeInVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ ...transitionPresets.smooth }}
          className="text-2xl sm:text-3xl md:text-6xl font-semibold mb-8 sm:mb-16 text-center"
        >
          <span className="font-caveat">Three steps. One system.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
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
              className="border border-border/20 rounded-2xl p-4 sm:p-8 relative backdrop-blur-sm bg-surface-1/30 hover:bg-surface-1/50 hover:border-border/40 transition-colors hover:shadow-2xl hover:shadow-accent/5"
            >
              <StepIcon step={step.number} isInView={isInView} />
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
                        className="px-2.5 py-1 text-xs rounded-lg border border-accent/30 bg-accent-soft text-accent dark:text-accent"
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
