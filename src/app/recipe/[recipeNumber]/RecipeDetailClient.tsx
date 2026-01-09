"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Recipe } from "@/types/recipe";
import { TooltipIcon } from "@/components/TooltipIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecipeImageWithCredit } from "@/components/RecipeImageWithCredit";

interface RecipeDetailClientProps {
  recipe: Recipe;
}

const MIN_SERVINGS = 0;
const MAX_SERVINGS = 100;
const SERVING_STEP = 1;

function clampServings(value: number) {
  if (Number.isNaN(value)) return MIN_SERVINGS;
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, value));
}

function sanitizeNumericInput(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = normalized.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("")}`;
}

function formatQuantity(value: number) {
  if (Number.isNaN(value)) return "-";
  return Math.round(value).toString();
}

export default function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const baseServings = recipe.servings && recipe.servings > 0 ? recipe.servings : 1;
  const [servings, setServings] = useState(baseServings);
  const [servingsInput, setServingsInput] = useState(baseServings.toString());

  const scaleFactor = useMemo(() => {
    if (!baseServings || baseServings <= 0) return 1;
    return servings / baseServings;
  }, [servings, baseServings]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumericInput(event.target.value);
    if (sanitized === "") {
      setServings(baseServings);
      setServingsInput("");
      return;
    }

    const parsed = parseFloat(sanitized);
    if (Number.isNaN(parsed)) {
      setServings(baseServings);
      setServingsInput("");
      return;
    }

    const nextValue = clampServings(parsed);
    setServings(nextValue);
    setServingsInput(nextValue.toString());
  };

  const adjustServings = (delta: number) => {
    setServings((current) => {
      const next = clampServings(Number((current + delta).toFixed(2)));
      setServingsInput(next.toString());
      return next;
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-16 recipe-detail-animate">
      <div className="w-full max-w-4xl space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm recipe-detail-section" style={{ animationDelay: "60ms" }}>
          <Link href="/recipes">
            <Button variant="ghost" size="sm">
              ← Back to recipes
            </Button>
          </Link>
          <Link href={`/recipe/${recipe.id}/edit`} data-testid="edit-recipe-link">
            <Button variant="secondary" size="sm">
              Edit recipe
            </Button>
          </Link>
        </div>

        <div className="recipe-detail-section" style={{ animationDelay: "120ms" }}>
          <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
          <p className="text-muted">{recipe.description}</p>
        </div>

        <div className="recipe-detail-section" style={{ animationDelay: "180ms" }}>
          {recipe.images?.length ? (
            <div className="mb-8">
              <RecipeImageWithCredit
                image={recipe.images[0]}
                utmSource="recipe-lab"
                variant="hero"
                altFallback={recipe.title}
              />
            </div>
          ) : (
            <div className="relative w-full h-96 rounded-lg bg-muted/20 flex items-center justify-center text-muted text-sm uppercase tracking-wide mb-8">
              No image selected yet
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 recipe-detail-section" style={{ animationDelay: "220ms" }}>
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

          <Card className="p-4">
            <p className="text-sm text-muted">Servings</p>
            <div className="mt-2 relative">
              <input
                type="text"
                inputMode="decimal"
                min={MIN_SERVINGS}
                max={MAX_SERVINGS}
                step={SERVING_STEP}
                value={servingsInput}
                onChange={handleInputChange}
                className="servings-input w-full bg-transparent pr-12 text-2xl font-semibold focus:outline-none text-current"
                aria-label="Servings"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => adjustServings(SERVING_STEP)}
                  className="h-6 w-7 rounded-sm bg-surface-2 text-muted hover:text-foreground flex items-center justify-center"
                  aria-label="Increase servings"
                >
                  <ChevronUpIcon />
                </button>
                <button
                  type="button"
                  onClick={() => adjustServings(-SERVING_STEP)}
                  className="h-6 w-7 rounded-sm bg-surface-2 text-muted hover:text-foreground flex items-center justify-center"
                  aria-label="Decrease servings"
                >
                  <ChevronDownIcon />
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="recipe-detail-section" style={{ animationDelay: "280ms" }}>
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <div className="ingredient-list flex flex-col gap-3">
            {recipe.ingredients.map((ingredient, index) => {
              const scaledQuantity = ingredient.quantity * scaleFactor;
              return (
                <div
                  key={`${ingredient.name}-${index}`}
                  className="ingredient-item flex flex-col gap-2 rounded-[--radius-input] bg-surface-1/30 border border-border/20 p-3 sm:grid sm:grid-cols-[minmax(140px,200px)_1fr] sm:items-center sm:gap-4"
                >
                  <div className="ingredient-amount flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <span className="ingredient-quantity text-lg font-semibold">
                      {formatQuantity(scaledQuantity)}
                    </span>
                    {ingredient.unit && (
                      <span className="ingredient-unit uppercase tracking-wide text-xs text-muted">
                        {ingredient.unit}
                      </span>
                    )}
                  </div>
                  <div className="ingredient-name flex items-start justify-between gap-3 rounded-[--radius-input] bg-surface-2 px-3 py-2 sm:bg-transparent sm:px-0 sm:py-0">
                    <span className="font-medium leading-snug">
                      {ingredient.name}
                      {ingredient.note && (
                        <span className="ingredient-note text-muted ml-2">({ingredient.note})</span>
                      )}
                    </span>
                    {ingredient.tooltip && <TooltipIcon label={ingredient.tooltip} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="recipe-detail-section" style={{ animationDelay: "320ms" }}>
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="recipe-detail-section" style={{ animationDelay: "360ms" }}>
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

function ChevronUpIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 9.5l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 6.5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
