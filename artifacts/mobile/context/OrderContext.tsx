import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CartItem } from "./CartContext";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "on_the_way"
  | "delivered";

export type Order = {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  placedAt: string;
  address: string;
  estimatedTime: number;
};

type OrderContextType = {
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (
    items: CartItem[],
    totalPrice: number,
    address: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
};

const OrderContext = createContext<OrderContextType>({
  orders: [],
  activeOrder: null,
  placeOrder: () => ({} as Order),
  updateOrderStatus: () => {},
});

const STORAGE_KEY = "@asap_orders";

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setOrders(JSON.parse(data));
    });
  }, []);

  const persist = useCallback((newOrders: Order[]) => {
    setOrders(newOrders);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
  }, []);

  const placeOrder = useCallback(
    (items: CartItem[], totalPrice: number, address: string): Order => {
      const order: Order = {
        id:
          Date.now().toString() + Math.random().toString(36).substring(2, 7),
        items,
        totalPrice,
        status: "placed",
        placedAt: new Date().toISOString(),
        address,
        estimatedTime: 30 + Math.floor(Math.random() * 20),
      };
      const updated = [order, ...orders];
      persist(updated);

      // Simulate status progression
      const statuses: OrderStatus[] = [
        "confirmed",
        "preparing",
        "on_the_way",
        "delivered",
      ];
      let delay = 3000;
      statuses.forEach((status) => {
        setTimeout(() => {
          setOrders((prev) =>
            prev.map((o) => (o.id === order.id ? { ...o, status } : o))
          );
        }, delay);
        delay += status === "preparing" ? 8000 : 5000;
      });

      return order;
    },
    [orders, persist]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    },
    []
  );

  const activeOrder =
    orders.find(
      (o) => o.status !== "delivered" && o.status !== "placed"
    ) ?? null;

  return (
    <OrderContext.Provider
      value={{ orders, activeOrder, placeOrder, updateOrderStatus }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
