"use client";

import { useMemo } from "react";
import { Sheet } from "@/components/Sheet";
import { getExpiryStatus } from "@/lib/alerts";
import { isRecipeFullyStocked, recipeStockCount, usesExpiringItem } from "@/lib/ingredientMatch";
import type { Item, MealType, Recipe } from "@/lib/types";

export function RecipePickerSheet({
  open,
  onClose,
  recipes,
  items,
  mealType,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  recipes: Recipe[];
  items: Item[];
  mealType: MealType;
  onSelect: (recipeId: string) => void;
}) {
  const filtered = useMemo(() => {
    return recipes
      .filter((r) => r.meal_types.includes(mealType))
      .map((r) => ({
        recipe: r,
        recommended:
          isRecipeFullyStocked(items, r) ||
          usesExpiringItem(items, r, (item) => {
            const s = getExpiryStatus(item);
            return s === "soon" || s === "expired";
          }),
      }))
      .sort((a, b) => Number(b.recommended) - Number(a.recommended));
  }, [recipes, items, mealType]);

  return (
    <Sheet open={open} onClose={onClose} title={`Escolher receita — ${mealType}`}>
      {filtered.length === 0 && (
        <p className="text-[13.5px] text-ink-soft">
          Ainda não tens nenhuma receita marcada como &ldquo;{mealType}&rdquo;.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {filtered.map(({ recipe, recommended }) => {
          const { have, total } = recipeStockCount(items, recipe);
          return (
            <button
              key={recipe.id}
              type="button"
              className="card block w-full p-3 text-left"
              onClick={() => onSelect(recipe.id)}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="font-bold">
                  {recommended && "⭐ "}
                  {recipe.name}
                </div>
                <span className={`tag ${have === total ? "tag-ok" : "tag-soon"}`}>
                  {have}/{total}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
