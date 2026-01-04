import Link from "next/link";
import { getRecipeById } from "@/data/recipeStore";
import { TooltipIcon } from "@/components/TooltipIcon";

export const dynamic = "force-dynamic";

type RecipeDetailPageProps = {
  params: {
    recipeNumber: string;
  };
};

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { recipeNumber } = params;

  const recipe = await getRecipeById(recipeNumber);

  if (!recipe) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Recipe not found</h1>
        <p className="text-gray-500 mt-4">Recipe ID: {recipeNumber}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between text-sm">
          <Link
            href="/recipes"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to recipes
          </Link>
          <Link
            href={`/recipe/${recipe.id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Edit recipe
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        <p className="text-gray-600 mb-8">{recipe.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {recipe.prepTimeMinutes && (
            <div className="rounded-md bg-gray-100 p-4">
              <p className="text-sm text-gray-600">Prep Time</p>
              <p className="text-2xl font-semibold">{recipe.prepTimeMinutes} min</p>
            </div>
          )}
          {recipe.cookTimeMinutes && (
            <div className="rounded-md bg-gray-100 p-4">
              <p className="text-sm text-gray-600">Cook Time</p>
              <p className="text-2xl font-semibold">{recipe.cookTimeMinutes} min</p>
            </div>
          )}
          {recipe.servings && (
            <div className="rounded-md bg-gray-100 p-4">
              <p className="text-sm text-gray-600">Servings</p>
              <p className="text-2xl font-semibold">{recipe.servings}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={index}
                className="flex items-start rounded-md bg-gray-50 p-3"
              >
                <span className="font-semibold mr-3">
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span className="flex items-center gap-2">
                  <span>
                    {ingredient.name}
                    {ingredient.note && (
                      <span className="text-gray-500 ml-2">({ingredient.note})</span>
                    )}
                  </span>
                  {ingredient.tooltip && (
                    <TooltipIcon label={ingredient.tooltip} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
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
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
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
