"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GradientOrb } from "./GradientOrb";
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
    <section ref={ref} className="landing-section py-20 md:py-32 px-6 relative overflow-hidden">
      <GradientOrb
        color="green"
        size="lg"
        position={{ top: "-20%", right: "-10%" }}
        delay={0.2}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">

          <motion.h2
            variants={fadeInScaleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...transitionPresets.smooth, delay: delayPresets.short }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight"
          >
            Cook <span className="text-accent glow-filament">smarter</span>,
            <br />
            not harder.
          </motion.h2>

          <motion.p
            variants={fadeInVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ ...transitionPresets.smooth, delay: delayPresets.medium }}
            className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mx-auto"
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
          <Link href="/recipes">
            <Button className="px-12 py-4 text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/40 transition-shadow">
              Start cooking
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
