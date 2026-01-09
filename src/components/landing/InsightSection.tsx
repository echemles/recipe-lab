"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GradientOrb } from "./GradientOrb";

export function InsightSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section ref={ref} className="py-20 md:py-32 px-6 relative overflow-hidden">
      <GradientOrb
        color="blue"
        size="md"
        position={{ top: "20%", left: "-15%" }}
        delay={0.4}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-semibold mb-6"
        >
          Most recipe apps assume you shop first.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted leading-relaxed max-w-3xl"
        >
          They show you a dish, then send you to the store. Recipe Lab inverts this:
          start with your pantry, build modular components, reuse across meals.
          Less waste. Less friction. More control.
        </motion.p>
      </div>
    </section>
  );
}
