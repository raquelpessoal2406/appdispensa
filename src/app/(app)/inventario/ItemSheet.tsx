"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/Sheet";
import { formatAmount, clampAmount, QUICK_SUBTRACT } from "@/lib/amount";
import type { Item } from "@/lib/types";
import { createItem, deleteItem, updateItem, type ItemInput } from "./actions";

export function ItemSheet({
  open,
  onClose,
  zones,
  knownCategories,
  knownItemNames,
  knownUnits,
  item,
}: {
  open: boolean;
  onClose: () => void;
  zones: string[];
  knownCategories: string[];
  knownItemNames: string[];
  knownUnits: string[];
  item: Item | null;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [zone, setZone] = useState(item?.zone ?? zones[0] ?? "");
  const [category, setCategory] = useState(item?.category ?? "");
  const [amount, setAmount] = useState(item?.amount ?? 1);
  const [unit, setUnit] = useState(item?.unit ?? "");
  const [expiry, setExpiry] = useState(item?.expiry ?? "");
  const [alertDays, setAlertDays] = useState(item?.alert_days ?? 3);
  const [minStock, setMinStock] = useState(
    item?.min_stock != null ? String(item.min_stock) : "",
  );
  const [ignoreLowStock, setIgnoreLowStock] = useState(item?.ignore_low_stock ?? false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName(item?.name ?? "");
    setZone(item?.zone ?? zones[0] ?? "");
    setCategory(item?.category ?? "");
    setAmount(item?.amount ?? 1);
    setUnit(item?.unit ?? "");
    setExpiry(item?.expiry ?? "");
    setAlertDays(item?.alert_days ?? 3);
    setMinStock(item?.min_stock != null ? String(item.min_stock) : "");
    setIgnoreLowStock(item?.ignore_low_stock ?? false);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSave() {
    if (!name.trim() || !zone) {
      setError("Preenche o nome e a zona.");
      return;
    }

    const input: ItemInput = {
      name: name.trim(),
      zone,
      category: category.trim() || null,
      amount: clampAmount(amount),
      unit: unit.trim() || null,
      expiry: expiry || null,
      alert_days: expiry ? alertDays : null,
      min_stock: minStock !== "" ? Number(minStock) : null,
      ignore_low_stock: ignoreLowStock,
    };

    startTransition(async () => {
      try {
        if (item) {
          await updateItem(item.id, input);
        } else {
          await createItem(input);
        }
        handleClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao guardar.");
      }
    });
  }

  function handleDelete() {
    if (!item) return;
    startTransition(async () => {
      await deleteItem(item.id);
      handleClose();
    });
  }

  return (
    <Sheet open={open} onClose={handleClose} title={item ? "Editar item" : "Novo item"}>
      <div className="flex flex-col gap-3.5">
        <Field label="Nome">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            list="known-item-names"
            className="input"
            placeholder="Ex: Leite"
          />
          <datalist id="known-item-names">
            {knownItemNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>

        <Field label="Zona">
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="input">
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Categoria (opcional)">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            list="known-categories"
            className="input"
            placeholder="Ex: Fruta, Lanches, Carne, Molhos…"
          />
          <datalist id="known-categories">
            {knownCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <Field label="Quantidade">
          <div className="flex items-center gap-2.5">
            <button type="button" className="stepper-btn" onClick={() => setAmount((a) => clampAmount(a - 1))}>
              −
            </button>
            <span className="min-w-[70px] text-center text-base font-extrabold">
              {formatAmount(amount)}
            </span>
            <button type="button" className="stepper-btn" onClick={() => setAmount((a) => clampAmount(a + 1))}>
              +
            </button>
          </div>
          <div className="mt-1.5 flex gap-2">
            {QUICK_SUBTRACT.map((f) => (
              <button
                key={f.label}
                type="button"
                className="fraction-btn"
                onClick={() => setAmount((a) => clampAmount(a - f.value))}
              >
                −{f.label}
              </button>
            ))}
            <button
              type="button"
              className="fraction-btn fraction-btn-danger"
              onClick={() => setAmount(0)}
            >
              Usei tudo
            </button>
          </div>
        </Field>

        <Field label="Unidade (opcional)">
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list="known-units"
            className="input"
            placeholder="Ex: L, pacote, un."
          />
          <datalist id="known-units">
            {knownUnits.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </Field>

        <div className="flex gap-2.5">
          <Field label="Validade (opcional)" className="flex-1">
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="input"
            />
          </Field>
          {expiry && (
            <Field label="Avisar (dias antes)" className="flex-1">
              <input
                type="number"
                min={0}
                value={alertDays}
                onChange={(e) => setAlertDays(Number(e.target.value))}
                className="input"
              />
            </Field>
          )}
        </div>

        <Field label="Avisar quando restar (ou menos) — opcional">
          <input
            type="number"
            min={0}
            step="any"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            className="input"
            placeholder="Ex: 1"
          />
        </Field>
        <label className="flex items-center gap-2 text-[13.5px] text-ink-soft">
          <input
            type="checkbox"
            checked={ignoreLowStock}
            onChange={(e) => setIgnoreLowStock(e.target.checked)}
          />
          Ignorar aviso de stock baixo para este item
        </label>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <div className="mt-1.5 flex gap-2.5">
          {item && (
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="btn btn-danger flex-1"
            >
              Eliminar
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={handleSave}
            className="btn btn-primary flex-1"
          >
            {pending ? "A guardar…" : "Guardar"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[13px] font-semibold text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
