import { NextResponse } from "next/server";
import { Recipe, Ingredient } from "@/types/recipe";
import getOpenAIClient from "@/lib/openai";

const MODEL = process.env.OPENAI_RECIPE_MODEL ?? "gpt-4o-mini";

type MacroDirection = "down" | "neutral" | "up";
type TasteDirection = "down" | "neutral" | "up";

type RegenerateRequest = {
  originalRecipe: Recipe;
  locationHint: { country?: string; city?: string; locale?: string } | null;
  constraints: {
    preferLocal: boolean;
    avoidSpecialtyIngredients: boolean;
    maintainDishIntegrity: boolean;
  };
  locks: {
    lockedIngredientIds: string[];
  };
  changes: {
    substitutions: Array<{
      fromIngredientId: string;
      toText?: string | null;
    }>;
    deletions: Array<{
      ingredientId: string;
    }>;
    ingredientModifications: Array<{
      ingredientId: string;
      field: 'quantity' | 'unit' | 'name';
      oldValue: string | number;
      newValue: string | number;
    }>;
  };
  macroDirection: {
    protein: MacroDirection;
    carbs: MacroDirection;
    fat: MacroDirection;
    magnitude?: "small" | "medium" | "large";
  };
  tasteRefinements: {
    saltiness: TasteDirection;
    spiciness: TasteDirection;
    acidity: TasteDirection;
    sweetness: TasteDirection;
    richness: TasteDirection;
  };
  notes: string;
  pantryItems: string[];
};

export async function POST(
  request: Request,
  { params }: { params: { recipeId: string } }
) {
  let body: RegenerateRequest;
  try {
    body = (await request.json()) as RegenerateRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  try {
    const regeneratedRecipe = await regenerateRecipe(body);
    return NextResponse.json(regeneratedRecipe);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to regenerate recipe.";
    console.error("[recipe-regenerate]", message);
    return NextResponse.json({ message }, { status: 500 });
  }
}

async function regenerateRecipe(request: RegenerateRequest): Promise<Recipe> {
  const client = getOpenAIClient();
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(request);

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2500,
  });

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    console.error("[aiRecipeRegenerate] Empty message content");
    throw new Error("Failed to receive recipe content from model.");
  }

  let parsed: Partial<Recipe>;
  try {
    parsed = JSON.parse(content) as Partial<Recipe>;
  } catch (error) {
    console.error("[aiRecipeRegenerate] JSON parsing error:", error);
    throw new Error("Failed to parse recipe JSON from model.");
  }

  return {
    ...request.originalRecipe,
    title: parsed.title || request.originalRecipe.title,
    description: parsed.description || request.originalRecipe.description,
    ingredients: parsed.ingredients || request.originalRecipe.ingredients,
    steps: parsed.steps || request.originalRecipe.steps,
    prepTimeMinutes: parsed.prepTimeMinutes ?? request.originalRecipe.prepTimeMinutes,
    cookTimeMinutes: parsed.cookTimeMinutes ?? request.originalRecipe.cookTimeMinutes,
    servings: parsed.servings ?? request.originalRecipe.servings,
    tags: parsed.tags || request.originalRecipe.tags,
  };
}

function buildSystemPrompt(): string {
  return `You are a professional culinary assistant who regenerates recipes based on user-specified changes.

Your task is to modify an existing recipe according to the user's instructions while maintaining recipe integrity and coherence.

CRITICAL RULES:
1. Deleted ingredients MUST NOT appear anywhere in the regenerated recipe (ingredients list or instructions)
2. Locked ingredients MUST remain unchanged (same name, quantity, and unit)
3. When substituting ingredients, ensure the replacement makes culinary sense
4. If "Replace with" is blank, choose a suitable local/common replacement
5. Respect macro direction adjustments (increase/decrease protein/carbs/fat)
6. Apply quick intents (crispier, saucier, brighter, less salty) by adjusting techniques and ingredients
7. If constraints conflict, prioritize: locks > deletions > substitutions > macro adjustments

Always respond with valid JSON matching this exact structure:
{
  "title": "string",
  "description": "string (1-2 sentences)",
  "ingredients": [
    { "quantity": number, "unit": "string", "name": "string" }
  ],
  "steps": ["string"],
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "servings": number,
  "tags": ["string"]
}

Do NOT include markdown, code blocks, or explanations - just the JSON object.`;
}

function buildUserPrompt(request: RegenerateRequest): string {
  const parts: string[] = [];
  const { originalRecipe, constraints, locks, changes, macroDirection, tasteRefinements, notes, pantryItems, locationHint } = request;

  parts.push("ORIGINAL RECIPE:");
  parts.push(`Title: ${originalRecipe.title}`);
  parts.push(`Description: ${originalRecipe.description}`);
  parts.push("\nIngredients:");
  originalRecipe.ingredients.forEach((ing, idx) => {
    const ingredientId = `ingredient-${idx}`;
    const isLocked = locks.lockedIngredientIds.includes(ingredientId);
    parts.push(`${idx + 1}. ${ing.quantity} ${ing.unit} ${ing.name}${isLocked ? " [LOCKED - DO NOT CHANGE]" : ""}`);
  });
  parts.push("\nInstructions:");
  originalRecipe.steps.forEach((step, idx) => {
    parts.push(`${idx + 1}. ${step}`);
  });

  if (originalRecipe.prepTimeMinutes) {
    parts.push(`\nPrep Time: ${originalRecipe.prepTimeMinutes} minutes`);
  }
  if (originalRecipe.cookTimeMinutes) {
    parts.push(`Cook Time: ${originalRecipe.cookTimeMinutes} minutes`);
  }
  if (originalRecipe.servings) {
    parts.push(`Servings: ${originalRecipe.servings}`);
  }

  parts.push("\n--- REQUESTED CHANGES ---");

  if (changes.substitutions.length > 0) {
    parts.push("\nSUBSTITUTIONS:");
    changes.substitutions.forEach((sub) => {
      const index = parseInt(sub.fromIngredientId.split("-")[1]);
      const ingredient = originalRecipe.ingredients[index];
      if (ingredient) {
        if (sub.toText) {
          parts.push(`- Replace "${ingredient.name}" with "${sub.toText}"`);
        } else {
          parts.push(`- Replace "${ingredient.name}" with a suitable ${constraints.preferLocal ? "local" : "common"} alternative${constraints.avoidSpecialtyIngredients ? " (avoid specialty ingredients)" : ""}`);
        }
      }
    });
  }

  if (changes.deletions.length > 0) {
    parts.push("\nDELETIONS:");
    changes.deletions.forEach((del) => {
      const index = parseInt(del.ingredientId.split("-")[1]);
      const ingredient = originalRecipe.ingredients[index];
      if (ingredient) {
        parts.push(`- Remove "${ingredient.name}" completely from the recipe`);
      }
    });
    if (constraints.maintainDishIntegrity) {
      parts.push("IMPORTANT: Adjust the recipe to maintain dish integrity after deletions");
    }
  }

  const macroChanges: string[] = [];
  if (macroDirection.protein !== "neutral") {
    macroChanges.push(`${macroDirection.protein === "up" ? "Increase" : "Decrease"} protein content`);
  }
  if (macroDirection.carbs !== "neutral") {
    macroChanges.push(`${macroDirection.carbs === "up" ? "Increase" : "Decrease"} carbohydrate content`);
  }
  if (macroDirection.fat !== "neutral") {
    macroChanges.push(`${macroDirection.fat === "up" ? "Increase" : "Decrease"} fat content`);
  }

  if (macroChanges.length > 0) {
    parts.push("\nMACRO ADJUSTMENTS:");
    macroChanges.forEach(change => parts.push(`- ${change}`));
    if (macroDirection.magnitude) {
      parts.push(`Magnitude: ${macroDirection.magnitude}`);
    }
  }

  const tasteChanges: string[] = [];
  if (tasteRefinements.saltiness !== "neutral") {
    tasteChanges.push(`${tasteRefinements.saltiness === "up" ? "Increase" : "Decrease"} saltiness`);
  }
  if (tasteRefinements.spiciness !== "neutral") {
    tasteChanges.push(`${tasteRefinements.spiciness === "up" ? "Increase" : "Decrease"} spiciness`);
  }
  if (tasteRefinements.acidity !== "neutral") {
    tasteChanges.push(`${tasteRefinements.acidity === "up" ? "Increase" : "Decrease"} acidity`);
  }
  if (tasteRefinements.sweetness !== "neutral") {
    tasteChanges.push(`${tasteRefinements.sweetness === "up" ? "Increase" : "Decrease"} sweetness`);
  }
  if (tasteRefinements.richness !== "neutral") {
    tasteChanges.push(`${tasteRefinements.richness === "up" ? "Increase" : "Decrease"} richness`);
  }

  if (tasteChanges.length > 0) {
    parts.push("\nTASTE REFINEMENTS:");
    tasteChanges.forEach(change => parts.push(`- ${change}`));
  }

  // Add ingredient modifications section
  if (changes.ingredientModifications && changes.ingredientModifications.length > 0) {
    parts.push("\nINGREDIENT MODIFICATIONS:");
    changes.ingredientModifications.forEach((mod: {
      ingredientId: string;
      field: 'quantity' | 'unit' | 'name';
      oldValue: string | number;
      newValue: string | number;
    }) => {
      const ingredientName = originalRecipe.ingredients[parseInt(mod.ingredientId.split("-")[1])]?.name || "Unknown ingredient";
      parts.push(`- ${ingredientName} ${mod.field}: ${mod.oldValue} → ${mod.newValue}`);
    });
    parts.push("NOTE: When ingredients are significantly increased or decreased, adjust cook time, prep time, and serving sizes accordingly. Consider proportionally scaling other ingredients to maintain recipe balance and update timing estimates based on the new quantities.");
  }

  if (pantryItems.length > 0) {
    parts.push("\nPANTRY ITEMS TO INCORPORATE:");
    parts.push(pantryItems.map(item => `- ${item}`).join("\n"));
  }

  if (notes.trim()) {
    parts.push("\nADDITIONAL NOTES:");
    parts.push(notes);
  }

  if (constraints.preferLocal && locationHint) {
    parts.push(`\nLocation hint: ${locationHint.city || locationHint.country || locationHint.locale}`);
  }

  parts.push("\n--- GENERATE REGENERATED RECIPE ---");
  parts.push("Create a complete, coherent recipe that incorporates all the requested changes while respecting all locks and constraints.");

  return parts.join("\n");
}
