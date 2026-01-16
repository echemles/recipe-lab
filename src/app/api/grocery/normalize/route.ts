import { NextRequest, NextResponse } from "next/server";
import { Ingredient } from "@/types/recipe";
import { NormalizedIngredient, GroceryCategory } from "@/types/grocery";

interface NormalizeRequest {
  ingredients: Ingredient[];
  recipeContext?: {
    title: string;
    servings?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { ingredients, recipeContext } = await request.json() as NormalizeRequest;

    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Invalid ingredients array" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const contextInfo = recipeContext 
      ? `Recipe: ${recipeContext.title}${recipeContext.servings ? ` (${recipeContext.servings} servings)` : ""}`
      : "";

    const prompt = `Convert these recipe ingredients into realistic grocery purchasing units.

${contextInfo}

Ingredients:
${JSON.stringify(ingredients)}

Rules:
- Convert to standard package weights (e.g., 430g crushed tomatoes → 1 × 400g can)
- Use common can/jar sizes
- Prefer whole item counts where appropriate (e.g., 45g parsley → 1 bunch)
- For very small quantities (< 15ml/g), suggest omitting or note "use existing"
- Categorize each item into: produce, meat-fish, dairy, pantry, frozen, or other
- Provide confidence level: low, medium, or high

Return ONLY a JSON array with this exact structure:
[{
  "ingredientName": string,
  "suggestedQuantity": number,
  "suggestedUnit": string,
  "packageDescription": string (optional, e.g., "400g can" or "family pack"),
  "confidenceLevel": "low" | "medium" | "high",
  "category": "produce" | "meat-fish" | "dairy" | "pantry" | "frozen" | "other"
}]`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a grocery shopping assistant. Convert recipe ingredients into realistic grocery store purchasing units. Always return valid JSON arrays only, with no markdown formatting or explanations. Be practical and consider standard package sizes available in grocery stores.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to normalize ingredients" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let normalizedIngredients: NormalizedIngredient[];
    try {
      let cleaned = content;
      
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      cleaned = cleaned.trim();
      
      const jsonStart = cleaned.indexOf('[');
      const jsonEnd = cleaned.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
      
      normalizedIngredients = JSON.parse(cleaned);
      
      if (!Array.isArray(normalizedIngredients)) {
        throw new Error("Response is not an array");
      }
      
      for (const item of normalizedIngredients) {
        if (
          typeof item.ingredientName !== 'string' ||
          typeof item.suggestedQuantity !== 'number' ||
          typeof item.suggestedUnit !== 'string' ||
          typeof item.confidenceLevel !== 'string' ||
          typeof item.category !== 'string'
        ) {
          throw new Error(`Invalid normalized ingredient structure: ${JSON.stringify(item)}`);
        }
        
        const validCategories: GroceryCategory[] = ["produce", "meat-fish", "dairy", "pantry", "frozen", "other"];
        if (!validCategories.includes(item.category as GroceryCategory)) {
          item.category = "other";
        }
      }
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      console.error("Parse error details:", parseError);
      
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ normalizedIngredients });
  } catch (error) {
    console.error("Normalization error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
