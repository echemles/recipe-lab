"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { RecipeImageWithCredit } from "@/components/RecipeImageWithCredit";
import type { Recipe } from "@/types/recipe";

const TAG_ICON_CONFIG = [
  {
    tag: "gluten-free",
    label: "Gluten-free",
    icon: "/icons/symbol-gluten-free.svg",
  },
  {
    tag: "quick meal (30 minutes or less)",
    label: "Quick meal",
    icon: "/icons/symbol-fast-meal.svg",
  },
  {
    tag: "high protein",
    label: "High protein",
    icon: "/icons/symbol-high-protein.svg",
  },
  {
    tag: "low-calorie",
    label: "Low calorie",
    icon: "/icons/symbol-low-calorie.svg",
  },
  {
    tag: "meal-prep friendly",
    label: "Meal-prep",
    icon: "/icons/symbol-meal-prep-friendly.svg",
  },
  {
    tag: "low cost",
    label: "Low cost",
    icon: "/icons/symbol-low-cost.svg",
  },
  {
    tag: "spicy",
    label: "Spicy",
    icon: "/icons/symbol-spicy.svg",
  },
  {
    tag: "vegan",
    label: "Vegan",
    icon: "/icons/symbol-vegan.svg",
  },
  {
    tag: "low-carb",
    label: "Low-carb",
    icon: "/icons/symbol-low-carb.svg",
  },
] as const;

interface SearchableRecipesListProps {
  recipes: Recipe[];
}

export function SearchableRecipesList({ recipes }: SearchableRecipesListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRecipes = useMemo(() => {
    if (!normalizedQuery) return recipes;

    return recipes.filter((recipe) => {
      const tagsText = recipe.tags?.join(" ") ?? "";
      const ingredientText = recipe.ingredients
        .map((ingredient) => `${ingredient.name} ${ingredient.note ?? ""}`)
        .join(" ");
      const stepsText = recipe.steps?.join(" ") ?? "";

      const haystack = `${recipe.title} ${recipe.description} ${tagsText} ${ingredientText} ${stepsText}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [recipes, normalizedQuery]);

  const searchSummary = normalizedQuery
    ? filteredRecipes.length === 0
      ? `No recipes match “${query}”`
      : `Showing ${filteredRecipes.length} of ${recipes.length} recipes for “${query}”`
    : `Showing ${recipes.length} recipes`;

  return (
    <section className="w-full max-w-6xl flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted z-10">
            <SearchIcon />
          </span>
          <Input
            type="search"
            value={query}
            data-testid="recipes-search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, ingredient, tag, or description"
            aria-label="Search recipes"
            className="pl-10 pr-2 py-3 text-base border-border/70 shadow-sm"
            autoComplete="off"
          />
        </div>
        <p className="text-sm text-muted text-right">{searchSummary}</p>
      </div>

      <div className="w-full" data-testid="recipes-list">
        {filteredRecipes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 px-6 py-12 text-center text-muted">
            <p className="text-base font-semibold text-text">No recipes found</p>
            <p className="text-sm mt-1">
              Try a different search term or clear the filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[50px]">
            {filteredRecipes.map((recipe, index) => {
              const normalizedTags =
                recipe.tags?.map((tag) => tag.toLowerCase()) ?? [];
              const matchedIcons = TAG_ICON_CONFIG.filter(({ tag }) =>
                normalizedTags.includes(tag)
              );

              const contentLength =
                recipe.title.length +
                recipe.description.length +
                recipe.ingredients.length * 10;
              const baseRowSpan = 6;
              const extraRows = Math.min(Math.floor(contentLength / 100), 4);
              // Add extra rows for icons that wrap to multiple lines (3 icons per row)
              const iconRows = matchedIcons.length > 0 ? Math.ceil(matchedIcons.length / 3) : 0;
              const iconExtraRows = Math.max(0, iconRows - 1); // Subtract 1 since first row is already accounted for
              const rowSpan = baseRowSpan + extraRows + iconExtraRows;
              const animationDelay = `${Math.min(index, 12) * 60}ms`;

              const cardStyle = {
                gridRowEnd: `span ${rowSpan}`,
                animationDelay,
              };

              return (
                <Link
                  key={recipe.id}
                  href={`/recipe/${recipe.id}`}
                  data-testid="recipe-link"
                  data-recipe-title={recipe.title}
                  className="block recipe-card-animate"
                  data-animation-index={index}
                  style={cardStyle}
                >
                  <Card
                    className="hover:shadow-deep transition-shadow cursor-pointer h-full flex flex-col"
                    data-testid="recipe-card"
                    data-recipe-title={recipe.title}
                  >
                    <div className="flex-shrink-0">
                      {recipe.images?.length ? (
                        <div className="mb-4">
                          <RecipeImageWithCredit
                            image={recipe.images[0]}
                            utmSource="recipe-lab"
                            variant="card"
                            altFallback={recipe.title}
                            allowClickableCredits={false}
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-48 rounded-md bg-muted/20 flex items-center justify-center text-muted text-xs uppercase tracking-wide mb-4">
                          No image selected yet
                        </div>
                      )}
                    </div>

                    <div className="flex-grow flex flex-col">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {recipe.title}
                      </h3>
                      <p className="text-muted text-sm line-clamp-3 flex-grow">
                        {recipe.description}
                      </p>

                      {matchedIcons.length > 0 && (
                        <div className="mt-auto pt-4 border-t border-border/40">
                          <div className="flex flex-wrap items-center gap-3">
                            {matchedIcons.map(({ tag, label, icon }) => (
                              <span
                                key={tag}
                                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted"
                              >
                                <span className="relative h-5 w-5">
                                  <Image
                                    src={icon}
                                    alt={label}
                                    fill
                                    sizes="20px"
                                    className="recipe-tag-icon object-contain"
                                  />
                                </span>
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-hidden="true"
      className="text-current"
    >
      <path
        d="M10.5 4.5a6 6 0 104.243 10.243l4.257 4.257 1.06-1.06-4.257-4.258A6 6 0 0010.5 4.5zm0 1.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z"
        fill="currentColor"
      />
    </svg>
  );
}
