import { NextResponse } from "next/server";
import { generateRecipeDraft } from "@/lib/aiRecipe";

type GenerateRecipeRequest = {
  title?: string;
  description?: string;
  pantryItems?: string[];
  cookingMode?: "beginner" | "traditional" | "weeknight" | "chef" | "experimental";
  constraints?: {
    techniqueComplexity: string;
    allowedVariations: string;
    specialtyIngredients: boolean;
    guidanceLevel: string;
  };
  preferences?: {
    highProtein?: boolean;
    quickMeal?: boolean;
    lowCalorie?: boolean;
    mealPrepFriendly?: boolean;
    lowCost?: boolean;
    budgetFriendly?: boolean;
    lowCarb?: boolean;
    glutenFree?: boolean;
    vegetarian?: boolean;
    vegan?: boolean;
    spicy?: boolean;
  };
};

export async function POST(request: Request) {
  let body: GenerateRecipeRequest;
  try {
    body = (await request.json()) as GenerateRecipeRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  try {
    const recipe = await generateRecipeDraft({
      title: body.title,
      description: body.description,
      pantryItems: body.pantryItems,
      cookingMode: body.cookingMode,
      constraints: body.constraints,
      preferences: body.preferences,
    });
    return NextResponse.json(recipe);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate recipe.";
    console.error("[recipe-generate]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
