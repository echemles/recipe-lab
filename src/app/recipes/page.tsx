"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SearchableRecipesList } from "./SearchableRecipesList";
import { useEffect, useState } from "react";
import { Recipe } from "@/types/recipe";
import { fetchRecipes } from "./actions";

export const dynamic = "force-dynamic";

export default function RecipesPage() {
  useEffect(() => {
    // Ensure we start at the top of the page when navigating to recipes
    window.scrollTo(0, 0);
  }, []);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const fetchedRecipes = await fetchRecipes();
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error("Failed to load recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  if (loading) {
    return (
      <main className="recipes-listing flex min-h-screen flex-col items-center pt-24 pb-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted">Loading recipes...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="recipes-listing flex min-h-screen flex-col items-center pt-24 pb-16">
      <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2"><span className="font-caveat text-4xl sm:text-5xl">Recipes</span></h1>
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
        <div className="relative w-full flex flex-col items-center justify-center py-16">
          {/* Watercolor illustration - empty state atmospheric element */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            aria-hidden="true"
          >
            <img 
              src="/illustrations/bag-with-bread.png" 
              alt="" 
              className="w-[320px] h-[400px] object-contain animate-[blur-to-final_3s_ease-out_forwards]"
            />
          </div>
          <p className="text-muted text-lg relative z-10">No recipes yet.</p>
          <p className="text-muted/70 text-sm mt-2 relative z-10">Add your first recipe to get started.</p>
        </div>
      ) : (
        <SearchableRecipesList recipes={recipes} />
      )}
    </main>
  );
}
