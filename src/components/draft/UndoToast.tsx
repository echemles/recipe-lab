"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { springs, toastVariants, fadeVariants, durations } from "@/lib/motion";

interface UndoToastProps {
  isOpen: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  message: string;
}

export function UndoToast({ isOpen, onUndo, onDismiss, message }: UndoToastProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onDismiss]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onDismiss]);

  const variants = prefersReducedMotion ? fadeVariants : toastVariants;
  const transition = prefersReducedMotion
    ? { duration: durations.fast }
    : springs.snappy;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={transition}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-surface-1 border border-border rounded-[--radius-card] shadow-lg px-4 py-3 max-w-sm"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm text-text">{message}</span>
          <Button variant="ghost" size="sm" onClick={onUndo}>
            Undo
          </Button>
          <button
            onClick={onDismiss}
            className="rounded p-1 text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
