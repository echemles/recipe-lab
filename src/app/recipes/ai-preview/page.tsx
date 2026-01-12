"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Recipe, MacroInformation } from "@/types/recipe";
import { createDraftFromPreview } from "@/lib/draftStore";
import { PrimaryNutritionMetrics } from "@/components/recipe/PrimaryNutritionMetrics";

type RecipeDraft = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

export default function AIPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recipe, setRecipe] = useState<RecipeDraft | null>(null);
  const [macros, setMacros] = useState<MacroInformation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [redirectTitle, setRedirectTitle] = useState("");
  const [redirectingRecipe, setRedirectingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const recipeData = searchParams.get('recipe');
    if (recipeData) {
      try {
        const parsedRecipe = JSON.parse(decodeURIComponent(recipeData)) as RecipeDraft;
        setRecipe(parsedRecipe);
        setRedirectTitle(parsedRecipe.title || "Generated Recipe");
        
        // Calculate macros for the recipe
        const calculateMacros = async () => {
          try {
            const response = await fetch('/api/estimate-macros', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ingredients: parsedRecipe.ingredients,
                servings: parsedRecipe.servings || 1
              })
            });
            
            if (response.ok) {
              const macrosData = await response.json() as MacroInformation & { _fallback?: boolean };
              setMacros({
                calories: macrosData.calories,
                protein: macrosData.protein,
                carbohydrates: macrosData.carbohydrates,
                fat: macrosData.fat,
                fiber: macrosData.fiber,
                sugar: macrosData.sugar,
                sodium: macrosData.sodium,
                cholesterol: macrosData.cholesterol,
                saturatedFat: macrosData.saturatedFat,
                unsaturatedFat: macrosData.unsaturatedFat,
              });
            }
          } catch (error) {
            console.error('Failed to calculate preview macros:', error);
          }
        };
        
        calculateMacros();
      } catch (error) {
        console.error('Failed to parse recipe data:', error);
        router.push('/recipes/ai-add');
      }
    } else {
      router.push('/recipes/ai-add');
    }
  }, [searchParams, router]);

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    setSubmitting(true);

    try {
      // Calculate macros before saving (in case they weren't calculated yet)
      let recipeMacros = macros;
      if (!recipeMacros) {
        try {
          const macrosResponse = await fetch('/api/estimate-macros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: recipe.ingredients,
              servings: recipe.servings || 1
            })
          });
          
          if (macrosResponse.ok) {
            const macrosData = await macrosResponse.json() as MacroInformation & { _fallback?: boolean };
            recipeMacros = {
              calories: macrosData.calories,
              protein: macrosData.protein,
              carbohydrates: macrosData.carbohydrates,
              fat: macrosData.fat,
              fiber: macrosData.fiber,
              sugar: macrosData.sugar,
              sodium: macrosData.sodium,
              cholesterol: macrosData.cholesterol,
              saturatedFat: macrosData.saturatedFat,
              unsaturatedFat: macrosData.unsaturatedFat,
            };
          }
        } catch (error) {
          console.error('Failed to calculate macros before save:', error);
        }
      }

      // Save recipe with macros included and draft flag
      const recipeWithMacros = {
        ...recipe,
        macros: recipeMacros,
        isDraft: true,
      };

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeWithMacros),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to save recipe.");
      }

      const createdRecipe = data as Recipe;
      setRedirectingRecipe(createdRecipe);
      
      // Redirect to the saved recipe after a short delay
      setTimeout(() => {
        router.push(`/recipe/${createdRecipe.id}`);
      }, 900);
    } catch (err) {
      console.error("Save error:", err);
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push('/recipes/ai-add');
  };

  const handleEditAsDraft = async () => {
    if (!recipe) return;
    
    try {
      // Save recipe as draft
      const draftId = createDraftFromPreview(recipe);
      
      // Redirect to draft edit page
      router.push(`/drafts/${draftId}`);
    } catch (error) {
      console.error('Failed to create draft:', error);
    }
  };

  if (!recipe) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-16">
        <div className="text-center">
          <p className="text-muted">Loading recipe...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleGoBack}>
            ← Back to AI Generator
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">✨ Generated Recipe Preview</h1>
          <p className="text-muted">Review your AI-generated recipe before saving</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold">{recipe.title}</h2>
              <p className="text-muted mt-3">{recipe.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li key={`${ingredient.name}-${idx}`} className="flex items-start gap-2">
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
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">
                  Steps
                </h3>
                <ol className="list-decimal pl-5 space-y-2">
                  {recipe.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            {macros && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted mb-3">
                  Nutrition Information
                </h3>
                
                <PrimaryNutritionMetrics macros={macros} />
                
                <p className="text-xs text-muted mt-3">
                  Estimated nutrition information per serving ({recipe.servings || 1} {recipe.servings === 1 ? 'serving' : 'servings'})
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              {recipe.prepTimeMinutes && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Prep: {recipe.prepTimeMinutes} min
                </span>
              )}
              {recipe.cookTimeMinutes && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Cook: {recipe.cookTimeMinutes} min
                </span>
              )}
              {recipe.servings && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Serves {recipe.servings}
                </span>
              )}
              {(recipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[--radius-input] bg-accent/10 text-accent px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div>
                <Button
                  onClick={handleSaveRecipe}
                  disabled={submitting}
                  variant="primary"
                  className="w-full"
                >
                  {submitting ? "Saving..." : "Save to My Recipes"}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleEditAsDraft} variant="secondary" className="flex-1">
                  Edit as Draft
                </Button>
                <Button onClick={handleGoBack} variant="ghost" className="flex-1">
                  Back
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
