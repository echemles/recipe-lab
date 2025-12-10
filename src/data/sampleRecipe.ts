import { Recipe } from "@/types/recipe";

export const sampleRecipe: Recipe = {
  id: "1",
  title: "Classic Tomato Pasta",
  description: "A simple, comforting tomato pasta with garlic and basil.",
  ingredients: [
    {
      quantity: 200,
      unit: "g",
      name: "spaghetti",
    },
    {
      quantity: 2,
      unit: "tbsp",
      name: "olive oil",
    },
    {
      quantity: 3,
      unit: "cloves",
      name: "garlic",
      note: "minced",
      tooltip: "Use fresh garlic for best flavor; avoid burning it or it will taste bitter.",
    },
    {
      quantity: 400,
      unit: "g",
      name: "canned tomatoes",
      note: "crushed",
      tooltip: "San Marzano or other high-quality plum tomatoes work best.",
    },
    {
      quantity: 0.5,
      unit: "tsp",
      name: "salt",
    },
    {
      quantity: 0.25,
      unit: "tsp",
      name: "black pepper",
      note: "freshly ground",
    },
    {
      quantity: 5,
      unit: "leaves",
      name: "basil",
      note: "torn",
    },
  ],
  steps: [
    "Cook the spaghetti in salted boiling water until al dente.",
    "While the pasta cooks, heat olive oil in a pan and gently fry the garlic until fragrant.",
    "Add the crushed tomatoes, salt, and pepper. Simmer for 10–15 minutes.",
    "Toss the drained pasta with the sauce and basil. Adjust seasoning to taste.",
  ],
  prepTimeMinutes: 10,
  cookTimeMinutes: 20,
  servings: 2,
  tags: ["pasta", "vegetarian", "quick"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
