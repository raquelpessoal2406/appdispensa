"use client";

import { useMemo, useState } from "react";
import { isLowStock } from "@/lib/alerts";
import { findItemByName, isIngredientInStock, normalizeName } from "@/lib/ingredientMatch";
import type { Item, ManualShoppingItem, Recipe, WeeklyPlanRow } from "@/lib/types";
import {
  addManualItem,
  buyExistingItem,
  clearPurchased,
  ignoreLowStock,
  recordPurchaseByName,
  removeManualItem,
  setIngredientChecked,
  setManualItemChecked,
} from "./actions";
import { BuySheet } from "./BuySheet";

type PlanIngredient = { name: string; recipeNames: string[]; checked: boolean };

function computePlanIngredients(
  planRows: WeeklyPlanRow[],
  recipes: Recipe[],
  items: Item[],
  checkedNames: Set<string>,
): PlanIngredient[] {
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const map = new Map<string, PlanIngredient>();

  for (const day of planRows) {
    const neededRecipeIds = [
      day.wants_lunch ? day.lunch_recipe_id : null,
      day.wants_dinner ? day.dinner_recipe_id : null,
    ].filter((id): id is string => !!id);

    for (const recipeId of neededRecipeIds) {
      const recipe = recipeById.get(recipeId);
      if (!recipe) continue;

      for (const ing of recipe.ingredients) {
        if (isIngredientInStock(items, ing.name)) continue;
        const key = normalizeName(ing.name);
        const entry = map.get(key);
        if (entry) {
          if (!entry.recipeNames.includes(recipe.name)) entry.recipeNames.push(recipe.name);
        } else {
          map.set(key, {
            name: ing.name,
            recipeNames: [recipe.name],
            checked: checkedNames.has(key),
          });
        }
      }
    }
  }

  return Array.from(map.values());
}

export function ComprasClient({
  items,
  zones,
  planRows,
  recipes,
  manualItems,
  checkedIngredientNames,
}: {
  items: Item[];
  zones: string[];
  planRows: WeeklyPlanRow[];
  recipes: Recipe[];
  manualItems: ManualShoppingItem[];
  checkedIngredientNames: string[];
}) {
  const [manualInput, setManualInput] = useState("");
  const [buyTarget, setBuyTarget] = useState<
    | { kind: "lowstock"; item: Item }
    | { kind: "plan"; name: string }
    | { kind: "manual"; id: string; name: string }
    | null
  >(null);

  const lowStockItems = useMemo(() => items.filter(isLowStock), [items]);

  const checkedSet = useMemo(() => new Set(checkedIngredientNames.map(normalizeName)), [
    checkedIngredientNames,
  ]);

  const planIngredients = useMemo(
    () => computePlanIngredients(planRows, recipes, items, checkedSet),
    [planRows, recipes, items, checkedSet],
  );

  async function handleAddManual() {
    const name = manualInput.trim();
    if (!name) return;
    setManualInput("");
    await addManualItem(name);
  }

  async function handlePlanCheck(name: string, checked: boolean) {
    if (!checked) {
      await setIngredientChecked(name, false);
      return;
    }
    setBuyTarget({ kind: "plan", name });
  }

  async function handleManualCheck(item: ManualShoppingItem, checked: boolean) {
    if (!checked) {
      await setManualItemChecked(item.id, false);
      return;
    }
    setBuyTarget({ kind: "manual", id: item.id, name: item.name });
  }

  const hasAnyChecked =
    manualItems.some((m) => m.checked) || checkedIngredientNames.length > 0;

  return (
    <>
      <h2 className="mb-3.5 mt-0.5 text-lg font-extrabold">Lista de compras</h2>

      <SectionTitle>Stock baixo</SectionTitle>
      {lowStockItems.length === 0 ? (
        <EmptyHint text="Sem alertas de stock baixo." />
      ) : (
        lowStockItems.map((item) => (
          <div key={item.id} className="card">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2.5 text-left"
              onClick={() => setBuyTarget({ kind: "lowstock", item })}
            >
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-[12.5px] text-ink-soft">{item.zone}</div>
              </div>
              <span className="tag tag-soon">Comprar</span>
            </button>
            <button
              type="button"
              onClick={() => ignoreLowStock(item.id)}
              className="mt-2 text-[12.5px] font-semibold text-ink-soft underline"
            >
              Não comprar mais este item
            </button>
          </div>
        ))
      )}

      <SectionTitle className="mt-5">Do plano semanal</SectionTitle>
      {planIngredients.length === 0 ? (
        <EmptyHint text="Nada em falta para as receitas planeadas esta semana." />
      ) : (
        planIngredients.map((ing) => (
          <label key={ing.name} className="card flex items-center gap-3">
            <input
              type="checkbox"
              checked={ing.checked}
              onChange={(e) => handlePlanCheck(ing.name, e.target.checked)}
            />
            <div className="flex-1">
              <div className={`font-bold ${ing.checked ? "line-through opacity-60" : ""}`}>{ing.name}</div>
              <div className="text-[12.5px] text-ink-soft">Para: {ing.recipeNames.join(", ")}</div>
            </div>
          </label>
        ))
      )}

      <SectionTitle className="mt-5">Outros itens</SectionTitle>
      {manualItems.map((item) => (
        <div key={item.id} className="card flex items-center gap-3">
          <label className="flex flex-1 items-center gap-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => handleManualCheck(item, e.target.checked)}
            />
            <span className={`font-bold ${item.checked ? "line-through opacity-60" : ""}`}>{item.name}</span>
          </label>
          <button
            type="button"
            onClick={() => removeManualItem(item.id)}
            aria-label="Remover"
            className="text-ink-soft"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="mt-2 flex gap-2">
        <input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
          placeholder="Adicionar item (ex: papel higiénico)"
          className="input flex-1"
        />
        <button type="button" onClick={handleAddManual} className="btn btn-primary">
          +
        </button>
      </div>

      <button
        type="button"
        disabled={!hasAnyChecked}
        onClick={() => clearPurchased()}
        className="btn btn-ghost mt-4 w-full"
      >
        Limpar comprados
      </button>

      {buyTarget?.kind === "lowstock" && (
        <BuySheet
          open
          onClose={() => setBuyTarget(null)}
          itemName={buyTarget.item.name}
          existingItem={buyTarget.item}
          zones={zones}
          onConfirm={async (qty) => {
            await buyExistingItem(buyTarget.item.id, qty);
          }}
        />
      )}

      {buyTarget?.kind === "plan" && (
        <BuySheet
          open
          onClose={() => setBuyTarget(null)}
          itemName={buyTarget.name}
          existingItem={findItemByName(items, buyTarget.name) ?? null}
          zones={zones}
          onConfirm={async (qty, zone) => {
            await recordPurchaseByName(buyTarget.name, qty, zone);
            await setIngredientChecked(buyTarget.name, true);
          }}
        />
      )}

      {buyTarget?.kind === "manual" && (
        <BuySheet
          open
          onClose={() => setBuyTarget(null)}
          itemName={buyTarget.name}
          existingItem={findItemByName(items, buyTarget.name) ?? null}
          zones={zones}
          onConfirm={async (qty, zone) => {
            await recordPurchaseByName(buyTarget.name, qty, zone);
            await setManualItemChecked(buyTarget.id, true);
          }}
        />
      )}
    </>
  );
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`mb-2 text-[13px] font-extrabold text-ink-soft ${className ?? ""}`}>{children}</p>;
}

function EmptyHint({ text }: { text: string }) {
  return <p className="mb-4 text-[13.5px] text-ink-soft">{text}</p>;
}
