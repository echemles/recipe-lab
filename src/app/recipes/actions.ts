"use server";

import { getAllRecipes } from "@/data/recipeStore";
import { Recipe } from "@/types/recipe";

export async function fetchRecipes(): Promise<Recipe[]> {
  const recipes = await getAllRecipes();
  // Shuffle recipes for random order
  return [...recipes].sort(() => Math.random() - 0.5);
}
