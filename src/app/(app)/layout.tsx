import { createClient } from "@/lib/supabase/server";
import { countAlerts } from "@/lib/alerts";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: items } = await supabase.from("items").select("*");
  const alertCount = countAlerts(items ?? []);

  return (
    <>
      <TopBar title="Casa" alertCount={alertCount} />
      <main className="flex-1 overflow-y-auto px-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-4">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
