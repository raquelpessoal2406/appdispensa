export type Zone = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Item = {
  id: string;
  user_id: string;
  name: string;
  zone: string;
  amount: number;
  unit: string | null;
  expiry: string | null;
  alert_days: number | null;
  min_stock: number | null;
  ignore_low_stock: boolean;
  created_at: string;
};

export type Ingredient = {
  name: string;
  qty: string;
};

export type MealType = "Jantar" | "Almoço" | "Outro";

export const MEAL_TYPES: MealType[] = ["Jantar", "Almoço", "Outro"];

export type Recipe = {
  id: string;
  user_id: string;
  name: string;
  prep_minutes: number | null;
  servings: number;
  meal_types: MealType[];
  ingredients: Ingredient[];
  instructions: string | null;
  created_at: string;
};

export type WeeklyPlanRow = {
  id: string;
  user_id: string;
  date: string;
  wants_lunch: boolean;
  wants_dinner: boolean;
  lunch_recipe_id: string | null;
  dinner_recipe_id: string | null;
};

export type ManualShoppingItem = {
  id: string;
  user_id: string;
  name: string;
  checked: boolean;
  created_at: string;
};

export type CheckedIngredient = {
  id: string;
  user_id: string;
  ingredient_name: string;
  checked: boolean;
};
