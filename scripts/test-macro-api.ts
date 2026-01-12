#!/usr/bin/env tsx

// Test script for the macro estimation API

const testCases = [
  {
    name: "Simple chicken dish",
    ingredients: [
      { quantity: 200, unit: "g", name: "chicken breast" },
      { quantity: 1, unit: "tbsp", name: "olive oil" },
      { quantity: 200, unit: "g", name: "rice" },
      { quantity: 100, unit: "g", name: "broccoli" }
    ],
    servings: 2
  },
  {
    name: "Pasta dish",
    ingredients: [
      { quantity: 300, unit: "g", name: "pasta" },
      { quantity: 100, unit: "g", name: "ground beef" },
      { quantity: 50, unit: "g", name: "tomato sauce" },
      { quantity: 30, unit: "g", name: "parmesan cheese" },
      { quantity: 2, unit: "tbsp", name: "olive oil" }
    ],
    servings: 4
  },
  {
    name: "Large ingredient list",
    ingredients: [
      { quantity: 500, unit: "g", name: "chicken thighs" },
      { quantity: 2, unit: "cups", name: "rice" },
      { quantity: 1, unit: "cup", name: "onions" },
      { quantity: 2, unit: "cloves", name: "garlic" },
      { quantity: 1, unit: "bell pepper", name: "red bell pepper" },
      { quantity: 200, unit: "g", name: "carrots" },
      { quantity: 100, unit: "g", name: "peas" },
      { quantity: 3, unit: "tbsp", name: "soy sauce" },
      { quantity: 2, unit: "tbsp", name: "vegetable oil" },
      { quantity: 1, unit: "tsp", name: "ginger" },
      { quantity: 1, unit: "tsp", name: "salt" },
      { quantity: 0.5, unit: "tsp", name: "black pepper" }
    ],
    servings: 6
  },
  {
    name: "Vegetarian dish",
    ingredients: [
      { quantity: 200, unit: "g", name: "chickpeas" },
      { quantity: 150, unit: "g", name: "quinoa" },
      { quantity: 100, unit: "g", name: "spinach" },
      { quantity: 50, unit: "g", name: "feta cheese" },
      { quantity: 2, unit: "tbsp", name: "olive oil" },
      { quantity: 1, unit: "lemon", name: "lemon juice" }
    ],
    servings: 2
  },
  {
    name: "XL ingredient list (40 ingredients)",
    ingredients: [
      { quantity: 800, unit: "g", name: "whole chicken" },
      { quantity: 3, unit: "cups", name: "all-purpose flour" },
      { quantity: 2, unit: "tsp", name: "paprika" },
      { quantity: 1, unit: "tsp", name: "dried thyme" },
      { quantity: 1, unit: "tsp", name: "garlic powder" },
      { quantity: 1, unit: "tsp", name: "onion powder" },
      { quantity: 0.5, unit: "tsp", name: "cayenne pepper" },
      { quantity: 1, unit: "tsp", name: "salt" },
      { quantity: 0.5, unit: "tsp", name: "black pepper" },
      { quantity: 4, unit: "tbsp", name: "butter" },
      { quantity: 2, unit: "cups", name: "chicken broth" },
      { quantity: 1, unit: "cup", name: "heavy cream" },
      { quantity: 500, unit: "g", name: "baby potatoes" },
      { quantity: 300, unit: "g", name: "carrots" },
      { quantity: 300, unit: "g", name: "celery" },
      { quantity: 2, unit: "cups", name: "onions" },
      { quantity: 4, unit: "cloves", name: "garlic" },
      { quantity: 1, unit: "cup", name: "frozen peas" },
      { quantity: 2, unit: "tbsp", name: "olive oil" },
      { quantity: 1, unit: "tsp", name: "dried rosemary" },
      { quantity: 1, unit: "tsp", name: "dried oregano" },
      { quantity: 200, unit: "g", name: "mushrooms" },
      { quantity: 1, unit: "cup", name: "dry white wine" },
      { quantity: 2, unit: "tbsp", name: "tomato paste" },
      { quantity: 1, unit: "bay leaf", name: "bay leaf" },
      { quantity: 2, unit: "sprigs", name: "fresh parsley" },
      { quantity: 1, unit: "sprig", name: "fresh thyme" },
      { quantity: 2, unit: "tbsp", name: "Worcestershire sauce" },
      { quantity: 1, unit: "tbsp", name: "Dijon mustard" },
      { quantity: 100, unit: "g", name: "bacon" },
      { quantity: 200, unit: "g", name: "green beans" },
      { quantity: 1, unit: "cup", name: "corn" },
      { quantity: 150, unit: "g", name: "bell peppers" },
      { quantity: 50, unit: "g", name: "parmesan cheese" },
      { quantity: 2, unit: "tbsp", name: "fresh lemon juice" },
      { quantity: 1, unit: "tsp", name: "honey" },
      { quantity: 1, unit: "cup", name: "heavy cream" },
      { quantity: 3, unit: "tbsp", name: "fresh chives" },
      { quantity: 1, unit: "tsp", name: "red pepper flakes" },
      { quantity: 2, unit: "tbsp", name: "fresh dill" }
    ],
    servings: 8
  }
];

async function testMacroAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  console.log("Testing macro estimation API...\n");
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Ingredients: ${testCase.ingredients.length}`);
    console.log(`Servings: ${testCase.servings}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/estimate-macros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: testCase.ingredients,
          servings: testCase.servings
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Error: ${response.status} - ${error}`);
        continue;
      }
      
      const macros = await response.json();
      
      console.log("✅ Success:");
      console.log(`   Calories: ${macros.calories}`);
      console.log(`   Protein: ${macros.protein}g`);
      console.log(`   Carbs: ${macros.carbohydrates}g`);
      console.log(`   Fat: ${macros.fat}g`);
      
      if (macros._fallback) {
        console.log("   ⚠️  Used fallback estimation");
      }
      
      if (macros.fiber) console.log(`   Fiber: ${macros.fiber}g`);
      if (macros.sugar) console.log(`   Sugar: ${macros.sugar}g`);
      if (macros.sodium) console.log(`   Sodium: ${macros.sodium}mg`);
      
    } catch (error) {
      console.error(`❌ Request failed:`, error);
    }
    
    console.log("-".repeat(50));
  }
}

// Run tests
testMacroAPI()
  .then(() => {
    console.log("\nTest completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });
