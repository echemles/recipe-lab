import Link from "next/link";
import { getAllRecipes } from "@/data/recipeStore";
import { Button } from "@/components/ui/Button";
import { SearchableRecipesList } from "./SearchableRecipesList";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await getAllRecipes();
  // Shuffle recipes for random order
  const shuffledRecipes = [...recipes].sort(() => Math.random() - 0.5);

  return (
    <main className="recipes-listing flex min-h-screen flex-col items-center py-16">
      <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
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

      {shuffledRecipes.length === 0 ? (
        <p className="text-muted">No recipes yet.</p>
      ) : (
        <SearchableRecipesList recipes={shuffledRecipes} />
      )}
    </main>
  );
}
