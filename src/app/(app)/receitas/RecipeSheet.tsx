"use client";

import { useState, useTransition } from "react";
import { Sheet } from "@/components/Sheet";
import { MEAL_TYPES, type Ingredient, type MealType, type Recipe } from "@/lib/types";
import { createRecipe, updateRecipe, type RecipeInput } from "./actions";

export function RecipeSheet({
  open,
  onClose,
  recipe,
}: {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [prepMinutes, setPrepMinutes] = useState(
    recipe?.prep_minutes != null ? String(recipe.prep_minutes) : "",
  );
  const [servings, setServings] = useState(recipe?.servings ?? 2);
  const [mealTypes, setMealTypes] = useState<MealType[]>(recipe?.meal_types ?? []);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients?.length ? recipe.ingredients : [{ name: "", qty: "" }],
  );
  const [instructions, setInstructions] = useState(recipe?.instructions ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName(recipe?.name ?? "");
    setPrepMinutes(recipe?.prep_minutes != null ? String(recipe.prep_minutes) : "");
    setServings(recipe?.servings ?? 2);
    setMealTypes(recipe?.meal_types ?? []);
    setIngredients(recipe?.ingredients?.length ? recipe.ingredients : [{ name: "", qty: "" }]);
    setInstructions(recipe?.instructions ?? "");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function toggleMealType(mt: MealType) {
    setMealTypes((prev) => (prev.includes(mt) ? prev.filter((m) => m !== mt) : [...prev, mt]));
  }

  function updateIngredient(index: number, field: "name" | "qty", value: string) {
    setIngredients((prev) => prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing)));
  }

  function addIngredientRow() {
    setIngredients((prev) => [...prev, { name: "", qty: "" }]);
  }

  function removeIngredientRow(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    const cleanIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), qty: i.qty.trim() }))
      .filter((i) => i.name);

    if (!name.trim() || mealTypes.length === 0 || cleanIngredients.length === 0) {
      setError("Preenche o nome, pelo menos um tipo de refeição e um ingrediente.");
      return;
    }

    const input: RecipeInput = {
      name: name.trim(),
      prep_minutes: prepMinutes ? Number(prepMinutes) : null,
      servings: servings || 2,
      meal_types: mealTypes,
      ingredients: cleanIngredients,
      instructions: instructions.trim() || null,
    };

    startTransition(async () => {
      try {
        if (recipe) {
          await updateRecipe(recipe.id, input);
        } else {
          await createRecipe(input);
        }
        handleClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao guardar.");
      }
    });
  }

  return (
    <Sheet open={open} onClose={handleClose} title={recipe ? "Editar receita" : "Nova receita"}>
      <div className="flex flex-col gap-3.5">
        <Field label="Nome">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ex: Esparguete à bolonhesa" />
        </Field>

        <div className="flex gap-2.5">
          <Field label="Tempo de preparação (min)" className="flex-1">
            <input
              type="number"
              min={0}
              value={prepMinutes}
              onChange={(e) => setPrepMinutes(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Nº de pessoas" className="flex-1">
            <input
              type="number"
              min={1}
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="input"
            />
          </Field>
        </div>

        <Field label="Tipo(s) de refeição">
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt}
                type="button"
                onClick={() => toggleMealType(mt)}
                className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold ${
                  mealTypes.includes(mt)
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface text-ink"
                }`}
              >
                {mt}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Ingredientes">
          <div className="flex flex-col gap-2">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, "name", e.target.value)}
                  placeholder="Ingrediente"
                  className="input flex-1"
                />
                <input
                  value={ing.qty}
                  onChange={(e) => updateIngredient(index, "qty", e.target.value)}
                  placeholder="Qtd."
                  className="input w-24"
                />
                <button
                  type="button"
                  onClick={() => removeIngredientRow(index)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border-none bg-danger-tint text-danger"
                  aria-label="Remover ingrediente"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addIngredientRow} className="btn btn-ghost mt-2">
            + Ingrediente
          </button>
        </Field>

        <Field label="Modo de preparação">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="input min-h-[110px] resize-y"
            placeholder="Passos da receita…"
          />
        </Field>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <button
          type="button"
          disabled={pending}
          onClick={handleSave}
          className="btn btn-primary mt-1.5 w-full"
        >
          {pending ? "A guardar…" : "Guardar"}
        </button>
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
