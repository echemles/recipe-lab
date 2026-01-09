"use client";

import { motion } from "framer-motion";

export function SectionDivider() {
  return (
    <div className="w-full flex justify-center px-6 relative py-6" aria-hidden="true">
      <motion.div
        className="h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-border/60 to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}
