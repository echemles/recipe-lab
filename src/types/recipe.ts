export interface Ingredient {
  quantity: number;
  unit: string;
  name: string;
  note?: string;
  tooltip?: string;
  isSubrecipe?: boolean;
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
  createdAt: string;
  updatedAt: string;
}
