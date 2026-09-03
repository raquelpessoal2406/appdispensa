"use client";

import { useState } from "react";
import { Sheet } from "@/components/Sheet";
import { addManualItem } from "@/app/(app)/compras/actions";
import { formatAmount } from "@/lib/amount";
import { findItemByName } from "@/lib/ingredientMatch";
import type { Item, Recipe } from "@/lib/types";

export function RecipeDetailSheet({
  open,
  onClose,
  recipe,
  items,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  items: Item[];
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());

  if (!recipe) return null;

  async function handleAddToShoppingList(name: string) {
    setAddedNames((prev) => new Set(prev).add(name));
    await addManualItem(name);
  }

  return (
    <Sheet open={open} onClose={onClose} title={recipe.name}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-soft">
        {recipe.prep_minutes != null && <span>{recipe.prep_minutes} min</span>}
        <span>· {recipe.servings} pessoas</span>
        <span className="flex flex-wrap gap-1.5">
          {recipe.meal_types.map((mt) => (
            <span key={mt} className="tag tag-ok">
              {mt}
            </span>
          ))}
        </span>
      </div>

      <p className="mb-1.5 text-[13px] font-extrabold">Ingredientes</p>
      <ul className="mb-4 flex flex-col gap-2">
        {recipe.ingredients.map((ing, i) => {
          const stockItem = findItemByName(items, ing.name);
          const have = !!stockItem && stockItem.amount > 0;
          const added = addedNames.has(ing.name);

          return (
            <li key={i} className="flex items-center justify-between gap-2.5">
              <div className={`text-[14px] ${have ? "text-ink" : "text-danger"}`}>
                <div className="font-semibold">
                  {ing.name}
                  {ing.qty ? ` — ${ing.qty}` : ""}
                </div>
                <div className="text-[12px] text-ink-soft">
                  {stockItem
                    ? `Tens: ${formatAmount(stockItem.amount)}${stockItem.unit ? ` ${stockItem.unit}` : ""}`
                    : "Não tens este ingrediente"}
                </div>
              </div>
              {!have && (
                <button
                  type="button"
                  disabled={added}
                  onClick={() => handleAddToShoppingList(ing.name)}
                  className="flex-shrink-0 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12px] font-semibold text-ink disabled:opacity-60"
                >
                  {added ? "Adicionado ✓" : "+ Lista de compras"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {recipe.instructions && (
        <>
          <p className="mb-1.5 text-[13px] font-extrabold">Modo de preparação</p>
          <p className="whitespace-pre-wrap text-[14px] leading-[1.6]">{recipe.instructions}</p>
        </>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-5 flex gap-2.5">
          {onDelete && (
            <button type="button" onClick={onDelete} className="btn btn-danger flex-1">
              Eliminar
            </button>
          )}
          {onEdit && (
            <button type="button" onClick={onEdit} className="btn btn-primary flex-1">
              Editar
            </button>
          )}
        </div>
      )}
    </Sheet>
  );
}
