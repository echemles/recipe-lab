import { NextRequest, NextResponse } from "next/server";
import { Ingredient } from "@/types/recipe";

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

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

    const prompt = `Convert these ingredients to grams. Return ONLY a JSON array.

Rules:
- Skip ingredients with quantity 0 or "to taste" - return them unchanged
- Convert volume (cups, tbsp, tsp) and count units (cloves, pieces) to grams
- Keep existing gram/mg measurements unchanged

${JSON.stringify(ingredients)}

Format:
[{"quantity": number, "unit": "g", "name": string, "note": string|null, "tooltip": string|null}]`;

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
              "1. You are a culinary assistant that converts recipe ingredient measurements to weight. Always return valid JSON arrays only, with no markdown formatting or explanations. Be decisive—never leave 'clove' or 'piece' units unconverted; use an average gram value if needed.",
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
        { error: "Failed to convert ingredients" },
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

    let convertedIngredients: Ingredient[];
    try {
      console.log("Raw AI response:", content);
      
      // Try multiple cleaning approaches
      let cleaned = content;
      
      // Remove markdown code blocks
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      // Remove any leading/trailing whitespace
      cleaned = cleaned.trim();
      
      // Remove any explanatory text before or after JSON
      const jsonStart = cleaned.indexOf('[');
      const jsonEnd = cleaned.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log("Cleaned response:", cleaned);
      
      // Try to parse as-is first
      try {
        convertedIngredients = JSON.parse(cleaned);
      } catch (firstError) {
        console.log("First parse attempt failed, trying regex extraction");
        
        // Look for JSON array pattern (using a simpler approach for compatibility)
        const jsonArrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch) {
          cleaned = jsonArrayMatch[0];
          console.log("Regex extracted:", cleaned);
          convertedIngredients = JSON.parse(cleaned);
        } else {
          throw firstError;
        }
      }
      
      // Validate the parsed result
      if (!Array.isArray(convertedIngredients)) {
        throw new Error("Response is not an array");
      }
      
      // Validate each ingredient has required fields
      for (const ingredient of convertedIngredients) {
        if (typeof ingredient.quantity !== 'number' || 
            typeof ingredient.unit !== 'string' || 
            typeof ingredient.name !== 'string') {
          throw new Error(`Invalid ingredient structure: ${JSON.stringify(ingredient)}`);
        }
        
        // Convert null values to undefined for optional fields
        if (ingredient.note === null) ingredient.note = undefined;
        if (ingredient.tooltip === null) ingredient.tooltip = undefined;
      }
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      console.error("Parse error details:", parseError);
      
      // Return original ingredients as fallback
      console.log("Returning original ingredients as fallback");
      return NextResponse.json({ 
        convertedIngredients: ingredients,
        warning: "Could not parse AI response, returning original ingredients"
      });
    }

    return NextResponse.json({ convertedIngredients });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
