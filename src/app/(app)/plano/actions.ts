"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidateAll() {
  for (const path of ["/plano", "/compras"]) {
    revalidatePath(path);
  }
}

export type PlanDayInput = {
  wants_lunch: boolean;
  wants_dinner: boolean;
  lunch_recipe_id: string | null;
  dinner_recipe_id: string | null;
};

export async function upsertPlanDay(date: string, input: PlanDayInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem sessão.");

  const { error } = await supabase
    .from("weekly_plan")
    .upsert({ user_id: user.id, date, ...input }, { onConflict: "user_id,date" });
  if (error) throw new Error(error.message);
  revalidateAll();
}
