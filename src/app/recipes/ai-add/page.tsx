"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type CreatedRecipeResponse = {
  recipe: Recipe;
};

type RecipeDraft = Omit<Recipe, "id" | "createdAt" | "updatedAt">;

const LOADING_MESSAGES = [
  "Composing flavors with quiet precision.",
  "Layering textures for perfect balance.",
  "Curating ingredients to suit your brief.",
  "Refining steps for a graceful flow.",
  "Tasting every detail before the reveal.",
];

function getRandomLoadingMessage() {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
}

export default function AiAddRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pantryInput, setPantryInput] = useState("");
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [palateLevel, setPalateLevel] = useState(5);
  const [highProtein, setHighProtein] = useState(false);
  const [quickMeal, setQuickMeal] = useState(false);
  const [lowCalorie, setLowCalorie] = useState(false);
  const [mealPrepFriendly, setMealPrepFriendly] = useState(false);
  const [lowCost, setLowCost] = useState(false);
  const [budgetFriendly, setBudgetFriendly] = useState(false);
  const [lowCarb, setLowCarb] = useState(false);
  const [glutenFree, setGlutenFree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdRecipe, setCreatedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalState, setModalState] = useState<"idle" | "loading" | "preview" | "error" | "redirecting">("idle");
  const [loadingMessage, setLoadingMessage] = useState(getRandomLoadingMessage());
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDraft | null>(null);
  const [modalError, setModalError] = useState("");
  const [redirectingRecipe, setRedirectingRecipe] = useState<Recipe | null>(null);
  const [redirectTitle, setRedirectTitle] = useState("");
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canCloseModal = modalState !== "redirecting";
  const showPreview = modalState === "preview" && generatedRecipe;
  const isRedirecting = modalState === "redirecting";

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

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

  function buildGenerationPayload() {
    return {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      pantryItems,
      palateLevel,
      preferences: {
        highProtein,
        quickMeal,
        lowCalorie,
        mealPrepFriendly,
        lowCost,
        budgetFriendly,
        lowCarb,
        glutenFree,
      },
    };
  }

  async function generateRecipeFromInputs() {
    setSubmitting(true);
    setIsModalOpen(true);
    setModalState("loading");
    setLoadingMessage(getRandomLoadingMessage());
    setModalError("");

    try {
      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildGenerationPayload()),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to generate recipe.");
      }

      setGeneratedRecipe(data.recipe as RecipeDraft);
      setModalState("preview");
    } catch (err) {
      setModalState("error");
      setModalError(err instanceof Error ? err.message : "Failed to generate recipe.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setCreatedRecipe(null);
    setGeneratedRecipe(null);
    setModalError("");

    if (!description.trim() && pantryItems.length === 0) {
      setError("Provide a recipe description or at least one pantry item.");
      return;
    }

    await generateRecipeFromInputs();
  }

  async function handleRetryGenerate() {
    setModalState("loading");
    setLoadingMessage(getRandomLoadingMessage());
    await generateRecipeFromInputs();
  }

  async function handleSaveGeneratedRecipe() {
    if (!generatedRecipe) return;
    setRedirectTitle(generatedRecipe.title ?? "your recipe");
    setModalState("redirecting");
    setModalError("");
    setRedirectingRecipe(null);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedRecipe),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to save recipe.");
      }

      const createdRecipe = data as Recipe;
      setCreatedRecipe(createdRecipe);
      setRedirectingRecipe(createdRecipe);
      setRedirectTitle(createdRecipe.title);
      setGeneratedRecipe(null);
      setLoadingMessage(getRandomLoadingMessage());
      setTitle("");
      setDescription("");
      setPantryItems([]);
      setPalateLevel(5);
      setHighProtein(false);
      setQuickMeal(false);
      setLowCalorie(false);
      setMealPrepFriendly(false);
      setLowCost(false);
      setBudgetFriendly(false);
      setLowCarb(false);
      setGlutenFree(false);
      redirectTimeoutRef.current = setTimeout(() => {
        router.push(`/recipe/${createdRecipe.id}`);
      }, 900);
    } catch (err) {
      setRedirectTitle("");
      setModalState("error");
      setModalError(err instanceof Error ? err.message : "Failed to save recipe.");
    }
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setModalState("idle");
    setGeneratedRecipe(null);
    setModalError("");
    setRedirectTitle("");
    setLoadingMessage(getRandomLoadingMessage());
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Recipe Generator</h1>
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
              <div className="flex flex-col sm:flex-row gap-2">
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
                Additional Preferences (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    checked={quickMeal}
                    onChange={(e) => setQuickMeal(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Quick Meal (≤30 min)</span>
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
                    checked={lowCalorie}
                    onChange={(e) => setLowCalorie(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Low Calorie</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={mealPrepFriendly}
                    onChange={(e) => setMealPrepFriendly(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Meal-Prep Friendly</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-surface-2 p-2 rounded-[--radius-input] transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCost}
                    onChange={(e) => setLowCost(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm">Low Cost</span>
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (canCloseModal) handleCloseModal();
            }}
          />
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{
              scale: modalState === "redirecting" ? 0.85 : 1,
              maxWidth: modalState === "redirecting" ? 360 : 768,
            }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="relative z-10 w-full p-0 overflow-hidden"
          >
            <Card className="w-full h-full">
              {modalState === "loading" && (
                <div className="bg-[var(--bg-ai-light)] dark:bg-[var(--bg-ai-dark)] p-12">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="ai-loading-halo absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-white/5 to-transparent blur-3xl dark:from-white/10 dark:via-white/5 dark:to-transparent" />
                      <div className="relative flex size-28 items-center justify-center rounded-full border border-white/60 bg-white/80 shadow-[0_25px_80px_rgba(12,16,35,0.25)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/5">
                        <span className="ai-loading-emoji text-5xl" role="img" aria-label="Apple inspired chef">
                          🍏
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.55em] text-muted">AI Mise en Place</p>
                      <p className="text-3xl font-semibold leading-snug">{loadingMessage}</p>
                      <p className="text-sm text-muted max-w-xs mx-auto">
                        A quiet pause while our culinary model balances acid, heat, and rhythm just for you.
                      </p>
                    </div>
                    <div className="h-px w-28 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                    <p className="text-xs uppercase tracking-[0.35em] text-muted">Almost ready</p>
                  </div>
                </div>
              )}
            {modalState === "error" && (
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 text-red-600">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h3 className="text-xl font-semibold">Something burnt the soufflé</h3>
                    <p className="text-sm text-muted">{modalError}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button variant="secondary" onClick={handleRetryGenerate} disabled={submitting}>
                    Try Again
                  </Button>
                  <Button variant="ghost" onClick={handleCloseModal}>
                    Close
                  </Button>
                </div>
              </div>
            )}
            {showPreview && (
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted">Preview Recipe</p>
                    <h2 className="text-3xl font-bold mt-2">{generatedRecipe.title}</h2>
                    <p className="text-muted mt-3">{generatedRecipe.description}</p>
                  </div>
                  <button
                    className="text-muted hover:text-text"
                    onClick={handleCloseModal}
                    disabled={!canCloseModal}
                    aria-label="Close preview"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Ingredients</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {generatedRecipe.ingredients.map((ingredient, idx) => (
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
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Steps</h3>
                    <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm">
                      {generatedRecipe.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-muted">
                  {generatedRecipe.prepTimeMinutes && (
                    <span className="rounded-full border border-border px-4 py-1">
                      Prep {generatedRecipe.prepTimeMinutes} min
                    </span>
                  )}
                  {typeof generatedRecipe.cookTimeMinutes === "number" && (
                    <span className="rounded-full border border-border px-4 py-1">
                      {generatedRecipe.cookTimeMinutes === 0
                        ? "No cook time"
                        : `Cook ${generatedRecipe.cookTimeMinutes} min`}
                    </span>
                  )}
                  {generatedRecipe.servings && (
                    <span className="rounded-full border border-border px-4 py-1">
                      Serves {generatedRecipe.servings}
                    </span>
                  )}
                  {(generatedRecipe.tags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full border border-border px-4 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
                  <Button variant="ghost" onClick={handleCloseModal} disabled={!canCloseModal}>
                    Dismiss
                  </Button>
                  <Button onClick={handleSaveGeneratedRecipe} disabled={isRedirecting}>
                    {isRedirecting ? "Saving…" : "Save to Recipes"}
                  </Button>
                </div>
              </div>
            )}
            {modalState === "redirecting" && (
              <div className="p-10 text-center space-y-5 bg-[var(--bg-ai-light)] dark:bg-[var(--bg-ai-dark)]">
                <div className="flex items-center justify-center gap-3 text-4xl">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    🚀
                  </motion.span>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🍽️
                  </motion.span>
                </div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted">
                  Redirecting
                </p>
                <p className="text-2xl font-semibold">
                  Opening {redirectingRecipe?.title ?? redirectTitle}
                </p>
                <p className="text-muted text-sm max-w-sm mx-auto">
                  We saved your recipe and we’re taking you to the full details now.
                </p>
              </div>
            )}
            </Card>
          </motion.div>
        </div>
      )}
    </main>
  );
}
