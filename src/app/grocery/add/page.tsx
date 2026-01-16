"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Recipe } from "@/types/recipe";
import { NormalizedIngredient } from "@/types/grocery";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function AddToGroceryListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("recipeId");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [normalizedIngredients, setNormalizedIngredients] = useState<NormalizedIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedQuantities, setEditedQuantities] = useState<Record<number, number>>({});
  const [removedIndices, setRemovedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!recipeId) {
      setError("No recipe ID provided");
      setIsLoading(false);
      return;
    }

    async function loadAndNormalize() {
      try {
        const recipeResponse = await fetch(`/api/recipes/${recipeId}`);
        if (!recipeResponse.ok) {
          throw new Error("Failed to fetch recipe");
        }
        const recipeData = await recipeResponse.json();
        setRecipe(recipeData);

        const normalizeResponse = await fetch("/api/grocery/normalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ingredients: recipeData.ingredients,
            recipeContext: {
              title: recipeData.title,
              servings: recipeData.servings,
            },
          }),
        });

        if (!normalizeResponse.ok) {
          throw new Error("Failed to normalize ingredients");
        }

        const { normalizedIngredients } = await normalizeResponse.json();
        setNormalizedIngredients(normalizedIngredients);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadAndNormalize();
  }, [recipeId]);

  const handleCancel = () => {
    router.back();
  };

  const handleQuantityChange = (index: number, value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0) {
      setEditedQuantities((prev) => ({ ...prev, [index]: parsed }));
    }
  };

  const handleRemove = (index: number) => {
    setRemovedIndices((prev) => new Set(prev).add(index));
  };

  const handleAddToList = async () => {
    if (!recipe) return;

    setIsSubmitting(true);
    try {
      const itemsToAdd = normalizedIngredients
        .map((item, index) => {
          if (removedIndices.has(index)) return null;
          
          return {
            ingredientName: item.ingredientName,
            quantity: editedQuantities[index] ?? item.suggestedQuantity,
            unit: item.suggestedUnit,
            packageDescription: item.packageDescription,
            category: item.category,
            isPurchased: false,
            sourceRecipeId: recipe.id,
            sourceRecipeTitle: recipe.title,
          };
        })
        .filter((item) => item !== null);

      const response = await fetch("/api/grocery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToAdd }),
      });

      if (!response.ok) {
        throw new Error("Failed to add items to grocery list");
      }

      router.push("/grocery");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add items");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <LoadingSpinner />
          <p className="text-sm text-muted">Standardizing ingredients for grocery purchase</p>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4">
        <div className="w-full max-w-2xl space-y-6">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted">{error}</p>
          <Button onClick={handleCancel}>Go back</Button>
        </div>
      </main>
    );
  }

  const activeIngredients = normalizedIngredients.filter((_, index) => !removedIndices.has(index));

  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Add to Grocery List</h1>
          <p className="text-muted">
            Review and adjust quantities before adding to your list
          </p>
          {recipe && (
            <p className="text-sm text-muted mt-2">From: {recipe.title}</p>
          )}
        </div>

        <div className="space-y-3">
          {normalizedIngredients.map((item, index) => {
            if (removedIndices.has(index)) return null;

            const currentQuantity = editedQuantities[index] ?? item.suggestedQuantity;

            return (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.ingredientName}</p>
                    {item.packageDescription && (
                      <p className="text-sm text-muted mt-1">{item.packageDescription}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={currentQuantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-border rounded bg-surface-1 text-foreground"
                    />
                    <span className="text-sm text-muted min-w-[3rem]">{item.suggestedUnit}</span>
                    <button
                      onClick={() => handleRemove(index)}
                      className="text-sm text-muted hover:text-foreground"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {activeIngredients.length === 0 && (
          <p className="text-center text-muted py-8">No items to add</p>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleAddToList}
            disabled={isSubmitting || activeIngredients.length === 0}
            className="flex-1"
          >
            {isSubmitting ? "Adding..." : "Add to grocery list"}
          </Button>
          <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function AddToGroceryListPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingSpinner />
      </div>
    }>
      <AddToGroceryListContent />
    </Suspense>
  );
}
