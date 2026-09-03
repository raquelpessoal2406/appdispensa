import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekDates } from "@/lib/week";
import { ComprasClient } from "./ComprasClient";

export default async function ComprasPage() {
  const supabase = await createClient();
  const weekDays = getCurrentWeekDates();

  const [{ data: items }, { data: zones }, { data: planRows }, { data: recipes }, { data: manualItems }, { data: checked }] =
    await Promise.all([
      supabase.from("items").select("*"),
      supabase.from("zones").select("*").order("created_at", { ascending: true }),
      supabase
        .from("weekly_plan")
        .select("*")
        .gte("date", weekDays[0].date)
        .lte("date", weekDays[6].date),
      supabase.from("recipes").select("*"),
      supabase.from("shopping_manual_items").select("*").order("created_at", { ascending: true }),
      supabase.from("shopping_checked_ingredients").select("*").eq("checked", true),
    ]);

  return (
    <ComprasClient
      items={items ?? []}
      zones={(zones ?? []).map((z) => z.name)}
      planRows={planRows ?? []}
      recipes={recipes ?? []}
      manualItems={manualItems ?? []}
      checkedIngredientNames={(checked ?? []).map((c) => c.ingredient_name)}
    />
  );
}
