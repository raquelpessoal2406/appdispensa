import { createClient } from "@/lib/supabase/server";
import { getCurrentWeekDates } from "@/lib/week";
import { PlanoClient } from "./PlanoClient";

export default async function PlanoPage() {
  const supabase = await createClient();
  const weekDays = getCurrentWeekDates();

  const [{ data: plan }, { data: recipes }, { data: items }] = await Promise.all([
    supabase
      .from("weekly_plan")
      .select("*")
      .gte("date", weekDays[0].date)
      .lte("date", weekDays[6].date),
    supabase.from("recipes").select("*"),
    supabase.from("items").select("*"),
  ]);

  return (
    <PlanoClient
      weekDays={weekDays}
      initialPlan={plan ?? []}
      recipes={recipes ?? []}
      items={items ?? []}
    />
  );
}
