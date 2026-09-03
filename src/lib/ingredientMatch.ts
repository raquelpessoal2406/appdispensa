import type { Item, Recipe } from "./types";

export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/** Verifica se um ingrediente está em stock (nome igual, quantidade > 0). Comparação só por nome. */
export function isIngredientInStock(items: Item[], ingredientName: string): boolean {
  const target = normalizeName(ingredientName);
  return items.some((item) => normalizeName(item.name) === target && item.amount > 0);
}

export function findItemByName(items: Item[], name: string): Item | undefined {
  const target = normalizeName(name);
  return items.find((item) => normalizeName(item.name) === target);
}

export function recipeStockCount(items: Item[], recipe: Recipe): { have: number; total: number } {
  const total = recipe.ingredients.length;
  const have = recipe.ingredients.filter((ing) => isIngredientInStock(items, ing.name)).length;
  return { have, total };
}

export function isRecipeFullyStocked(items: Item[], recipe: Recipe): boolean {
  const { have, total } = recipeStockCount(items, recipe);
  return total > 0 && have === total;
}

/** A receita usa algum ingrediente que está a expirar em breve ou já expirado. */
export function usesExpiringItem(
  items: Item[],
  recipe: Recipe,
  isExpiringOrExpired: (item: Item) => boolean,
): boolean {
  return recipe.ingredients.some((ing) => {
    const item = findItemByName(items, ing.name);
    return item ? isExpiringOrExpired(item) : false;
  });
}
