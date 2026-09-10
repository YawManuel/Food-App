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
import { MENU_ITEMS, MenuItem } from "@/constants/menu";

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  quantityOf: (itemId: string) => number;
  totalItems: number;
  subtotal: number;
  hydrated: boolean;
};

const STORAGE_KEY = "@asap_cart";

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  quantityOf: () => 0,
  totalItems: 0,
  subtotal: 0,
  hydrated: false,
});

/**
 * Only the item id and quantity are persisted — the menu itself is the source
 * of truth for name/price/image. Storing whole MenuItem snapshots would let a
 * stale cart quote last week's price after a menu update.
 */
type StoredLine = { id: string; quantity: number };

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;

        const lines: StoredLine[] = JSON.parse(raw);
        const restored = lines.flatMap<CartItem>((line) => {
          const item = MENU_ITEMS.find((m) => m.id === line.id);
          // Drop lines whose dish has since left the menu.
          if (!item || line.quantity <= 0) return [];
          return [{ item, quantity: line.quantity }];
        });
        setItems(restored);
      })
      .catch(() => {
        // Corrupt payload — start with an empty cart rather than crashing.
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

  // Guarded on `hydratedRef` so the initial empty state can't overwrite a
  // persisted cart before the read above resolves.
  useEffect(() => {
    if (!hydratedRef.current) return;

    const lines: StoredLine[] = items.map((c) => ({
      id: c.item.id,
      quantity: c.quantity,
    }));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lines)).catch(() => {});
  }, [items]);

  const addItem = useCallback((item: MenuItem, quantity = 1) => {
    if (quantity <= 0) return;

    setItems((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + quantity } : c,
        );
      }
      return [...prev, { item, quantity }];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((c) => c.item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((c) => c.item.id !== itemId)
        : prev.map((c) => (c.item.id === itemId ? { ...c, quantity } : c)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const quantityOf = useCallback(
    (itemId: string) => items.find((c) => c.item.id === itemId)?.quantity ?? 0,
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, c) => sum + c.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, c) => sum + c.item.price * c.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      quantityOf,
      totalItems,
      subtotal,
      hydrated,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      quantityOf,
      totalItems,
      subtotal,
      hydrated,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
