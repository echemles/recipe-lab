"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Recipe } from "@/types/recipe";
import { RecipeEditor, RecipeInput } from "@/components/recipe/RecipeEditor";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeNumber = params.recipeNumber as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      try {
        const response = await fetch(`/api/recipes/${recipeNumber}`);
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message ?? "Recipe not found.");
        }
        const existing: Recipe = await response.json();
        setRecipe(existing);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [recipeNumber]);

  const handleSave = async (recipeData: RecipeInput) => {
    if (!recipe) {
      throw new Error("Recipe not loaded.");
    }

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to update recipe.");
      }

      router.push(`/recipe/${recipe.id}`);
    } catch (err) {
      throw err;
    }
  };

  const handleCancel = () => {
    router.push(`/recipe/${recipe?.id ?? recipeNumber}`);
  };

  const handleDelete = async () => {
    if (!recipe) return;
    
    if (!confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message ?? "Failed to delete recipe.");
      }

      router.push("/recipes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4 sm:px-0">
        <p className="text-muted">Loading recipe...</p>
      </main>
    );
  }

  if (error && !recipe) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4 sm:px-0">
        <h1 className="text-4xl font-bold mb-4">Error</h1>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <RecipeEditor
      initialRecipe={recipe}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
      saveButtonText="Save Changes"
      title="Edit Recipe"
      description="Update your recipe details"
      isDeleting={isDeleting}
    />
  );
}
