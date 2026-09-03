import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar title="Despensa" />
      <main className="flex-1 overflow-y-auto px-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] pt-4">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
