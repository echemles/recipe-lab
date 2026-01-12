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
        text-xs text-green-600 dark:text-green-400 
        hover:text-green-700 dark:hover:text-green-300 
        transition-colors duration-150
        underline-offset-[6px] underline decoration-green-600/50 dark:decoration-green-400/50
        hover:decoration-green-700/70 dark:hover:decoration-green-300/70
        p-0 h-auto font-normal bg-transparent border-none cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-1
        ${className}
      `}
      aria-expanded={isExpanded}
      {...props}
    >
      {children}
    </button>
  );
}
