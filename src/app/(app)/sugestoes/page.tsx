import { createClient } from "@/lib/supabase/server";
import { SugestoesClient } from "./SugestoesClient";

export default async function SugestoesPage() {
  const supabase = await createClient();

  const [{ data: recipes }, { data: items }] = await Promise.all([
    supabase.from("recipes").select("*"),
    supabase.from("items").select("*"),
  ]);

  return <SugestoesClient recipes={recipes ?? []} items={items ?? []} />;
}
