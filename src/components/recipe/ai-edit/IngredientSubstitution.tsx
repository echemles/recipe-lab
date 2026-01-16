"use client";

import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface IngredientSubstitutionProps {
  recipe: Recipe;
  substitutions: Array<{ fromIngredientId: string; toText?: string | null }>;
  lockedIngredients: string[];
  onAdd: (fromIngredientId: string, toText?: string | null) => void;
  onRemove: (index: number) => void;
}

export function IngredientSubstitution({
  recipe,
  substitutions,
  lockedIngredients,
  onAdd,
  onRemove,
}: IngredientSubstitutionProps) {
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [replacementText, setReplacementText] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    
    if (!selectedIngredient) {
      setError("Please select an ingredient to replace");
      return;
    }

    if (lockedIngredients.includes(selectedIngredient)) {
      setError("This ingredient is locked. Unlock it to replace.");
      return;
    }

    onAdd(selectedIngredient, replacementText.trim() || null);
    setSelectedIngredient("");
    setReplacementText("");
  };

  const getIngredientName = (id: string) => {
    const index = parseInt(id.split("-")[1]);
    return recipe.ingredients[index]?.name || "Unknown";
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-2">Substitute Ingredient</h3>
        <p className="text-xs text-muted mb-3">
          Replace an ingredient with something else. Leave replacement empty for AI to choose.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="ingredient-to-replace">
                Ingredient to replace
              </label>
              <select
                id="ingredient-to-replace"
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

            <div>
              <label className="block text-xs font-medium mb-1" htmlFor="replacement-text">
                Replace with (optional)
              </label>
              <Input
                id="replacement-text"
                type="text"
                placeholder="e.g. chicken breast"
                value={replacementText}
                onChange={(e) => setReplacementText(e.target.value)}
              />
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
            Add Substitution
          </Button>

          {substitutions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted">Queued Substitutions:</p>
              {substitutions.map((sub, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-[--radius-input] bg-accent/10 border border-accent/20"
                >
                  <span className="text-sm">
                    Replace <strong>{getIngredientName(sub.fromIngredientId)}</strong>
                    {sub.toText ? ` with ${sub.toText}` : " (AI will choose)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    aria-label="Remove substitution"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted italic">
                Replacements will be applied when you regenerate.
              </p>
            </div>
          )}
        </div>
      </div>

      </div>
  );
}
