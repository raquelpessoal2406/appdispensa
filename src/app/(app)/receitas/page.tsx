import { createClient } from "@/lib/supabase/server";
import { ReceitasClient } from "./ReceitasClient";

export default async function ReceitasPage() {
  const supabase = await createClient();

  const [{ data: recipes }, { data: items }] = await Promise.all([
    supabase.from("recipes").select("*"),
    supabase.from("items").select("*"),
  ]);

  return <ReceitasClient initialRecipes={recipes ?? []} items={items ?? []} />;
}
