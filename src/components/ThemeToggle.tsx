"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="text-sm text-muted hover:text-text transition-colors px-3 py-1.5 rounded-[--radius-button] tracking-[0.015em]"
        aria-label="Toggle theme"
      >
        Theme
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-sm text-muted hover:text-text transition-colors px-3 py-1.5 rounded-[--radius-button] hover:bg-surface-2 tracking-[0.015em]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
