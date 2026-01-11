
export interface NutritionalInfo {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Eenvoudig' | 'Gemiddeld' | 'Uitdagend';
  imageUrl?: string;
  nutrition?: NutritionalInfo;
  chefTip?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  recipeTitle?: string;
}

export type DietaryPreference = 'Vegan' | 'Vegetarisch' | 'Glutenvrij' | 'Koolhydraatarm';

export interface GenerationState {
  loading: boolean;
  status: string;
  error: string | null;
  recipes: Recipe[];
}
