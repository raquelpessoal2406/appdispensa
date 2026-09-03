"use client";

import { useState } from "react";
import { RecipeDetailSheet } from "@/components/RecipeDetailSheet";
import { recipeStockCount } from "@/lib/ingredientMatch";
import type { Item, Recipe } from "@/lib/types";
import { deleteRecipe } from "./actions";
import { RecipeSheet } from "./RecipeSheet";

export function ReceitasClient({
  initialRecipes,
  items,
}: {
  initialRecipes: Recipe[];
  items: Item[];
}) {
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [editing, setEditing] = useState<Recipe | null | "new">(null);

  function handleEditFromDetail() {
    setEditing(viewing);
    setViewing(null);
  }

  async function handleDeleteFromDetail() {
    if (!viewing) return;
    await deleteRecipe(viewing.id);
    setViewing(null);
  }

  return (
    <>
      <h2 className="mb-3.5 mt-0.5 text-lg font-extrabold">Receitas</h2>

      {initialRecipes.length === 0 && (
        <div className="empty">
          <div className="big">🍳</div>
          <p>Ainda não tens receitas guardadas.</p>
        </div>
      )}

      {initialRecipes
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, "pt"))
        .map((recipe) => {
          const { have, total } = recipeStockCount(items, recipe);
          return (
            <button
              key={recipe.id}
              type="button"
              className="card block w-full p-3.5 text-left"
              onClick={() => setViewing(recipe)}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <div className="text-[15.5px] font-extrabold">{recipe.name}</div>
                  <div className="mt-0.5 text-[12.5px] text-ink-soft">
                    {recipe.prep_minutes != null && `${recipe.prep_minutes} min · `}
                    {recipe.servings} pessoas · {have}/{total} ingredientes
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {recipe.meal_types.map((mt) => (
                  <span key={mt} className="tag tag-ok">
                    {mt}
                  </span>
                ))}
              </div>
            </button>
          );
        })}

      <button className="fab" onClick={() => setEditing("new")} aria-label="Nova receita">
        +
      </button>

      <RecipeDetailSheet
        open={viewing !== null}
        onClose={() => setViewing(null)}
        recipe={viewing}
        items={items}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <RecipeSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        recipe={editing === "new" || editing === null ? null : editing}
      />
    </>
  );
}
