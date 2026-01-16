"use client";

import { Recipe } from "@/types/recipe";
import { ProposedChanges } from "@/app/recipe/[recipeNumber]/ai-edit/page";

interface ProposedChangesSummaryProps {
  proposedChanges: ProposedChanges;
  recipe: Recipe;
}

export function ProposedChangesSummary({
  proposedChanges,
  recipe,
}: ProposedChangesSummaryProps) {
  const getIngredientName = (id: string) => {
    const index = parseInt(id.split("-")[1]);
    return recipe.ingredients[index]?.name || "Unknown";
  };

  const hasChanges =
    proposedChanges.substitutions.length > 0 ||
    proposedChanges.deletions.length > 0 ||
    proposedChanges.ingredientModifications.length > 0 ||
    proposedChanges.macroDirection.protein !== "neutral" ||
    proposedChanges.macroDirection.carbs !== "neutral" ||
    proposedChanges.macroDirection.fat !== "neutral" ||
    proposedChanges.tasteRefinements.saltiness !== "neutral" ||
    proposedChanges.tasteRefinements.spiciness !== "neutral" ||
    proposedChanges.tasteRefinements.acidity !== "neutral" ||
    proposedChanges.tasteRefinements.sweetness !== "neutral" ||
    proposedChanges.tasteRefinements.richness !== "neutral" ||
    proposedChanges.notes.trim().length > 0 ||
    proposedChanges.pantryItems.length > 0;

  if (!hasChanges) {
    return (
      <div className="rounded-[--radius-input] bg-surface-2 border border-border p-4">
        <p className="text-sm text-muted italic">
          No changes proposed yet. Configure your desired changes below.
        </p>
      </div>
    );
  }

  const macroChanges = [];
  if (proposedChanges.macroDirection.protein !== "neutral") {
    macroChanges.push(`Protein ${proposedChanges.macroDirection.protein === "up" ? "↑" : "↓"}`);
  }
  if (proposedChanges.macroDirection.carbs !== "neutral") {
    macroChanges.push(`Carbs ${proposedChanges.macroDirection.carbs === "up" ? "↑" : "↓"}`);
  }
  if (proposedChanges.macroDirection.fat !== "neutral") {
    macroChanges.push(`Fat ${proposedChanges.macroDirection.fat === "up" ? "↑" : "↓"}`);
  }

  const tasteChanges = [];
  if (proposedChanges.tasteRefinements.saltiness !== "neutral") {
    tasteChanges.push(`Saltiness ${proposedChanges.tasteRefinements.saltiness === "up" ? "↑" : "↓"}`);
  }
  if (proposedChanges.tasteRefinements.spiciness !== "neutral") {
    tasteChanges.push(`Spiciness ${proposedChanges.tasteRefinements.spiciness === "up" ? "↑" : "↓"}`);
  }
  if (proposedChanges.tasteRefinements.acidity !== "neutral") {
    tasteChanges.push(`Acidity ${proposedChanges.tasteRefinements.acidity === "up" ? "↑" : "↓"}`);
  }
  if (proposedChanges.tasteRefinements.sweetness !== "neutral") {
    tasteChanges.push(`Sweetness ${proposedChanges.tasteRefinements.sweetness === "up" ? "↑" : "↓"}`);
  }
  if (proposedChanges.tasteRefinements.richness !== "neutral") {
    tasteChanges.push(`Richness ${proposedChanges.tasteRefinements.richness === "up" ? "↑" : "↓"}`);
  }

  return (
    <div className="rounded-[--radius-input] bg-accent/10 border border-accent/30 p-4">
      <h3 className="font-semibold mb-3">Proposed Changes Summary</h3>
      <div className="space-y-2 text-sm">
        {proposedChanges.substitutions.length > 0 && (
          <div>
            <span className="font-medium">Replace:</span>{" "}
            <ul className="mt-1 space-y-1">
              {proposedChanges.substitutions.map((sub, idx) => (
                <li key={idx} className="pl-2">
                  <div className="leading-tight">
                    {(() => {
                      const index = parseInt(sub.fromIngredientId.split("-")[1]);
                      const ingredient = recipe.ingredients[index];
                      return ingredient ? `${ingredient.quantity} ${ingredient.unit}` : "";
                    })()} {getIngredientName(sub.fromIngredientId)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposedChanges.deletions.length > 0 && (
          <div>
            <span className="font-medium">Remove:</span>{" "}
            <ul className="mt-1 space-y-1">
              {proposedChanges.deletions.map((del, idx) => (
                <li key={idx} className="pl-2">
                  <div className="leading-tight">
                    {(() => {
                      const index = parseInt(del.ingredientId.split("-")[1]);
                      const ingredient = recipe.ingredients[index];
                      return ingredient ? `${ingredient.quantity} ${ingredient.unit}` : "";
                    })()} {getIngredientName(del.ingredientId)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {proposedChanges.ingredientModifications.length > 0 && (
          <div>
            <span className="font-medium">Modified:</span>{" "}
            <ul className="mt-1 space-y-1">
              {proposedChanges.ingredientModifications.map((mod, idx) => (
                <li key={idx} className="pl-2">
                  <div className="leading-tight">
                    {(() => {
                      const index = parseInt(mod.ingredientId.split("-")[1]);
                      const ingredient = recipe.ingredients[index];
                      return ingredient ? `${ingredient.quantity} ${ingredient.unit}` : "";
                    })()} {getIngredientName(mod.ingredientId)}
                  </div>
                  <div className="text-xs text-muted">
                    {mod.field}: {mod.oldValue} → {mod.newValue}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {macroChanges.length > 0 && (
          <div>
            <span className="font-medium">Macro:</span> {macroChanges.join(", ")}
          </div>
        )}

        {tasteChanges.length > 0 && (
          <div>
            <span className="font-medium">Taste:</span> {tasteChanges.join(", ")}
          </div>
        )}

        {proposedChanges.notes.trim() && (
          <div>
            <span className="font-medium">Notes:</span> {proposedChanges.notes}
          </div>
        )}

        {proposedChanges.pantryItems.length > 0 && (
          <div>
            <span className="font-medium">Ingredient Additions:</span>{" "}
            <ul className="mt-1 space-y-1">
              {proposedChanges.pantryItems.map((item) => (
                <li key={item} className="pl-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
