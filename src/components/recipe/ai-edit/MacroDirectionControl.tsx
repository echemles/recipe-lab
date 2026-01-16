"use client";

import { MacroDirection } from "@/app/recipe/[recipeNumber]/ai-edit/page";

interface MacroDirectionControlProps {
  macroDirection: {
    protein: MacroDirection;
    carbs: MacroDirection;
    fat: MacroDirection;
    magnitude?: "small" | "medium" | "large";
  };
  onUpdate: (macro: "protein" | "carbs" | "fat", direction: MacroDirection) => void;
}

const directions: Array<{ value: MacroDirection; label: string; icon: string }> = [
  { value: "down", label: "Less", icon: "↓" },
  { value: "neutral", label: "Same", icon: "−" },
  { value: "up", label: "More", icon: "↑" },
];

export function MacroDirectionControl({
  macroDirection,
  onUpdate,
}: MacroDirectionControlProps) {
  const renderMacroRow = (
    macro: "protein" | "carbs" | "fat",
    label: string
  ) => {
    return (
      <div key={macro} className="space-y-2">
        <label className="block text-xs font-medium text-muted">{label}</label>
        <div
          className="inline-flex rounded-full bg-surface-2 p-0.5 border border-border/50"
          role="radiogroup"
          aria-label={`${label} direction`}
        >
          {directions.map((dir, index) => (
            <button
              key={dir.value}
              type="button"
              onClick={() => onUpdate(macro, dir.value)}
              className={`
                relative px-3 py-1.5 text-xs font-medium transition-all duration-200
                ${index === 0 ? "rounded-l-full" : ""}
                ${index === directions.length - 1 ? "rounded-r-full" : ""}
                ${macroDirection[macro] === dir.value
                  ? "bg-accent text-accent-foreground shadow-sm z-10"
                  : "text-muted hover:text-foreground"
                }
              `}
              role="radio"
              aria-checked={macroDirection[macro] === dir.value}
              title={`${dir.label} ${label}`}
            >
              <span className="flex items-center gap-1">
                <span className="text-sm">{dir.icon}</span>
                <span>{dir.label}</span>
              </span> 
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Macro Content</h3>
        <p className="text-xs text-muted mb-3">
          Adjust the nutritional profile without specifying exact amounts
        </p>
      </div>

      <div className="space-y-4">
        {renderMacroRow("protein", "Protein")}
        {renderMacroRow("carbs", "Carbs")}
        {renderMacroRow("fat", "Fat")}
      </div>
    </div>
  );
}
