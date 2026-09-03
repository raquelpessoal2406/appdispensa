"use client";

import { useMemo, useState } from "react";
import { RecipeDetailSheet } from "@/components/RecipeDetailSheet";
import { normalizeName, recipeStockCount } from "@/lib/ingredientMatch";
import { MEAL_TYPES, type Item, type MealType, type Recipe } from "@/lib/types";
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
  const [search, setSearch] = useState("");
  const [mealFilter, setMealFilter] = useState<MealType | "Todos">("Todos");

  const knownIngredientNames = useMemo(() => {
    const names = new Map<string, string>();
    for (const item of items) names.set(normalizeName(item.name), item.name);
    for (const recipe of initialRecipes) {
      for (const ing of recipe.ingredients) names.set(normalizeName(ing.name), ing.name);
    }
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b, "pt"));
  }, [items, initialRecipes]);

  const filteredRecipes = useMemo(() => {
    const query = normalizeName(search);
    return initialRecipes
      .filter((r) => mealFilter === "Todos" || r.meal_types.includes(mealFilter))
      .filter((r) => !query || normalizeName(r.name).includes(query))
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }, [initialRecipes, mealFilter, search]);

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

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar receita…"
        className="input mb-3"
      />

      <div className="mb-3.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          className={`chip ${mealFilter === "Todos" ? "active" : ""}`}
          onClick={() => setMealFilter("Todos")}
        >
          Todos
        </button>
        {MEAL_TYPES.map((mt) => (
          <button
            key={mt}
            className={`chip ${mealFilter === mt ? "active" : ""}`}
            onClick={() => setMealFilter(mt)}
          >
            {mt}
          </button>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="empty">
          <div className="big">🍳</div>
          <p>
            {initialRecipes.length === 0
              ? "Ainda não tens receitas guardadas."
              : "Nenhuma receita corresponde à pesquisa/filtro."}
          </p>
        </div>
      )}

      {filteredRecipes.map((recipe) => {
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
        knownIngredientNames={knownIngredientNames}
      />
    </>
  );
}
