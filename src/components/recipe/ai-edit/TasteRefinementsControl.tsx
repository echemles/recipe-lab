"use client";

import { TasteDirection } from "@/app/recipe/[recipeNumber]/ai-edit/page";

interface TasteRefinementsControlProps {
  tasteRefinements: {
    saltiness: TasteDirection;
    spiciness: TasteDirection;
    acidity: TasteDirection;
    sweetness: TasteDirection;
    richness: TasteDirection;
  };
  onUpdate: (taste: "saltiness" | "spiciness" | "acidity" | "sweetness" | "richness", direction: TasteDirection) => void;
}

const directions: Array<{ value: TasteDirection; label: string; icon: string }> = [
  { value: "up", label: "More", icon: "↑" },
  { value: "neutral", label: "Same", icon: "−" },
  { value: "down", label: "Less", icon: "↓" },
];

const tasteOptions: Array<{
  key: "saltiness" | "spiciness" | "acidity" | "sweetness" | "richness";
  label: string;
}> = [
  { key: "saltiness", label: "Saltiness" },
  { key: "spiciness", label: "Spiciness" },
  { key: "acidity", label: "Acidity" },
  { key: "sweetness", label: "Sweetness" },
  { key: "richness", label: "Richness" },
];

export function TasteRefinementsControl({
  tasteRefinements,
  onUpdate,
}: TasteRefinementsControlProps) {
  const renderTasteRow = (
    taste: "saltiness" | "spiciness" | "acidity" | "sweetness" | "richness",
    label: string
  ) => {
    return (
      <div key={taste} className="space-y-2 min-w-[90px] text-center">
        <label className="block text-xs font-medium text-muted">{label}</label>
        <div className="flex flex-col items-center gap-1" role="radiogroup" aria-label={`${label} direction`}>
          {directions.map((dir, index) => (
            <button
              key={dir.value}
              type="button"
              onClick={() => onUpdate(taste, dir.value)}
              className={`
                w-[30px] h-9 text-sm font-medium transition-colors flex items-center justify-center
                ${index === 0 ? "rounded-t-full" : index === directions.length - 1 ? "rounded-b-full" : ""}
                ${tasteRefinements[taste] === dir.value
                  ? "bg-accent text-accent-foreground shadow-sm z-10"
                  : "bg-surface-2 text-muted hover:bg-surface-3"
                }
              `}
              role="radio"
              aria-checked={tasteRefinements[taste] === dir.value}
              title={`${dir.label} ${label}`}
            >
              <span className="text-sm" aria-hidden="true">
                {dir.icon}
              </span>
              <span className="sr-only">{`${dir.label} ${label}`}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-1">Taste Refinements</h3>
        <p className="text-xs text-muted mb-3">
          Adjust the flavor profile to your preference
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasteOptions.map((option) =>
          renderTasteRow(option.key, option.label)
        )}
      </div>
    </div>
  );
}
