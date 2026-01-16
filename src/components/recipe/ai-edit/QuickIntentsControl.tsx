"use client";

import { QuickIntent } from "@/app/recipe/[recipeNumber]/ai-edit/page";

interface QuickIntentsControlProps {
  selectedIntents: QuickIntent[];
  onToggle: (intent: QuickIntent) => void;
}

const intents: Array<{ value: QuickIntent; label: string }> = [
  { value: "crispier", label: "Make it crispier" },
  { value: "saucier", label: "Make it saucier" },
  { value: "brighter", label: "Make it brighter" },
  { value: "less_salty", label: "Make it less salty" },
];

export function QuickIntentsControl({
  selectedIntents,
  onToggle,
}: QuickIntentsControlProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-1">Quick Intents</h3>
        <p className="text-xs text-muted mb-3">
          Quick adjustments to flavor and texture
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {intents.map((intent) => {
          const isSelected = selectedIntents.includes(intent.value);
          return (
            <button
              key={intent.value}
              type="button"
              onClick={() => onToggle(intent.value)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${isSelected
                  ? "bg-accent text-accent-foreground border-2 border-accent shadow-sm"
                  : "bg-surface-2 text-foreground border border-border hover:border-accent/50 hover:bg-surface-1"
                }
              `}
              aria-pressed={isSelected}
            >
              {intent.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
