import Image from "next/image";
import Link from "next/link";
import { getAllRecipes } from "@/data/recipeStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RecipeImageWithCredit } from "@/components/RecipeImageWithCredit";

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
] as const;

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <main className="recipes-listing flex min-h-screen flex-col items-center py-16">
      <div className="w-full max-w-4xl flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Recipes</h1>
          <p className="text-muted">
            Browse your saved dishes or let AI draft a new one.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/recipes/add">
            <Button variant="secondary" data-testid="create-recipe-button">+ Add Recipe</Button>
          </Link>
          <Link href="/recipes/ai-add">
            <Button variant="primary">✨ AI Add Recipe</Button>
          </Link>
        </div>
      </div>

      {recipes.length === 0 ? (
        <p className="text-muted">No recipes yet.</p>
      ) : (
        <div className="w-full max-w-4xl" data-testid="recipes-list">
          <div className="grid gap-4">
            {recipes.map((recipe) => {
              const normalizedTags =
                recipe.tags?.map((tag) => tag.toLowerCase()) ?? [];
              const matchedIcons = TAG_ICON_CONFIG.filter(({ tag }) =>
                normalizedTags.includes(tag)
              );

              return (
                <Link
                  key={recipe.id}
                  href={`/recipe/${recipe.id}`}
                  data-testid="recipe-link"
                  data-recipe-title={recipe.title}
                >
                  <Card
                    className="hover:shadow-deep transition-shadow cursor-pointer"
                    data-testid="recipe-card"
                    data-recipe-title={recipe.title}
                  >
                    {recipe.images?.length ? (
                      <div className="mb-4">
                        <RecipeImageWithCredit
                          image={recipe.images[0]}
                          utmSource="recipe-lab"
                          variant="card"
                          altFallback={recipe.title}
                        />
                      </div>
                    ) : (
                      <div className="relative w-full h-48 rounded-md bg-muted/20 flex items-center justify-center text-muted text-xs uppercase tracking-wide mb-4">
                        No image selected yet
                      </div>
                    )}

                    <h2 className="text-2xl font-semibold mb-2">
                      {recipe.title}
                    </h2>
                    <p className="text-muted">{recipe.description}</p>

                    {matchedIcons.length > 0 && (
                      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
                        {matchedIcons.map(({ tag, label, icon }) => (
                          <span
                            key={tag}
                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted"
                          >
                            <span className="relative h-6 w-6">
                              <Image
                                src={icon}
                                alt={label}
                                fill
                                sizes="24px"
                                className="recipe-tag-icon object-contain"
                              />
                            </span>
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
