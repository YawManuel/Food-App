import colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

/**
 * Returns the design tokens for the active color scheme.
 *
 * The scheme comes from ThemeContext, not directly from the OS, so an
 * explicit choice in Profile → Appearance overrides the device setting.
 * Both palettes declare the same keys, so callers never have to null-check.
 */
export function useColors() {
  const { scheme } = useTheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
