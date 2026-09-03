"use client";

import { Sheet } from "@/components/Sheet";
import { isIngredientInStock } from "@/lib/ingredientMatch";
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
  if (!recipe) return null;

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
      <ul className="mb-4 list-disc pl-[18px] text-[14px] leading-[1.7]">
        {recipe.ingredients.map((ing, i) => {
          const have = isIngredientInStock(items, ing.name);
          return (
            <li key={i} className={have ? "text-ink" : "text-danger"}>
              {ing.name}
              {ing.qty ? ` — ${ing.qty}` : ""}
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
