export interface Ingredient {
  quantity: number;
  unit: string;
  name: string;
  note?: string;
  tooltip?: string;
  isSubrecipe?: boolean;
}

export interface MacroInformation {
  calories: number;
  protein: number; // in grams
  carbohydrates: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in milligrams
  cholesterol?: number; // in milligrams
  saturatedFat?: number; // in grams
  unsaturatedFat?: number; // in grams
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  tags?: string[];
  images?: import('./recipe-image').RecipeImage[];
  macros?: MacroInformation; // Estimated macro information per serving
  isDraft?: boolean; // Flag to distinguish draft recipes from published ones
  createdAt: string;
  updatedAt: string;
}
