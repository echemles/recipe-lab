"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: "default" | "accent" | "muted";
  /** Size variant */
  size?: "sm" | "md";
  /** Optional icon to display before label */
  icon?: ReactNode;
  /** If provided, renders a remove button */
  onRemove?: () => void;
  /** Accessible label for remove button */
  removeLabel?: string;
}

const variantStyles = {
  default: "bg-surface-2 text-text border-border",
  accent: "bg-accent/10 text-accent border-accent/20",
  muted: "bg-surface-2/70 text-muted border-border/50",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className = "",
      variant = "default",
      size = "md",
      icon,
      onRemove,
      removeLabel = "Remove",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-[--radius-input] border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 ml-1 rounded-sm p-0.5 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 transition-colors"
            aria-label={removeLabel}
          >
            <svg
              className="size-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Chip.displayName = "Chip";
