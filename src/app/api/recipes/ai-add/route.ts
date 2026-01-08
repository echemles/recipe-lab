import { NextResponse } from "next/server";
import { addRecipe } from "@/data/recipeStore";
import { generateRecipeDraft } from "@/lib/aiRecipe";

type AutoAddRequest = {
  title?: string;
  description?: string;
  pantryItems?: string[];
  palateLevel?: number;
  preferences?: {
    highProtein?: boolean;
    quickMeal?: boolean;
    lowCalorie?: boolean;
    mealPrepFriendly?: boolean;
    lowCost?: boolean;
    budgetFriendly?: boolean;
    lowCarb?: boolean;
    glutenFree?: boolean;
  };
};

export async function POST(request: Request) {
  let body: AutoAddRequest;
  try {
    body = (await request.json()) as AutoAddRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  try {
    const recipeInput = await generateRecipeDraft({
      title: body.title,
      description: body.description,
      pantryItems: body.pantryItems,
      palateLevel: body.palateLevel,
      preferences: body.preferences,
    });
    const created = await addRecipe(recipeInput);
    return NextResponse.json({ recipe: created }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add recipe.";
    console.error("[recipe-ai-add]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
