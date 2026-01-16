"use client";

import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";

interface IngredientDeletionProps {
  recipe: Recipe;
  deletions: Array<{ ingredientId: string }>;
  lockedIngredients: string[];
  onAdd: (ingredientId: string) => void;
  onRemove: (index: number) => void;
}

export function IngredientDeletion({
  recipe,
  deletions,
  lockedIngredients,
  onAdd,
  onRemove,
}: IngredientDeletionProps) {
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    
    if (!selectedIngredient) {
      setError("Please select an ingredient to remove");
      return;
    }

    if (lockedIngredients.includes(selectedIngredient)) {
      setError("This ingredient is locked. Unlock it to remove.");
      return;
    }

    onAdd(selectedIngredient);
    setSelectedIngredient("");
  };

  const getIngredientName = (id: string) => {
    const index = parseInt(id.split("-")[1]);
    return recipe.ingredients[index]?.name || "Unknown";
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-2">Remove Ingredient</h3>
        <p className="text-xs text-muted mb-3">
          Remove an ingredient from the recipe. AI will adjust the recipe accordingly.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="ingredient-to-remove">
                Ingredient to remove
              </label>
              <select
                id="ingredient-to-remove"
                value={selectedIngredient}
                onChange={(e) => {
                  setSelectedIngredient(e.target.value);
                  setError("");
                }}
                className="w-full px-3 py-2 rounded-[--radius-input] border border-border bg-surface-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">Select ingredient...</option>
                {recipe.ingredients.map((ing, idx) => {
                  const id = `ingredient-${idx}`;
                  const isLocked = lockedIngredients.includes(id);
                  return (
                    <option key={id} value={id}>
                      {ing.name} {isLocked ? "🔒" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAdd}
          >
            Add Deletion
          </Button>

          {deletions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted">Queued Deletions:</p>
              {deletions.map((del, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-[--radius-input] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                >
                  <span className="text-sm">
                    Remove <strong>{getIngredientName(del.ingredientId)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    aria-label="Cancel deletion"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted italic">
                Removals will be applied when you regenerate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
