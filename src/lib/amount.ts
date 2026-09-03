const FRACTIONS: { value: number; label: string }[] = [
  { value: 0.25, label: "¼" },
  { value: 0.5, label: "½" },
  { value: 0.75, label: "¾" },
];

/** Mostra uma quantidade decimal como "unidades inteiras + fração", ex: 1.5 -> "1 + ½". */
export function formatAmount(amount: number): string {
  if (amount <= 0) return "0";

  const whole = Math.floor(amount + 1e-9);
  const remainder = Math.round((amount - whole) * 100) / 100;

  const fraction = FRACTIONS.find((f) => Math.abs(f.value - remainder) < 0.01);

  if (!fraction) {
    return whole > 0 ? String(whole) : trimDecimal(amount);
  }

  return whole > 0 ? `${whole} + ${fraction.label}` : fraction.label;
}

function trimDecimal(n: number): string {
  return String(Math.round(n * 100) / 100);
}

export const QUICK_SUBTRACT = FRACTIONS;

export function clampAmount(amount: number): number {
  return Math.max(0, Math.round(amount * 100) / 100);
}
