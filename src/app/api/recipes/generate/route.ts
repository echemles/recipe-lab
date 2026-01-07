import { NextResponse } from "next/server";
import { generateRecipeDraft } from "@/lib/aiRecipe";

type GenerateRecipeRequest = {
  prompt?: string;
  pantryItems?: string[];
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
      prompt: body.prompt,
      pantryItems: body.pantryItems,
    });
    return NextResponse.json({ recipe });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate recipe.";
    console.error("[recipe-generate]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}
