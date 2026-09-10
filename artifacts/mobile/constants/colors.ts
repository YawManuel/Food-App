const colors = {
  light: {
    text: "#1A1A1A",
    tint: "#CC0001",

    background: "#FFF8F0",
    foreground: "#1A1A1A",

    card: "#FFFFFF",
    cardForeground: "#1A1A1A",

    primary: "#CC0001",
    primaryForeground: "#FFFFFF",

    secondary: "#FFC107",
    secondaryForeground: "#1A1A1A",

    muted: "#F5EDE0",
    mutedForeground: "#888888",

    accent: "#006B3F",
    accentForeground: "#FFFFFF",

    destructive: "#EF4444",
    destructiveForeground: "#FFFFFF",

    border: "#EDDED0",
    input: "#EDDED0",

    success: "#22C55E",
    successForeground: "#FFFFFF",
  },

  // Warm, low-chroma dark palette. The Ghana flag hues are kept but lifted so
  // they clear WCAG AA against the dark surfaces — #CC0001 is far too dark to
  // read on #141110, hence the brighter #FF4A3D primary.
  dark: {
    text: "#F5F1EA",
    tint: "#FF4A3D",

    background: "#141110",
    foreground: "#F5F1EA",

    card: "#1F1B19",
    cardForeground: "#F5F1EA",

    primary: "#FF4A3D",
    primaryForeground: "#1A0F0E",

    secondary: "#FFC107",
    secondaryForeground: "#1A1A1A",

    muted: "#2A2422",
    mutedForeground: "#A79E96",

    accent: "#2FA36B",
    accentForeground: "#0A1F14",

    destructive: "#F87171",
    destructiveForeground: "#1A0F0E",

    border: "#342C29",
    input: "#342C29",

    success: "#4ADE80",
    successForeground: "#0B1F12",
  },

  radius: 12,
};

export default colors;
