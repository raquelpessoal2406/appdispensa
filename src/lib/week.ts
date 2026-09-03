const DAY_LABELS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Datas (YYYY-MM-DD) de Segunda a Domingo da semana atual. */
export function getCurrentWeekDates(): { date: string; label: string; shortLabel: string }[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return {
      date: toISODate(d),
      label: DAY_LABELS[i],
      shortLabel: `${dd}/${mm}`,
    };
  });
}
