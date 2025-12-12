"use client";

import React, { useId, useState } from "react";

type TooltipIconProps = {
  label: string;
};

export function TooltipIcon({ label }: TooltipIconProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600 bg-gray-50 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-400 transition-colors cursor-help focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="More info about this ingredient"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-10 max-w-xs rounded-md bg-gray-900 text-gray-100 text-xs px-3 py-2 shadow-lg border border-gray-700"
        >
          {label}
        </span>
      )}
    </span>
  );
}
