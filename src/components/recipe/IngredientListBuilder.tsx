"use client";

import { Ingredient } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type IngredientListBuilderProps = {
  ingredients: Ingredient[];
  onChange: (index: number, field: keyof Ingredient, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export function IngredientListBuilder({
  ingredients,
  onChange,
  onAdd,
  onRemove,
}: IngredientListBuilderProps) {
  const hasIngredients = ingredients.length > 0 && ingredients.some(ing => ing.name.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-[0.1rem]"><span className="text-lg">Ingredients</span></h3>
          <p className="text-xs text-muted mt-0.5">
            Add each ingredient with quantity and unit
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAdd}
        >
          + Add ingredient
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <div className="rounded-[--radius-card] border-2 border-dashed border-border bg-surface-2 p-6 text-center">
          <p className="text-sm text-muted mb-3">No ingredients added yet</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onAdd}
          >
            Add your first ingredient
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-[80px_80px_1fr] gap-2">
                <div>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Qty"
                    value={ing.quantity || ""}
                    onChange={(e) =>
                      onChange(idx, "quantity", parseFloat(e.target.value) || 0)
                    }
                    aria-label={`Ingredient ${idx + 1} quantity`}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => onChange(idx, "unit", e.target.value)}
                    aria-label={`Ingredient ${idx + 1} unit`}
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Ingredient name (e.g. fresh basil)"
                    value={ing.name}
                    onChange={(e) => onChange(idx, "name", e.target.value)}
                    aria-label={`Ingredient ${idx + 1} name`}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 mt-0.5"
                onClick={() => onRemove(idx)}
                aria-label={`Remove ingredient ${idx + 1}`}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}

      {!hasIngredients && ingredients.length > 0 && (
        <p className="text-xs text-muted italic">
          Tip: Fill in at least one complete ingredient to continue
        </p>
      )}
    </div>
  );
}
