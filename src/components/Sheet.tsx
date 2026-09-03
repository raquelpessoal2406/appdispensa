"use client";

import type { ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(20,24,20,0.45)]"
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-[20px] bg-bg px-4.5 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-4.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3.5 h-1 w-9 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-[17px] font-extrabold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full border-none bg-surface-2 text-base text-ink-soft"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
