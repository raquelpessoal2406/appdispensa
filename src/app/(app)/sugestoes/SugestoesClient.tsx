"use client";

import { useMemo, useState } from "react";
import { RecipeDetailSheet } from "@/components/RecipeDetailSheet";
import { getExpiryStatus } from "@/lib/alerts";
import { isRecipeFullyStocked, recipeStockCount, usesExpiringItem } from "@/lib/ingredientMatch";
import type { Item, Recipe } from "@/lib/types";

export function SugestoesClient({ recipes, items }: { recipes: Recipe[]; items: Item[] }) {
  const [viewing, setViewing] = useState<Recipe | null>(null);

  const expiringSoon = useMemo(() => {
    return recipes.filter((r) =>
      usesExpiringItem(items, r, (item) => {
        const s = getExpiryStatus(item);
        return s === "soon" || s === "expired";
      }),
    );
  }, [recipes, items]);

  const readyToCook = useMemo(
    () => recipes.filter((r) => isRecipeFullyStocked(items, r)),
    [recipes, items],
  );

  return (
    <>
      <h2 className="mb-1 mt-0.5 text-lg font-extrabold">Sugestões</h2>
      <p className="-mt-1.5 mb-3.5 text-[13px] leading-[1.5] text-ink-soft">
        Com base no que combina por nome com o teu inventário — a comparação é por ingrediente, não
        por quantidade exata.
      </p>

      <SectionTitle>Aproveita o que está a acabar</SectionTitle>
      {expiringSoon.length === 0 ? (
        <EmptyHint text="Sem receitas que aproveitem itens perto da validade neste momento." />
      ) : (
        expiringSoon.map((r) => <RecipeSuggestionCard key={r.id} recipe={r} items={items} onClick={() => setViewing(r)} />)
      )}

      <SectionTitle className="mt-5">Podes fazer já</SectionTitle>
      {readyToCook.length === 0 ? (
        <EmptyHint text="Ainda não há nenhuma receita com todos os ingredientes em stock." />
      ) : (
        readyToCook.map((r) => <RecipeSuggestionCard key={r.id} recipe={r} items={items} onClick={() => setViewing(r)} />)
      )}

      <RecipeDetailSheet
        open={viewing !== null}
        onClose={() => setViewing(null)}
        recipe={viewing}
        items={items}
      />
    </>
  );
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={`mb-2 text-[13px] font-extrabold text-ink-soft ${className ?? ""}`}>{children}</p>;
}

function EmptyHint({ text }: { text: string }) {
  return <p className="mb-4 text-[13.5px] text-ink-soft">{text}</p>;
}

function RecipeSuggestionCard({
  recipe,
  items,
  onClick,
}: {
  recipe: Recipe;
  items: Item[];
  onClick: () => void;
}) {
  const { have, total } = recipeStockCount(items, recipe);
  const full = have === total;

  return (
    <button type="button" className="card block w-full p-3.5 text-left" onClick={onClick}>
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <div className="text-[15.5px] font-extrabold">{recipe.name}</div>
          <div className="mt-0.5 text-[12.5px] text-ink-soft">
            {recipe.prep_minutes != null && `${recipe.prep_minutes} min · `}
            {recipe.servings} pessoas
          </div>
        </div>
        <span className={`tag ${full ? "tag-ok" : "tag-soon"}`}>
          {have}/{total}
        </span>
      </div>
    </button>
  );
}
