"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, ReactNode } from "react";
import { springs, modalVariants, fadeVariants, durations } from "@/lib/motion";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  /** If true, clicking backdrop won't close modal */
  disableBackdropClose?: boolean;
  /** If true, pressing Escape won't close modal */
  disableEscapeClose?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** ARIA label for the modal */
  ariaLabel?: string;
  /** ARIA description ID */
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: "max-w-sm sm:max-w-md",
  md: "max-w-md sm:max-w-lg",
  lg: "max-w-lg sm:max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  disableBackdropClose = false,
  disableEscapeClose = false,
  size = "md",
  ariaLabel,
  ariaDescribedBy,
}: ModalProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || disableEscapeClose || !onClose) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, disableEscapeClose, onClose]);

  // Focus trap and restoration
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal on open
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);
      
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      
      // Restore focus
      previousActiveElement.current?.focus();
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = () => {
    if (!disableBackdropClose && onClose) {
      onClose();
    }
  };

  const backdropVariants = prefersReducedMotion ? fadeVariants : modalVariants.backdrop;
  const contentVariants = prefersReducedMotion ? fadeVariants : modalVariants.content;
  const transition = prefersReducedMotion
    ? { duration: durations.fast }
    : springs.gentle;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={backdropVariants.initial}
            animate={backdropVariants.animate}
            exit={backdropVariants.exit}
            transition={{ duration: durations.normal }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          
          {/* Modal content */}
          <motion.div
            ref={modalRef}
            initial={contentVariants.initial}
            animate={contentVariants.animate}
            exit={contentVariants.exit}
            transition={transition}
            className={`relative z-10 w-full ${sizeClasses[size]} bg-surface-1 border border-border rounded-[--radius-panel] shadow-xl p-4 sm:p-[var(--space-modal)] focus:outline-none ${className}`}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            tabIndex={-1}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Modal sub-components for consistent structure
export function ModalHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-4 sm:mb-[var(--space-6)] ${className}`}>
      {children}
    </div>
  );
}

export function ModalTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  );
}

export function ModalDescription({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <p id={id} className={`text-sm text-muted mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function ModalBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex justify-end gap-2 sm:gap-3 mt-4 sm:mt-[var(--space-6)] flex-col sm:flex-row ${className}`}>
      {children}
    </div>
  );
}
