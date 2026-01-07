"use client";

import Link from "next/link";
import { useState } from "react";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type CreatedRecipeResponse = {
  recipe: Recipe;
};

export default function AiAddRecipePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pantryInput, setPantryInput] = useState("");
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [palateLevel, setPalateLevel] = useState(5);
  const [highProtein, setHighProtein] = useState(false);
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [localIngredients, setLocalIngredients] = useState(false);
  const [lowCarb, setLowCarb] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);

  function handleAddPantryItem() {
    const trimmed = pantryInput.trim();
    if (trimmed && !pantryItems.includes(trimmed)) {
      setPantryItems([...pantryItems, trimmed]);
      setPantryInput("");
    }
  }

  function handleRemovePantryItem(item: string) {
    setPantryItems(pantryItems.filter((i) => i !== item));
  }

  function handlePantryKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPantryItem();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setCreatedRecipe(null);

    if (!description.trim() && pantryItems.length === 0) {
      setError("Provide a recipe description or at least one pantry item.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/recipes/ai-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          pantryItems,
          palateLevel,
          preferences: {
            highProtein,
            budgetFriendly,
            localIngredients,
            lowCarb,
            glutenFree,
          },
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Unable to save recipe.");
      }

      const data = (await response.json()) as CreatedRecipeResponse;
      setCreatedRecipe(data.recipe);
      setSuccessMessage(
        `"${data.recipe.title}" saved! Review it anytime from your recipe list.`
      );
      setTitle("");
      setDescription("");
      setPantryItems([]);
      setPalateLevel(5);
      setHighProtein(false);
      setBudgetFriendly(false);
      setLocalIngredients(false);
      setLowCarb(false);
      setGlutenFree(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Recipe Generator</h1>
            <p className="text-muted">Describe what you want, and AI will create a complete recipe</p>
          </div>
          <Link href="/recipes">
            <Button variant="secondary" size="sm">Back to Recipes</Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-[--radius-input] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="rounded-[--radius-input] bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 text-green-800 dark:text-green-200">
            {successMessage}{" "}
            {createdRecipe && (
              <Link
                className="underline font-semibold"
                href={`/recipe/${createdRecipe.id}`}
              >
                View recipe →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1 letter-spac">What would you like to make?</h2>
              <p className="text-sm text-muted mb-4">Give the AI a starting point for your recipe</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="title">
                Recipe Name (Optional)
              </label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Citrus Pasta Primavera"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="description">
                Recipe Description *
              </label>
              <p className="text-xs text-muted mb-1">
                Describe the dish, flavor profile, or cooking style you want
              </p>
              <Textarea
                id="description"
                rows={4}
                placeholder="e.g. A light pasta with fresh vegetables and citrus notes, perfect for spring..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-[0.1rem] mb-1">Ingredients You Have</h2>
              <p className="text-sm text-muted">Tell the AI what's in your pantry (optional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 tracking-[0.005em]" htmlFor="pantryInput">
                Add Pantry Items
              </label>
              <div className="flex gap-2">
                <Input
                  id="pantryInput"
                  type="text"
                  className="flex-1"
                  placeholder="e.g. canned artichokes, fresh basil"
                  value={pantryInput}
                  onChange={(e) => setPantryInput(e.target.value)}
                  onKeyDown={handlePantryKeyDown}
                />
                <Button
                  type="button"
                  onClick={handleAddPantryItem}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
            </div>

            {pantryItems.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {pantryItems.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-[--radius-input] bg-accent/10 border border-accent/20 px-3 py-1 text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemovePantryItem(item)}
                      className="hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted italic">No pantry items added yet</p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-[0.1rem] mb-1">Flavor & Preferences</h2>
              <p className="text-sm text-muted">Customize the recipe to your taste</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 tracking-[0.005em]">
                Flavor Complexity: <span className="font-semibold text-accent">{palateLevel <= 3 ? 'Mild & Familiar' : palateLevel <= 7 ? 'Moderate' : 'Bold & Adventurous'}</span>
              </label>
              <p className="text-xs text-muted mb-3">
                {palateLevel <= 3 && "Classic flavors and common ingredients"}
                {palateLevel > 3 && palateLevel <= 7 && "Balanced flavors with some variety"}
                {palateLevel > 7 && "Unique combinations and bold seasonings"}
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={palateLevel}
                onChange={(e) => setPalateLevel(Number(e.target.value))}
                className="w-full h-2 bg-surface-2 rounded-[--radius-input] appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Mild</span>
                <span className="font-medium">{palateLevel}</span>
                <span>Adventurous</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3 tracking-[0.005em]">
                Dietary Requirements (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={highProtein}
                    onChange={(e) => setHighProtein(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">High Protein</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCarb}
                    onChange={(e) => setLowCarb(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Low-Carb</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={glutenFree}
                    onChange={(e) => setGlutenFree(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Gluten-Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={budgetFriendly}
                    onChange={(e) => setBudgetFriendly(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Budget-Friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors col-span-2">
                  <input
                    type="checkbox"
                    checked={localIngredients}
                    onChange={(e) => setLocalIngredients(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Use Locally Available Ingredients</span>
                </label>
              </div>
            </div>
          </Card>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              variant="primary"
              className="w-full text-lg py-3"
            >
              {submitting ? "✨ Generating Recipe..." : "✨ Generate & Save Recipe"}
            </Button>
            <p className="text-xs text-muted text-center mt-2">
              AI will create a complete recipe with ingredients and instructions
            </p>
          </div>
        </form>

        {createdRecipe && (
          <Card className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">✨</span>
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Generated Recipe
                </p>
              </div>
              <h2 className="text-2xl font-bold">{createdRecipe.title}</h2>
            </div>
            <p className="text-muted mb-6">{createdRecipe.description}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  Ingredients
                </h3>
                <ul className="mt-2 list-disc pl-5">
                  {createdRecipe.ingredients.slice(0, 8).map((ing, idx) => (
                    <li key={`${ing.name}-${idx}`}>
                      {ing.quantity ? `${ing.quantity} ` : ""}
                      {ing.unit ? `${ing.unit} ` : ""}
                      {ing.name}
                    </li>
                  ))}
                  {createdRecipe.ingredients.length > 8 && (
                    <li className="text-sm text-muted">
                      +{createdRecipe.ingredients.length - 8} more
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">
                  Steps
                </h3>
                <ol className="mt-2 list-decimal pl-5">
                  {createdRecipe.steps.slice(0, 4).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                  {createdRecipe.steps.length > 4 && (
                    <li className="text-sm text-muted">
                      + more steps in the full recipe
                    </li>
                  )}
                </ol>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              {createdRecipe.prepTimeMinutes && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Prep: {createdRecipe.prepTimeMinutes} min
                </span>
              )}
              {createdRecipe.cookTimeMinutes && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Cook: {createdRecipe.cookTimeMinutes} min
                </span>
              )}
              {createdRecipe.servings && (
                <span className="rounded-[--radius-input] bg-surface-2 px-3 py-1">
                  Serves {createdRecipe.servings}
                </span>
              )}
              {(createdRecipe.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-[--radius-input] bg-accent/10 text-accent px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
