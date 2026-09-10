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
import type { PaymentMethod } from "./OrderContext";

export type Profile = {
  name: string;
  phone: string;
  email: string;
};

export type SavedAddress = {
  id: string;
  /** "Home", "Office", "Mum's place" … */
  label: string;
  /** Street / area line shown in pickers. */
  line: string;
  /** Landmark or delivery instruction — Ghanaian addresses lean on these. */
  landmark?: string;
  isDefault: boolean;
};

export type SavedPayment = {
  id: string;
  type: PaymentMethod;
  /** "MTN Mobile Money", "Visa •••• 4242" … */
  label: string;
  detail: string;
  isDefault: boolean;
};

type UserContextType = {
  profile: Profile;
  addresses: SavedAddress[];
  payments: SavedPayment[];
  defaultAddress: SavedAddress | null;
  defaultPayment: SavedPayment | null;
  /** Order-update push notifications. Persisted, but nothing consumes it
   *  until push is wired up server-side. */
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addAddress: (input: Omit<SavedAddress, "id" | "isDefault">) => SavedAddress;
  updateAddress: (id: string, patch: Partial<Omit<SavedAddress, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPayment: (input: Omit<SavedPayment, "id" | "isDefault">) => SavedPayment;
  removePayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;
  hydrated: boolean;
};

const STORAGE_KEY = "@asap_user";

const DEFAULT_PROFILE: Profile = {
  name: "Kwame Asante",
  phone: "+233 24 000 0000",
  email: "kwame@example.com",
};

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    line: "12 Ring Road East, Osu, Accra",
    landmark: "Blue gate opposite the pharmacy",
    isDefault: true,
  },
];

const DEFAULT_PAYMENTS: SavedPayment[] = [
  {
    id: "pay-momo",
    type: "momo",
    label: "MTN Mobile Money",
    detail: "+233 24 000 0000",
    isDefault: true,
  },
  {
    id: "pay-cash",
    type: "cash",
    label: "Cash on Delivery",
    detail: "Pay the rider when your food arrives",
    isDefault: false,
  },
];

type StoredUser = {
  profile: Profile;
  addresses: SavedAddress[];
  payments: SavedPayment[];
  notificationsEnabled: boolean;
};

const UserContext = createContext<UserContextType>({
  profile: DEFAULT_PROFILE,
  addresses: DEFAULT_ADDRESSES,
  payments: DEFAULT_PAYMENTS,
  defaultAddress: null,
  defaultPayment: null,
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  updateProfile: () => {},
  addAddress: () => {
    throw new Error("addAddress called outside UserProvider");
  },
  updateAddress: () => {},
  removeAddress: () => {},
  setDefaultAddress: () => {},
  addPayment: () => {
    throw new Error("addPayment called outside UserProvider");
  },
  removePayment: () => {},
  setDefaultPayment: () => {},
  hydrated: false,
});

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/** Keeps exactly one entry flagged default, promoting the first if none is. */
function normaliseDefaults<T extends { id: string; isDefault: boolean }>(
  list: T[],
  preferredId?: string,
): T[] {
  if (list.length === 0) return list;

  const winner =
    (preferredId && list.some((e) => e.id === preferredId)
      ? preferredId
      : list.find((e) => e.isDefault)?.id) ?? list[0].id;

  return list.map((entry) => ({ ...entry, isDefault: entry.id === winner }));
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [addresses, setAddresses] = useState<SavedAddress[]>(DEFAULT_ADDRESSES);
  const [payments, setPayments] = useState<SavedPayment[]>(DEFAULT_PAYMENTS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const parsed: Partial<StoredUser> = JSON.parse(raw);
        if (parsed.profile) setProfile(parsed.profile);
        if (Array.isArray(parsed.addresses)) setAddresses(parsed.addresses);
        if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
        if (typeof parsed.notificationsEnabled === "boolean") {
          setNotificationsEnabled(parsed.notificationsEnabled);
        }
      })
      .catch(() => {
        // Fall back to the seeded defaults.
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
    const payload: StoredUser = {
      profile,
      addresses,
      payments,
      notificationsEnabled,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  }, [profile, addresses, payments, notificationsEnabled]);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addAddress = useCallback(
    (input: Omit<SavedAddress, "id" | "isDefault">) => {
      const entry: SavedAddress = { ...input, id: makeId("addr"), isDefault: false };
      setAddresses((prev) => normaliseDefaults([...prev, entry]));
      return entry;
    },
    [],
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<Omit<SavedAddress, "id">>) => {
      setAddresses((prev) =>
        normaliseDefaults(
          prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        ),
      );
    },
    [],
  );

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => normaliseDefaults(prev.filter((a) => a.id !== id)));
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) => normaliseDefaults(prev, id));
  }, []);

  const addPayment = useCallback(
    (input: Omit<SavedPayment, "id" | "isDefault">) => {
      const entry: SavedPayment = { ...input, id: makeId("pay"), isDefault: false };
      setPayments((prev) => normaliseDefaults([...prev, entry]));
      return entry;
    },
    [],
  );

  const removePayment = useCallback((id: string) => {
    setPayments((prev) => normaliseDefaults(prev.filter((p) => p.id !== id)));
  }, []);

  const setDefaultPayment = useCallback((id: string) => {
    setPayments((prev) => normaliseDefaults(prev, id));
  }, []);

  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );
  const defaultPayment = useMemo(
    () => payments.find((p) => p.isDefault) ?? payments[0] ?? null,
    [payments],
  );

  const value = useMemo(
    () => ({
      profile,
      addresses,
      payments,
      defaultAddress,
      defaultPayment,
      notificationsEnabled,
      setNotificationsEnabled,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      addPayment,
      removePayment,
      setDefaultPayment,
      hydrated,
    }),
    [
      profile,
      addresses,
      payments,
      defaultAddress,
      defaultPayment,
      notificationsEnabled,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      addPayment,
      removePayment,
      setDefaultPayment,
      hydrated,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
