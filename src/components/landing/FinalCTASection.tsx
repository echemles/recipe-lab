"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GradientOrb } from "./GradientOrb";

export function FinalCTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <section ref={ref} className="py-20 md:py-32 px-6 relative overflow-hidden">
      <GradientOrb
        color="purple"
        size="lg"
        position={{ top: "-30%", left: "20%" }}
        delay={0.2}
      />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, scale: 0.98 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-semibold mb-6"
        >
          Stop planning meals around recipes.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-muted leading-relaxed mb-12"
        >
          Start building meals around what you have.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 400, damping: 17 }}
        >
          <Link href="/recipes">
            <Button className="px-12 py-4 text-lg shadow-2xl shadow-accent/30 hover:shadow-accent/40 transition-shadow">
              Get started
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
