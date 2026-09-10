/**
 * Money and time formatting helpers.
 *
 * Prices across the menu are whole cedis, but promo discounts and service
 * charges introduce pesewas — so every displayed amount goes through
 * `formatCedis` rather than being interpolated raw.
 */

export function formatCedis(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const hasPesewas = rounded % 1 !== 0;
  return `GH₵ ${rounded.toFixed(hasPesewas ? 2 : 0)}`;
}

/** "Today, 14:05" / "Yesterday, 09:30" / "12 Aug, 09:30" */
export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
  })}, ${time}`;
}

/** Countdown text for an ETA that may already have elapsed. */
export function formatEta(minutesRemaining: number): string {
  if (minutesRemaining <= 0) return "Any moment now";
  if (minutesRemaining === 1) return "1 min away";
  return `${minutesRemaining} mins away`;
}
