"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PigmentCloud } from "./PigmentCloud";
import { fadeInVariants, fadeInUpVariants, fadeInScaleVariants, buttonHoverVariants, transitionPresets, delayPresets } from "./motion";

const CORE_COMPONENTS = [
  { name: "Shredded Chicken", color: "orange" },
  { name: "Cilantro-Lime Rice", color: "green" },
  { name: "Black Beans", color: "brown" },
  { name: "Pickled Onions", color: "red" },
];

const MEAL_EXAMPLES = [
  { name: "Buddha Bowl", components: ["Shredded Chicken", "Cilantro-Lime Rice", "Black Beans"] },
  { name: "Taco Night", components: ["Shredded Chicken", "Black Beans", "Pickled Onions"] },
  { name: "Grain Salad", components: ["Cilantro-Lime Rice", "Black Beans", "Pickled Onions"] },
];

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section ref={ref} className="landing-section py-16 md:py-32 px-4 sm:px-6 relative overflow-hidden bg-surface-2/80">
      
      <PigmentCloud
        color="orange"
        size="lg"
        position={{ top: "-20%", right: "-10%" }}
        delay={0.2}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8 sm:mb-16">

          <motion.h2
            variants={fadeInScaleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...transitionPresets.smooth, delay: delayPresets.short }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold mb-4 sm:mb-6"
          >
            <span className="font-caveat">Cook <span className="text-accent">smarter</span>,
            <br />
            not harder.</span>
          </motion.h2>

          <motion.p
            variants={fadeInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...transitionPresets.smooth, delay: delayPresets.medium }}
            className="text-sm sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto px-2"
          >
            Build flexible meal components once. Mix and match them into endless meals throughout the week.
          </motion.p>
        </div>

        <motion.div
          variants={fadeInScaleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
          whileTap="tap"
          transition={{ delay: prefersReducedMotion ? 0 : 1.8, ...transitionPresets.spring }}
          className="text-center"
        >
          <Link 
            href="/recipes"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg tracking-[0.015em] bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 rounded-[--radius-button] px-12 py-4 text-lg shadow-lg shadow-accent/25 transition-all"
          >
            Start cooking
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
