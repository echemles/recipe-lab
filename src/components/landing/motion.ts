import { type Variants, type Transition } from "framer-motion";

// Base variants for common animations
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

// Hover variants
export const hoverLiftVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

export const hoverScaleVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03 },
};

export const buttonHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.98 },
};

// Staggered container variants
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerSlowContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// Child variants for staggered animations
export const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const staggerChipVariants: Variants = {
  hidden: { opacity: 0, x: -10, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
};

// Hero-specific variants
export const heroHeadlineVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: "blur(10px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

export const heroSubcopyVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const heroCTAVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

// Card variants
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

export const insightCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Component tile variants
export const componentTileVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  hover: { y: -4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
  used: { opacity: 0.4, scale: 0.95 },
};

// Flow line variants
export const flowLineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const flowLineSegmentVariants: Variants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1 },
};

// Meal card variants
export const mealCardVariants: Variants = {
  empty: { borderColor: "rgba(var(--border), 0.3)" },
  partial: { borderColor: "rgba(var(--border), 0.5)" },
  complete: {
    borderColor: "rgba(34, 197, 94, 0.6)",
    boxShadow: "0 0 24px rgba(34, 197, 94, 0.2)",
  },
};

export const mealSlotVariants: Variants = {
  empty: { opacity: 0.4, scale: 1 },
  filling: { opacity: 0.7, scale: 1.05 },
  filled: { opacity: 1, scale: 1 },
};

// Checkmark animation variants
export const checkmarkVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 },
};

export const completionTitleVariants: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// Transition presets
export const transitionPresets: Record<string, Transition> = {
  smooth: { duration: 0.6, ease: "easeOut" as const },
  spring: { type: "spring", stiffness: 400, damping: 25 },
  gentle: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  slow: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
};

// Delay presets
export const delayPresets = {
  immediate: 0,
  short: 0.1,
  medium: 0.2,
  long: 0.4,
  extraLong: 0.6,
};
