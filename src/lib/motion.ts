/**
 * Motion System - Unified animation config for Recipe Lab
 * 
 * All Framer Motion animations should use these presets for consistency.
 * Respects prefers-reduced-motion by design.
 */

// Spring presets
export const springs = {
  // Default spring for most UI interactions
  default: { type: "spring" as const, stiffness: 300, damping: 30 },
  // Snappy spring for quick feedback (buttons, toggles)
  snappy: { type: "spring" as const, stiffness: 400, damping: 30 },
  // Gentle spring for larger elements (modals, panels)
  gentle: { type: "spring" as const, stiffness: 260, damping: 28 },
  // Bouncy for playful interactions
  bouncy: { type: "spring" as const, stiffness: 350, damping: 22 },
};

// Duration presets (in seconds)
export const durations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  deliberate: 0.4,
};

// Easing presets
export const easings = {
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  easeIn: [0.4, 0.0, 1, 1] as const,
  easeInOut: [0.4, 0.0, 0.2, 1] as const,
  sharp: [0.4, 0.0, 0.6, 1] as const,
};

// Modal animation variants
export const modalVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
};

// Toast animation variants
export const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 },
};

// List item animation variants
export const listItemVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10, height: 0 },
};

// Fade variants (for reduced motion fallback)
export const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Reduced motion variants (simple fades only)
export const reducedMotionVariants = {
  modal: {
    backdrop: fadeVariants,
    content: fadeVariants,
  },
  toast: fadeVariants,
  listItem: fadeVariants,
};

// Helper to get variants based on reduced motion preference
export function getVariants(
  variants: { initial: object; animate: object; exit: object },
  prefersReducedMotion: boolean
) {
  return prefersReducedMotion ? fadeVariants : variants;
}

// Helper to get transition based on reduced motion preference
export function getTransition(
  transition: object,
  prefersReducedMotion: boolean
) {
  return prefersReducedMotion
    ? { duration: durations.fast }
    : transition;
}
