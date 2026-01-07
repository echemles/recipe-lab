import Link from "next/link";
import { getAllRecipes } from "@/data/recipeStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
            {recipes.map((recipe) => (
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
                  <h2 className="text-2xl font-semibold mb-2">{recipe.title}</h2>
                  <p className="text-muted">{recipe.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
