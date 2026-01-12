import { NextResponse } from "next/server";
import { MacroInformation } from "@/types/recipe";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback macro estimation for when OpenAI fails
function getFallbackMacros(validIngredients: Array<{ quantity: number; unit: string; name: string }>, servings: number): MacroInformation {
  // Simple calorie estimation based on ingredient types
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const ingredient of validIngredients) {
    const name = ingredient.name.toLowerCase();
    const quantity = ingredient.quantity;
    
    // Basic calorie estimation rules
    if (name.includes("chicken") || name.includes("turkey")) {
      totalCalories += quantity * 165; // ~165 cal per 100g
      totalProtein += quantity * 31;
      totalFat += quantity * 3.6;
    } else if (name.includes("beef")) {
      totalCalories += quantity * 250;
      totalProtein += quantity * 26;
      totalFat += quantity * 15;
    } else if (name.includes("rice") || name.includes("pasta")) {
      totalCalories += quantity * 130;
      totalCarbs += quantity * 28;
      totalProtein += quantity * 2.7;
    } else if (name.includes("oil") || name.includes("butter")) {
      totalCalories += quantity * 884;
      totalFat += quantity * 100;
    } else if (name.includes("vegetable") || name.includes("onion") || name.includes("tomato")) {
      totalCalories += quantity * 25;
      totalCarbs += quantity * 5;
    } else {
      // Default estimation
      totalCalories += quantity * 150;
      totalProtein += quantity * 5;
      totalCarbs += quantity * 15;
      totalFat += quantity * 8;
    }
  }

  return {
    calories: Math.round(totalCalories / servings),
    protein: Math.round((totalProtein / servings) * 10) / 10,
    carbohydrates: Math.round((totalCarbs / servings) * 10) / 10,
    fat: Math.round((totalFat / servings) * 10) / 10,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredients, servings = 1 } = body;

    // Validate input
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Ingredients array is required" },
        { status: 400 }
      );
    }

    if (!servings || servings < 1 || servings > 50) {
      return NextResponse.json(
        { error: "Valid servings number is required (1-50)" },
        { status: 400 }
      );
    }

    // Filter out invalid ingredients (no name or invalid quantity)
    const validIngredients = ingredients.filter(ingredient => {
      const hasValidName = ingredient.name && typeof ingredient.name === "string" && ingredient.name.trim() !== "";
      const hasValidQuantity = typeof ingredient.quantity === "number" && ingredient.quantity > 0;
      
      if (!hasValidName || !hasValidQuantity) {
        console.log("Filtering out invalid ingredient:", ingredient);
        return false;
      }
      
      return true;
    });

    // Ensure we still have ingredients after filtering
    if (validIngredients.length === 0) {
      return NextResponse.json(
        { error: "No valid ingredients found" },
        { status: 400 }
      );
    }

    // Prepare ingredients list for OpenAI
    const ingredientsList = validIngredients
      .map(ing => `${ing.quantity} ${ing.unit || ''} ${ing.name}`.trim())
      .join('\n');

    const prompt = `You are a nutrition calculator. Given the following ingredients and number of servings, estimate the macro information per serving.

Ingredients:
${ingredientsList}

Servings: ${servings}

Return ONLY a JSON object with these exact fields and numeric values:
{
  "calories": number,
  "protein": number,
  "carbohydrates": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "cholesterol": number,
  "saturatedFat": number,
  "unsaturatedFat": number
}

Rules:
- All values should be per serving
- Protein, carbs, fat, fiber, sugar, saturatedFat, unsaturatedFat should be in grams
- Sodium and cholesterol should be in milligrams
- Round to 1 decimal place for grams, whole numbers for calories and milligrams
- If a macro is negligible, use 0
- Be conservative with estimates - it's better to underestimate than overestimate
- Consider cooking methods (oil absorption, water loss, etc.)
- Account for the fact that some ingredients lose weight during cooking

Return ONLY the JSON object, no explanation.`;

    try {
      // Use the lowest cost model (gpt-3.5-turbo)
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a precise nutrition calculator. Always return valid JSON with numeric macro values."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.1, // Low temperature for consistent results
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      
      if (!responseText) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      let macros: MacroInformation;
      try {
        macros = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", responseText);
        throw new Error("Invalid JSON response from OpenAI");
      }

      // Validate the response structure
      const requiredFields: (keyof MacroInformation)[] = ["calories", "protein", "carbohydrates", "fat"];
      for (const field of requiredFields) {
        if (typeof macros[field] !== "number" || macros[field] < 0) {
          throw new Error(`Invalid or missing ${field} in response`);
        }
      }

      // Ensure all optional fields are numbers or undefined
      const optionalFields: (keyof MacroInformation)[] = ["fiber", "sugar", "sodium", "cholesterol", "saturatedFat", "unsaturatedFat"];
      for (const field of optionalFields) {
        if (macros[field] !== undefined && (typeof macros[field] !== "number" || macros[field] < 0)) {
          delete macros[field];
        }
      }

      return NextResponse.json(macros);

    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      
      // Fallback to basic estimation
      console.log("Using fallback macro estimation");
      const fallbackMacros = getFallbackMacros(validIngredients, servings);
      
      return NextResponse.json({
        ...fallbackMacros,
        _fallback: true // Flag that this is a fallback estimate
      });
    }

  } catch (error) {
    console.error("Macro estimation error:", error);
    return NextResponse.json(
      { error: "Failed to estimate macros" },
      { status: 500 }
    );
  }
}
