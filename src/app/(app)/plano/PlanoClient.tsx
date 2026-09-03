"use client";

import Link from "next/link";
import { useState } from "react";
import type { Item, MealType, Recipe, WeeklyPlanRow } from "@/lib/types";
import { upsertPlanDay, type PlanDayInput } from "./actions";
import { RecipePickerSheet } from "./RecipePickerSheet";

type WeekDay = { date: string; label: string; shortLabel: string };

const DEFAULT_DAY: PlanDayInput = {
  wants_lunch: false,
  wants_dinner: false,
  lunch_recipe_id: null,
  dinner_recipe_id: null,
};

export function PlanoClient({
  weekDays,
  initialPlan,
  recipes,
  items,
}: {
  weekDays: WeekDay[];
  initialPlan: WeeklyPlanRow[];
  recipes: Recipe[];
  items: Item[];
}) {
  const [plan, setPlan] = useState<Record<string, PlanDayInput>>(() => {
    const map: Record<string, PlanDayInput> = {};
    for (const day of weekDays) {
      const row = initialPlan.find((p) => p.date === day.date);
      map[day.date] = row
        ? {
            wants_lunch: row.wants_lunch,
            wants_dinner: row.wants_dinner,
            lunch_recipe_id: row.lunch_recipe_id,
            dinner_recipe_id: row.dinner_recipe_id,
          }
        : { ...DEFAULT_DAY };
    }
    return map;
  });

  const [picker, setPicker] = useState<{ date: string; mealType: MealType } | null>(null);

  function updateDay(date: string, patch: Partial<PlanDayInput>) {
    setPlan((prev) => {
      const next = { ...prev, [date]: { ...prev[date], ...patch } };
      upsertPlanDay(date, next[date]);
      return next;
    });
  }

  function recipeName(id: string | null) {
    if (!id) return null;
    return recipes.find((r) => r.id === id)?.name ?? null;
  }

  return (
    <>
      <h2 className="mb-1 mt-0.5 text-lg font-extrabold">Plano da semana</h2>
      <p className="-mt-1.5 mb-3.5 text-[13px] leading-[1.5] text-ink-soft">
        Diz para cada dia se almoças e/ou jantas em casa, e escolhe a receita.
      </p>

      {weekDays.map((day) => {
        const dayPlan = plan[day.date];
        return (
          <div key={day.date} className="card">
            <div className="mb-2.5 flex items-baseline gap-1.5">
              <span className="font-extrabold">{day.label}</span>
              <span className="text-[12.5px] text-ink-soft">{day.shortLabel}</span>
            </div>

            <MealRow
              label="Almoço em casa"
              active={dayPlan.wants_lunch}
              recipeName={recipeName(dayPlan.lunch_recipe_id)}
              onToggle={() =>
                updateDay(day.date, {
                  wants_lunch: !dayPlan.wants_lunch,
                  lunch_recipe_id: !dayPlan.wants_lunch ? dayPlan.lunch_recipe_id : null,
                })
              }
              onPickRecipe={() => setPicker({ date: day.date, mealType: "Almoço" })}
            />

            <MealRow
              label="Jantar em casa"
              active={dayPlan.wants_dinner}
              recipeName={recipeName(dayPlan.dinner_recipe_id)}
              onToggle={() =>
                updateDay(day.date, {
                  wants_dinner: !dayPlan.wants_dinner,
                  dinner_recipe_id: !dayPlan.wants_dinner ? dayPlan.dinner_recipe_id : null,
                })
              }
              onPickRecipe={() => setPicker({ date: day.date, mealType: "Jantar" })}
            />
          </div>
        );
      })}

      <Link href="/compras" className="btn btn-accent mt-4 block w-full text-center">
        Gerar lista de compras
      </Link>

      {picker && (
        <RecipePickerSheet
          open
          onClose={() => setPicker(null)}
          recipes={recipes}
          items={items}
          mealType={picker.mealType}
          onSelect={(recipeId) => {
            updateDay(picker.date, {
              [picker.mealType === "Almoço" ? "lunch_recipe_id" : "dinner_recipe_id"]: recipeId,
            });
            setPicker(null);
          }}
        />
      )}
    </>
  );
}

function MealRow({
  label,
  active,
  recipeName,
  onToggle,
  onPickRecipe,
}: {
  label: string;
  active: boolean;
  recipeName: string | null;
  onToggle: () => void;
  onPickRecipe: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2.5 last:mb-0">
      <label className="flex flex-1 items-center gap-2.5 text-[14px] font-semibold">
        <input type="checkbox" checked={active} onChange={onToggle} />
        {label}
      </label>
      {active && (
        <button
          type="button"
          onClick={onPickRecipe}
          className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink"
        >
          {recipeName ?? "Escolher receita"}
        </button>
      )}
    </div>
  );
}
