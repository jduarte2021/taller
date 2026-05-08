import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const THEMES = {
  dark: {
    name: "dark",
    bg: "#060f1e", bgCard: "#0f172a", bgSecondary: "#1e293b", border: "#1e293b",
    text: "#f1f5f9", textMuted: "#94a3b8", accent: "#38bdf8", accentSecondary: "#6366f1",
    sidebar: "#0b1120", sidebarBorder: "#1e293b", sidebarText: "#94a3b8", sidebarTextActive: "#38bdf8",
    input: "#1e293b", inputBorder: "#334155", label: "Oscuro",
  },
  taller: {
    name: "taller",
    bg: "#0a0a0a", bgCard: "#1a1a1a", bgSecondary: "#2a2a2a", border: "#333",
    text: "#f5f5f0", textMuted: "#aaa", accent: "#f59e0b", accentSecondary: "#ef4444",
    sidebar: "#111", sidebarBorder: "#333", sidebarText: "#ccc", sidebarTextActive: "#f59e0b",
    input: "#222", inputBorder: "#444", label: "Taller",
  },
  light: {
    name: "light",
    bg: "#f8fafc", bgCard: "#ffffff", bgSecondary: "#f1f5f9", border: "#e2e8f0",
    text: "#0f172a", textMuted: "#475569", accent: "#2563eb", accentSecondary: "#7c3aed",
    sidebar: "#1e293b", sidebarBorder: "#334155", sidebarText: "#cbd5e1", sidebarTextActive: "#38bdf8",
    input: "#ffffff", inputBorder: "#cbd5e1", label: "Claro",
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => localStorage.getItem("theme") || "dark");
  const [largeFonts, setLargeFonts] = useState(() => localStorage.getItem("largeFonts") === "true");
  const theme = THEMES[themeName] || THEMES.dark;

  useEffect(() => { localStorage.setItem("theme", themeName); }, [themeName]);
  useEffect(() => {
    localStorage.setItem("largeFonts", largeFonts);
    document.documentElement.style.fontSize = largeFonts ? "18px" : "16px";
  }, [largeFonts]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, largeFonts, toggleLargeFonts: () => setLargeFonts(f => !f), THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
