#!/usr/bin/env tsx

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import { getAllRecipes, updateRecipe } from "@/data/recipeStore";
import { Recipe, MacroInformation } from "@/types/recipe";

async function updateAllRecipesWithMacros() {
  console.log("Fetching all recipes...");
  const recipes = await getAllRecipes();
  
  console.log(`Found ${recipes.length} recipes to update with macros\n`);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const recipe of recipes) {
    if (recipe.macros) {
      console.log(`⏭️  Skipping "${recipe.title}" - already has macros`);
      skipped++;
      continue;
    }
    
    console.log(`🔄 Processing "${recipe.title}"...`);
    
    try {
      // Call the macro estimation API
      const response = await fetch('http://localhost:3000/api/estimate-macros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: recipe.ingredients,
          servings: recipe.servings || 1
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ API error for "${recipe.title}": ${response.status} - ${error}`);
        failed++;
        continue;
      }
      
      const macrosWithFallback = await response.json() as MacroInformation & { _fallback?: boolean };
      const macros: MacroInformation = {
        calories: macrosWithFallback.calories,
        protein: macrosWithFallback.protein,
        carbohydrates: macrosWithFallback.carbohydrates,
        fat: macrosWithFallback.fat,
        fiber: macrosWithFallback.fiber,
        sugar: macrosWithFallback.sugar,
        sodium: macrosWithFallback.sodium,
        cholesterol: macrosWithFallback.cholesterol,
        saturatedFat: macrosWithFallback.saturatedFat,
        unsaturatedFat: macrosWithFallback.unsaturatedFat,
      };
      
      // Update the recipe with macros
      await updateRecipe(recipe.id, { ...recipe, macros });
      
      console.log(`✅ Updated "${recipe.title}" with macros:`);
      console.log(`   Calories: ${macros.calories} | Protein: ${macros.protein}g | Carbs: ${macros.carbohydrates}g | Fat: ${macros.fat}g`);
      
      if (macrosWithFallback._fallback) {
        console.log(`   ⚠️  Used fallback estimation`);
      }
      
      updated++;
      
    } catch (error) {
      console.error(`❌ Failed to update "${recipe.title}":`, error);
      failed++;
    }
    
    console.log(""); // Empty line for readability
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Updated: ${updated} recipes`);
  console.log(`⏭️  Skipped: ${skipped} recipes (already had macros)`);
  console.log(`❌ Failed: ${failed} recipes`);
  console.log(`📝 Total: ${recipes.length} recipes`);
}

// Run the script
updateAllRecipesWithMacros()
  .then(() => {
    console.log("\n🎉 Macro update completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Macro update failed:", error);
    process.exit(1);
  });
