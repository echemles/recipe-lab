import { NextResponse } from "next/server";
import { addRecipe, getAllRecipes, RecipeInput } from "@/data/recipeStore";

export async function GET() {
  const recipes = await getAllRecipes();
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as RecipeInput;

  if (!payload.title?.trim() || !payload.description?.trim()) {
    return NextResponse.json(
      { message: "Title and description are required." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.ingredients) || payload.ingredients.length === 0) {
    return NextResponse.json(
      { message: "At least one ingredient is required." },
      { status: 400 }
    );
  }

  if (!Array.isArray(payload.steps) || payload.steps.length === 0) {
    return NextResponse.json(
      { message: "At least one step is required." },
      { status: 400 }
    );
  }

  const created = await addRecipe(payload);
  return NextResponse.json(created, { status: 201 });
}
