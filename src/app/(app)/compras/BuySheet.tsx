"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/Sheet";
import type { Item } from "@/lib/types";

export function BuySheet({
  open,
  onClose,
  itemName,
  existingItem,
  zones,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  itemName: string;
  existingItem: Item | null;
  zones: string[];
  onConfirm: (qty: number, zone: string | null) => Promise<void>;
}) {
  const [qty, setQty] = useState(1);
  const [zone, setZone] = useState(zones[0] ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setQty(1);
    setZone(zones[0] ?? "");
    setError(null);
    onClose();
  }

  function handleConfirm() {
    if (qty <= 0) {
      setError("Indica uma quantidade válida.");
      return;
    }
    if (!existingItem && !zone) {
      setError("Escolhe a zona onde vais guardar o item.");
      return;
    }

    startTransition(async () => {
      try {
        await onConfirm(qty, existingItem ? null : zone);
        handleClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao guardar.");
      }
    });
  }

  return (
    <Sheet open={open} onClose={handleClose} title={itemName}>
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink-soft">Quantas unidades compraste?</label>
          <div className="flex items-center gap-2.5">
            <button type="button" className="stepper-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="min-w-[50px] text-center text-base font-extrabold">{qty}</span>
            <button type="button" className="stepper-btn" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
        </div>

        {existingItem ? (
          <p className="text-[13px] text-ink-soft">Vai somar ao stock existente em {existingItem.zone}.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink-soft">Onde vais guardar?</label>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className="input">
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <button type="button" disabled={pending} onClick={handleConfirm} className="btn btn-primary w-full">
          {pending ? "A guardar…" : "Confirmar compra"}
        </button>
      </div>
    </Sheet>
  );
}
