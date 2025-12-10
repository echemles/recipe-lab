import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { sampleRecipe } from "@/data/sampleRecipe";

export default function RecipesPage() {
  const recipes: Recipe[] = [sampleRecipe];

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Recipes</h1>

      {recipes.length === 0 ? (
        <p className="text-gray-500">No recipes yet.</p>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="grid gap-4">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/recipe/${recipe.id}`}
                className="block rounded-md border border-gray-300 p-4 hover:shadow-md transition-shadow hover:border-blue-400"
              >
                <h2 className="text-2xl font-semibold">{recipe.title}</h2>
                <p className="text-gray-600 mt-2">{recipe.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
