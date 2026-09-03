import type { Item } from "./types";

export type ExpiryStatus = "none" | "ok" | "soon" | "expired";

export function getExpiryStatus(item: Pick<Item, "expiry" | "alert_days">): ExpiryStatus {
  if (!item.expiry) return "none";

  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(item.expiry));
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return "expired";
  if (diffDays <= (item.alert_days ?? 3)) return "soon";
  return "ok";
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isLowStock(item: Item): boolean {
  if (item.ignore_low_stock) return false;
  if (item.min_stock == null) return false;
  return item.amount <= item.min_stock;
}

export function countAlerts(items: Item[]): number {
  const expiryAlerts = items.filter((i) => {
    const s = getExpiryStatus(i);
    return s === "soon" || s === "expired";
  }).length;
  const lowStockAlerts = items.filter(isLowStock).length;
  return expiryAlerts + lowStockAlerts;
}
