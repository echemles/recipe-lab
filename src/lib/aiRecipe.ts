import { RecipeInput } from "@/data/recipeStore";
import getOpenAIClient from "@/lib/openai";

const MODEL = process.env.OPENAI_RECIPE_MODEL ?? "gpt-4o-mini";

export type AIRecipeDraftInput = {
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
  };
};

export async function generateRecipeDraft({
  title,
  description,
  pantryItems = [],
  cookingMode = "beginner",
  constraints,
  preferences = {},
}: AIRecipeDraftInput): Promise<RecipeInput> {
  const sanitizedTitle = title?.trim();
  const sanitizedDescription = description?.trim();
  const sanitizedPantry =
    pantryItems.map((item) => item.trim()).filter(Boolean).slice(0, 20) ?? [];

  if (!sanitizedDescription && sanitizedPantry.length === 0) {
    throw new Error("Provide a description or at least one pantry item.");
  }

  const client = getOpenAIClient();
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(
    sanitizedTitle,
    sanitizedDescription,
    sanitizedPantry,
    cookingMode,
    constraints,
    preferences
  );

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    console.error("[aiRecipe] Empty message content:", JSON.stringify(response, null, 2));
    throw new Error("Failed to receive recipe content from model.");
  }

  let parsed: RecipeInput;
  try {
    parsed = JSON.parse(content) as RecipeInput;
  } catch (error) {
    console.error("[aiRecipe] JSON parsing error:", error, content);
    throw new Error("Failed to parse recipe JSON from model.");
  }

  return normalizeRecipe(parsed);
}

function buildSystemPrompt(): string {
  return `You are a helpful culinary assistant who creates approachable, flavorful recipes.
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

Rules:
- All fields are required
- ingredients must have at least 1 item
- steps must have at least 1 item
- Use real-world units (grams, cups, tbsp, etc.)
- Steps should be concise sentences in chronological order
- Do NOT include markdown, code blocks, or explanations - just the JSON object`;
}

function buildUserPrompt(
  title?: string,
  description?: string,
  pantryItems: string[] = [],
  cookingMode: "beginner" | "traditional" | "weeknight" | "chef" | "experimental" = "beginner",
  constraints?: AIRecipeDraftInput["constraints"],
  preferences: AIRecipeDraftInput["preferences"] = {}
): string {
  const parts: string[] = [];

  if (title) {
    parts.push(`Recipe name: ${title}`);
  }

  if (description) {
    parts.push(`Description: ${description}`);
  } else {
    parts.push("Create a seasonal, crowd-pleasing dish.");
  }

  if (pantryItems.length) {
    parts.push(`Use these pantry items: ${pantryItems.join(", ")}`);
  }

  // Add cooking mode constraints
  if (constraints) {
    parts.push(`Cooking mode: ${cookingMode}`);
    parts.push(`Technique complexity: ${constraints.techniqueComplexity}`);
    parts.push(`Allowed variations: ${constraints.allowedVariations}`);
    parts.push(`Specialty ingredients: ${constraints.specialtyIngredients ? 'allowed' : 'not allowed'}`);
    parts.push(`Guidance level: ${constraints.guidanceLevel}`);
  }

  const dietaryNeeds: string[] = [];
  if (preferences.highProtein) dietaryNeeds.push("high protein");
  if (preferences.quickMeal) dietaryNeeds.push("ready in 30 minutes or less");
  if (preferences.lowCalorie) dietaryNeeds.push("low-calorie");
  if (preferences.mealPrepFriendly) dietaryNeeds.push("meal-prep friendly");
  if (preferences.lowCost) dietaryNeeds.push("low cost");
  if (preferences.budgetFriendly) dietaryNeeds.push("budget-friendly");
  if (preferences.lowCarb) dietaryNeeds.push("low-carb");
  if (preferences.glutenFree) dietaryNeeds.push("gluten-free");

  if (dietaryNeeds.length) {
    parts.push(`Dietary requirements: ${dietaryNeeds.join(", ")}`);
  }

  return parts.join("\n");
}

function normalizeRecipe(parsed: RecipeInput): RecipeInput {
  return {
    title: parsed.title?.trim() || "Chef's Choice",
    description: parsed.description?.trim() || "A delicious dish.",
    ingredients: Array.isArray(parsed.ingredients) && parsed.ingredients.length > 0
      ? parsed.ingredients.map((ing) => ({
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit ?? "",
          name: ing.name ?? "",
        }))
      : [{ quantity: 1, unit: "unit", name: "Ingredient" }],
    steps: Array.isArray(parsed.steps) && parsed.steps.length > 0
      ? parsed.steps.map((step) => step?.trim()).filter(Boolean)
      : ["Combine ingredients and enjoy."],
    prepTimeMinutes: parsed.prepTimeMinutes ?? undefined,
    cookTimeMinutes: parsed.cookTimeMinutes ?? undefined,
    servings: parsed.servings ?? undefined,
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.map((tag) => tag.trim()).filter(Boolean)
      : undefined,
  };
}
