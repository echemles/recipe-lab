import { getRecipeById } from "@/data/recipeStore";
import RecipeDetailClient from "./RecipeDetailClient";

const NOT_FOUND_ILLUSTRATIONS = [
  "cauliflower.png",
  "carrots.png",
  "bag-with-pears.png",
  "leeks-in-bag.png",
  "bag-with-asparagus.png",
];

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
    const randomIllustration = NOT_FOUND_ILLUSTRATIONS[Math.floor(Math.random() * NOT_FOUND_ILLUSTRATIONS.length)];
    
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-16 px-6">
        <div className="flex flex-col items-center gap-8 max-w-md">
          {/* Watercolor illustration - above text with blur animation */}
          <div className="w-[280px] h-[280px] flex items-center justify-center">
            <img 
              src={`/illustrations/${randomIllustration}`}
              alt="" 
              className="w-full h-full object-contain animate-[blur-to-final_3s_ease-out_forwards]"
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold"><span className="font-caveat text-5xl">Recipe not found</span></h1>
            <p className="text-muted mt-4">Recipe ID: {recipeNumber}</p>
          </div>
        </div>
      </main>
    );
  }

  return <RecipeDetailClient recipe={recipe} />;
}

