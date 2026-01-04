import { NextResponse } from "next/server";
import { getRecipeById, updateRecipe, RecipeInput } from "@/data/recipeStore";

type RouteContext = {
  params: Promise<{
    recipeId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { recipeId } = await params;
  const recipe = await getRecipeById(recipeId);
  if (!recipe) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }
  return NextResponse.json(recipe);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { recipeId } = await params;
  const existing = await getRecipeById(recipeId);
  if (!existing) {
    return NextResponse.json({ message: "Recipe not found." }, { status: 404 });
  }

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

  const updated = await updateRecipe(existing.id, payload);
  return NextResponse.json(updated);
}
