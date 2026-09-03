"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Ingredient, MealType } from "@/lib/types";

function revalidateAll() {
  for (const path of ["/receitas", "/sugestoes", "/plano", "/compras"]) {
    revalidatePath(path);
  }
}

export type RecipeInput = {
  name: string;
  prep_minutes: number | null;
  servings: number;
  meal_types: MealType[];
  ingredients: Ingredient[];
  instructions: string | null;
};

export async function createRecipe(input: RecipeInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem sessão.");

  const { error } = await supabase.from("recipes").insert({ ...input, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function updateRecipe(id: string, input: RecipeInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidateAll();
}
