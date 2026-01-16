"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface TextLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isExpanded?: boolean;
}

export function TextLink({ 
  children, 
  isExpanded = false, 
  className = "",
  ...props 
}: TextLinkProps) {
  return (
    <button
      type="button"
      className={`
        text-xs text-accent dark:text-accent 
        hover:text-accent/80 dark:hover:text-accent/80 
        transition-colors duration-150
        underline-offset-[6px] underline decoration-accent/50 dark:decoration-accent/50
        hover:decoration-accent/70 dark:hover:decoration-accent/70
        p-0 h-auto font-normal bg-transparent border-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1
        ${className}
      `}
      aria-expanded={isExpanded}
      {...props}
    >
      {children}
    </button>
  );
}
