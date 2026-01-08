import { getRecipeById } from "@/data/recipeStore";
import RecipeDetailClient from "./RecipeDetailClient";

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

  return <RecipeDetailClient recipe={recipe} />;
}

