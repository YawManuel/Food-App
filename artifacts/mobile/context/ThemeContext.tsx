import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

type ThemeContextType = {
  /** What the user picked. */
  mode: ThemeMode;
  /** What that resolves to right now, after consulting the OS. */
  scheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  /** True once the persisted choice has been read back. */
  hydrated: boolean;
};

const STORAGE_KEY = "@asap_theme_mode";

const ThemeContext = createContext<ThemeContextType>({
  mode: "system",
  scheme: "light",
  setMode: () => {},
  hydrated: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (stored === "light" || stored === "dark" || stored === "system") {
          setModeState(stored);
        }
      })
      .catch(() => {
        // A failed read just means we stay on "system" — not worth surfacing.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const scheme: ColorScheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo(
    () => ({ mode, scheme, setMode, hydrated }),
    [mode, scheme, setMode, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
