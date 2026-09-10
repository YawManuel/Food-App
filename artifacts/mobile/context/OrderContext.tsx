import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CartItem } from "./CartContext";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "momo" | "card" | "cash";

/**
 * The record we persist. Note there is no `status` field: status is derived
 * from `placedAt` and the wall clock (see `deriveStatus`), which is what makes
 * a mid-flight order resume correctly after the app is killed and reopened.
 * Only cancellation — a real user action, not a timer — is stored.
 */
export type StoredOrder = {
  id: string;
  code: string;
  /**
   * Ordered items are snapshotted in full, unlike the cart. An order is a
   * historical record: it must keep showing the price that was actually
   * charged even after the menu changes.
   */
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  placedAt: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  etaMinutes: number;
  cancelledAt?: string;
};

export type Order = StoredOrder & {
  status: OrderStatus;
  /** Whole minutes until delivery; 0 once the window has passed. */
  minutesRemaining: number;
};

export type PlaceOrderInput = {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
};

type OrderContextType = {
  orders: Order[];
  activeOrders: Order[];
  pastOrders: Order[];
  /** The order worth surfacing on the home screen, if any. */
  activeOrder: Order | null;
  getOrder: (id: string) => Order | undefined;
  placeOrder: (input: PlaceOrderInput) => Order;
  cancelOrder: (id: string) => void;
  canCancel: (order: Order) => boolean;
  hydrated: boolean;
};

const STORAGE_KEY = "@asap_orders";

/**
 * Demo clock. There is no backend driving fulfilment yet, so an order's
 * lifecycle is simulated: one "delivery minute" elapses every 2 real seconds,
 * letting a 35-minute ETA play out in about 70s. When the API server grows
 * real order endpoints this whole simulation is replaced by the server's
 * status field, and `deriveStatus` goes away.
 */
const SIMULATED_MINUTE_MS = 2_000;

/** Fraction of the total delivery window at which each stage begins. */
const STAGE_THRESHOLDS: { status: OrderStatus; at: number }[] = [
  { status: "delivered", at: 1 },
  { status: "on_the_way", at: 0.6 },
  { status: "preparing", at: 0.2 },
  { status: "confirmed", at: 0.05 },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  on_the_way: "On the Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** The happy path, in order — used to render progress trackers. */
export const STATUS_STEPS: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "on_the_way",
  "delivered",
];

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  momo: "Mobile Money",
  card: "Card",
  cash: "Cash on Delivery",
};

function windowMs(order: StoredOrder): number {
  return Math.max(order.etaMinutes, 1) * SIMULATED_MINUTE_MS;
}

function deriveStatus(order: StoredOrder, now: number): OrderStatus {
  if (order.cancelledAt) return "cancelled";

  const elapsed = now - new Date(order.placedAt).getTime();
  const progress = elapsed / windowMs(order);

  for (const stage of STAGE_THRESHOLDS) {
    if (progress >= stage.at) return stage.status;
  }
  return "placed";
}

function deriveMinutesRemaining(order: StoredOrder, now: number): number {
  const elapsed = now - new Date(order.placedAt).getTime();
  const remaining = windowMs(order) - elapsed;
  return remaining <= 0 ? 0 : Math.ceil(remaining / SIMULATED_MINUTE_MS);
}

function isInFlight(status: OrderStatus): boolean {
  return status !== "delivered" && status !== "cancelled";
}

function makeOrderCode(): string {
  return `ASA-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  activeOrders: [],
  pastOrders: [],
  activeOrder: null,
  getOrder: () => undefined,
  placeOrder: () => {
    throw new Error("placeOrder called outside OrderProvider");
  },
  cancelOrder: () => {},
  canCancel: () => false,
  hydrated: false,
});

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [stored, setStored] = useState<StoredOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setStored(parsed);
      })
      .catch(() => {
        // Unreadable history is not fatal — carry on with none.
      })
      .finally(() => {
        if (cancelled) return;
        hydratedRef.current = true;
        setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
  }, [stored]);

  const orders = useMemo<Order[]>(
    () =>
      stored.map((o) => ({
        ...o,
        status: deriveStatus(o, now),
        minutesRemaining: deriveMinutesRemaining(o, now),
      })),
    [stored, now],
  );

  const hasInFlight = orders.some((o) => isInFlight(o.status));

  // Only tick while something is actually moving, so a user sitting on the
  // Orders tab with nothing outstanding doesn't re-render once a second.
  useEffect(() => {
    if (!hasInFlight) return;
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, [hasInFlight]);

  const placeOrder = useCallback((input: PlaceOrderInput): Order => {
    const placedAt = new Date().toISOString();
    const record: StoredOrder = {
      id: `${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
      code: makeOrderCode(),
      items: input.items,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      discount: input.discount,
      total: input.total,
      placedAt,
      address: input.address,
      notes: input.notes,
      paymentMethod: input.paymentMethod,
      etaMinutes: 30 + Math.floor(Math.random() * 20),
    };

    setStored((prev) => [record, ...prev]);
    setNow(Date.now());

    return {
      ...record,
      status: "placed",
      minutesRemaining: record.etaMinutes,
    };
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setStored((prev) =>
      prev.map((o) =>
        o.id === id && !o.cancelledAt
          ? { ...o, cancelledAt: new Date().toISOString() }
          : o,
      ),
    );
  }, []);

  /** Once the kitchen has started cooking, it's too late to call it off. */
  const canCancel = useCallback(
    (order: Order) => order.status === "placed" || order.status === "confirmed",
    [],
  );

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const activeOrders = useMemo(
    () => orders.filter((o) => isInFlight(o.status)),
    [orders],
  );
  const pastOrders = useMemo(
    () => orders.filter((o) => !isInFlight(o.status)),
    [orders],
  );
  const activeOrder = activeOrders[0] ?? null;

  const value = useMemo(
    () => ({
      orders,
      activeOrders,
      pastOrders,
      activeOrder,
      getOrder,
      placeOrder,
      cancelOrder,
      canCancel,
      hydrated,
    }),
    [
      orders,
      activeOrders,
      pastOrders,
      activeOrder,
      getOrder,
      placeOrder,
      cancelOrder,
      canCancel,
      hydrated,
    ],
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
