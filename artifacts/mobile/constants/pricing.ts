/**
 * Single source of truth for order maths. The cart, checkout and order history
 * all read from here so a fee change can't drift between screens.
 */

export const DELIVERY_FEE = 10;

/** Orders at or above this subtotal ship free. */
export const FREE_DELIVERY_THRESHOLD = 150;

export type Promo = {
  code: string;
  description: string;
  /** Fraction of subtotal, 0–1. */
  percentOff: number;
  /** Cap on the discount in cedis, so a huge order can't zero itself out. */
  maxDiscount: number;
  minSubtotal: number;
};

export const PROMOS: Promo[] = [
  {
    code: "ASAP10",
    description: "10% off your order",
    percentOff: 0.1,
    maxDiscount: 20,
    minSubtotal: 50,
  },
  {
    code: "AKWAABA",
    description: "15% off — welcome to ASAP",
    percentOff: 0.15,
    maxDiscount: 30,
    minSubtotal: 80,
  },
];

export function findPromo(code: string): Promo | undefined {
  const normalised = code.trim().toUpperCase();
  return PROMOS.find((p) => p.code === normalised);
}

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function discountFor(promo: Promo | null, subtotal: number): number {
  if (!promo || subtotal < promo.minSubtotal) return 0;
  return Math.min(subtotal * promo.percentOff, promo.maxDiscount);
}

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
};

export function computeTotals(
  subtotal: number,
  promo: Promo | null = null,
): OrderTotals {
  const deliveryFee = deliveryFeeFor(subtotal);
  const discount = discountFor(promo, subtotal);
  return {
    subtotal,
    deliveryFee,
    discount,
    total: Math.max(0, subtotal + deliveryFee - discount),
  };
}
