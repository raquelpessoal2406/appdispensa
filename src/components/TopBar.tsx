import { logout } from "@/app/(app)/actions";

export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-primary px-[18px] pb-3.5 pt-[calc(16px+env(safe-area-inset-top,0px))] text-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]">
      <h1 className="m-0 text-xl font-extrabold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Alertas"
          className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border-none bg-white/15 text-white"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 1 0-12 0c0 3.2-1 4.6-2 6h16c-1-1.4-2-2.8-2-6" />
            <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
          </svg>
        </button>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sair"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-none bg-white/15 text-white"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}
