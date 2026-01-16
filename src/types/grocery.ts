export interface GroceryItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  packageDescription?: string;
  category: GroceryCategory;
  isPurchased: boolean;
  sourceRecipeId?: string;
  sourceRecipeTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export type GroceryCategory = 
  | "produce"
  | "meat-fish"
  | "dairy"
  | "pantry"
  | "frozen"
  | "other";

export interface NormalizedIngredient {
  ingredientName: string;
  suggestedQuantity: number;
  suggestedUnit: string;
  packageDescription?: string;
  confidenceLevel: "low" | "medium" | "high";
  category: GroceryCategory;
}

export type GroceryItemInput = Omit<GroceryItem, "id" | "createdAt" | "updatedAt">;
