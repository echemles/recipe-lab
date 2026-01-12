"use client";

import { forwardRef, type HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "gradient" | "subtle";
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Spacing around divider */
  spacing?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-border",
  gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
  subtle: "bg-border/50",
};

const spacingStyles = {
  none: "",
  sm: "my-2",
  md: "my-4",
  lg: "my-6",
};

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className = "",
      variant = "default",
      orientation = "horizontal",
      spacing = "md",
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={`
          ${isHorizontal ? "h-px w-full" : "w-px h-full"}
          ${variantStyles[variant]}
          ${isHorizontal ? spacingStyles[spacing] : ""}
          ${className}
        `.trim()}
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";
