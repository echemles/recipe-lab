"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Recipe, MacroInformation } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PrimaryNutritionMetrics } from "@/components/recipe/PrimaryNutritionMetrics";
import { createDraftFromPreview } from "@/lib/draftStore";

type RecipeDraft = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

export default function RecipePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<RecipeDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedRecipe, setSavedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const recipeData = searchParams.get("data");
    console.log("Preview page - recipeData from URL:", recipeData);
    
    if (!recipeData) {
      setError("No recipe data found");
      setLoading(false);
      return;
    }

    try {
      const decodedRecipe = JSON.parse(decodeURIComponent(recipeData)) as RecipeDraft;
      console.log("Preview page - decoded recipe:", decodedRecipe);
      setRecipe(decodedRecipe);
    } catch (err) {
      console.error("Preview page - error parsing recipe:", err);
      setError("Invalid recipe data");
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  async function handleSaveRecipe() {
    if (!recipe) return;

    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...recipe, isDraft: true }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to save recipe.");
      }

      const createdRecipe = data as Recipe;
      setSavedRecipe(createdRecipe);
      
      // Redirect to the recipe detail page after a short delay
      setTimeout(() => {
        router.push(`/recipe/${createdRecipe.id}`);
      }, 1500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save recipe.");
    } finally {
      setSaving(false);
    }
  }

  function handleGoBack() {
    router.back();
  }

  function handleEditAsDraft() {
    if (!recipe) return;

    try {
      const draft = createDraftFromPreview(recipe);
      router.push(`/drafts/${draft.id}`);
    } catch (err) {
      console.error("Failed to create draft:", err);
      setSaveError("Failed to create draft for editing.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-0">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading recipe preview...</p>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-0">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Preview Error</h1>
          <p className="text-muted mb-6">{error || "Recipe not found"}</p>
          <Button onClick={handleGoBack} variant="secondary">
            Go Back
          </Button>
        </Card>
      </main>
    );
  }

  if (savedRecipe) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-0">
        <Card className="p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="text-4xl">✨</div>
            <h1 className="text-2xl font-bold">Recipe Saved!</h1>
            <p className="text-muted">
              "{savedRecipe.title}" has been saved to your recipes.
            </p>
            <p className="text-sm text-muted">Redirecting to recipe details...</p>
          </motion.div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col pt-24 pb-16 px-4 sm:px-0">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold"><span className="font-caveat text-4xl sm:text-5xl">Recipe Preview</span></h1>
            <p className="text-muted mt-1">Review your AI-generated recipe before saving</p>
          </div>
          <Button onClick={handleGoBack} variant="secondary">
            Back to Generator
          </Button>
        </div>

        {/* Save Error */}
        {saveError && (
          <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-xl">⚠️</span>
              <p className="text-sm">{saveError}</p>
            </div>
          </Card>
        )}

        {/* Recipe Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-8">
            {/* Recipe Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3">{recipe.title}</h2>
              <p className="text-muted text-lg">{recipe.description}</p>
            </div>

            {/* Recipe Meta */}
            <div className="flex flex-wrap gap-3 mb-8 text-sm">
              {recipe.prepTimeMinutes && (
                <span className="rounded-full border border-border px-4 py-2">
                  Prep: {recipe.prepTimeMinutes} min
                </span>
              )}
              {typeof recipe.cookTimeMinutes === "number" && (
                <span className="rounded-full border border-border px-4 py-2">
                  {recipe.cookTimeMinutes === 0
                    ? "No cook time"
                    : `Cook: ${recipe.cookTimeMinutes} min`}
                </span>
              )}
              {recipe.servings && (
                <span className="rounded-full border border-border px-4 py-2">
                  Serves {recipe.servings}
                </span>
              )}
              {(recipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 text-accent px-4 py-2 border border-accent/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Ingredients and Steps */}
            <div className="grid gap-8 md:grid-cols-2 mb-8">
              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide text-muted">
                  Ingredients
                </h3>
                <ul className="space-y-3">
                  {(recipe.ingredients || []).map((ingredient, idx) => (
                    <li key={`${ingredient.name}-${idx}`} className="flex items-start gap-3">
                      <span className="text-accent mt-1">•</span>
                      <span>
                        {ingredient.quantity ? `${ingredient.quantity} ` : ""}
                        {ingredient.unit ? `${ingredient.unit} ` : ""}
                        {ingredient.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide text-muted">
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {(recipe.steps || []).map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-accent font-semibold min-w-[2rem]">
                        {idx + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Nutrition Information */}
            {(recipe.macros) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 uppercase tracking-wide text-muted">
                  Nutrition Information
                </h3>
                
                <PrimaryNutritionMetrics macros={recipe.macros} />
                
                <p className="text-xs text-muted text-center mt-3">
                  Estimated nutrition information per serving ({recipe.servings || 1} {recipe.servings === 1 ? 'serving' : 'servings'})
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
              <Button
                onClick={handleSaveRecipe}
                disabled={saving}
                variant="primary"
                className="flex-1"
              >
                {saving ? "Saving..." : "Save to My Recipes"}
              </Button>
              <Button
                onClick={handleEditAsDraft}
                variant="secondary"
                disabled={saving}
              >
                Edit as Draft
              </Button>
              <Button
                onClick={handleGoBack}
                variant="ghost"
                disabled={saving}
              >
                Back to Generator
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
