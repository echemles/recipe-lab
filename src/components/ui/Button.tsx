import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-bg tracking-[0.015em] cursor-pointer disabled:cursor-default";

    const variantStyles = {
      primary:
        "bg-accent-soft text-text hover:bg-accent hover:text-accent-foreground hover:shadow-soft hover:-translate-y-px rounded-[--radius-button] transition-all duration-200",
      secondary:
        "bg-surface-2 text-text border border-border hover:bg-surface-1 rounded-[--radius-button]",
      ghost: "text-muted hover:text-text hover:bg-surface-2 rounded-[--radius-button]",
    };

    const sizeStyles = {
      default: "px-4 py-2 text-base",
      sm: "px-3 py-1.5 text-sm",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
