import { Recipe } from "@/types/recipe";
import { sampleRecipe } from "./sampleRecipe";

// In-memory store for recipes (persists during dev session)
const recipes: Recipe[] = [sampleRecipe];

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipeById(id: string): Recipe | null {
  return recipes.find((r) => r.id === id) ?? null;
}

export function addRecipe(recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">): Recipe {
  const now = new Date().toISOString();
  const newRecipe: Recipe = {
    ...recipe,
    id: String(recipes.length + 1),
    createdAt: now,
    updatedAt: now,
  };
  recipes.push(newRecipe);
  return newRecipe;
}
