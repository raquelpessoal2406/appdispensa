import { createClient } from "@/lib/supabase/server";
import { InventarioClient } from "./InventarioClient";

export default async function InventarioPage() {
  const supabase = await createClient();

  const [{ data: zones }, { data: items }] = await Promise.all([
    supabase.from("zones").select("*").order("created_at", { ascending: true }),
    supabase.from("items").select("*"),
  ]);

  return (
    <InventarioClient
      initialItems={items ?? []}
      initialZones={(zones ?? []).map((z) => z.name)}
    />
  );
}
