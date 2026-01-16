"use client";

import { Recipe } from "@/types/recipe";

interface StepsDisplayProps {
  recipe: Recipe;
}

export function StepsDisplay({ recipe }: StepsDisplayProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-[0.1rem]">
            <span className="text-lg">Instructions</span>
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Current recipe instructions (read-only). These will be replaced according to the updated ingredients automatically after regenerating the recipe. For manual edits on the steps, you can use the regular edit page.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recipe.steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <span className="text-sm font-semibold text-muted">{idx + 1}.</span>
            <p className="text-sm leading-relaxed text-foreground">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
