import Link from "next/link";
import React from "react";
import { getRecipeById } from "@/data/recipeStore";
import { TooltipIcon } from "@/components/TooltipIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

type RecipeDetailPageProps = {
  params: Promise<{
    recipeNumber: string;
  }>;
};

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { recipeNumber } = await params;

  const recipe = await getRecipeById(recipeNumber);

  if (!recipe) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-16">
        <h1 className="text-4xl font-bold">Recipe not found</h1>
        <p className="text-muted mt-4">Recipe ID: {recipeNumber}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between text-sm">
          <Link href="/recipes">
            <Button variant="ghost" size="sm">← Back to recipes</Button>
          </Link>
          <Link href={`/recipe/${recipe.id}/edit`} data-testid="edit-recipe-link">
            <Button variant="secondary" size="sm">Edit recipe</Button>
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-muted mb-8">{recipe.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {recipe.prepTimeMinutes !== undefined && (
            <Card className="p-4">
              <p className="text-sm text-muted">Prep Time</p>
              <p className="text-2xl font-semibold">{recipe.prepTimeMinutes} min</p>
            </Card>
          )}
          {recipe.cookTimeMinutes !== undefined && (
            <Card className="p-4">
              <p className="text-sm text-muted">Cook Time</p>
              <p className="text-2xl font-semibold">
                {recipe.cookTimeMinutes === 0 ? "No cook time" : `${recipe.cookTimeMinutes} min`}
              </p>
            </Card>
          )}
          {recipe.servings && (
            <Card className="p-4">
              <p className="text-sm text-muted">Servings</p>
              <p className="text-2xl font-semibold">{recipe.servings}</p>
            </Card>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <div className="ingredient-list">
            {recipe.ingredients.map((ingredient, index) => (
              <React.Fragment key={index}>
                <div className="rounded-[--radius-input] bg-surface-2 p-3">
                  <span className="quantity">
                    {ingredient.quantity}
                  </span>
                </div>
                <div className="rounded-[--radius-input] bg-surface-2 p-3">
                  <span className="unit">
                    {ingredient.unit}
                  </span>
                </div>
                <div className="rounded-[--radius-input] bg-surface-2 p-3">
                  <span className="name">
                    <span>
                      {ingredient.name}
                      {ingredient.note && (
                        <span className="text-muted ml-2">({ingredient.note})</span>
                      )}
                    </span>
                    {ingredient.tooltip && (
                      <TooltipIcon label={ingredient.tooltip} />
                    )}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[--radius-input] bg-accent/10 text-accent px-3 py-1 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
