"use client";

import {
 createContext,
 useContext,
 useEffect,
 useState,
 useCallback,
 type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
 theme: Theme;
 toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
 theme: "light",
 toggleTheme: () => {},
});

export function useTheme() {
 return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
 const [theme, setTheme] = useState<Theme>("light");

 // Sync with localStorage + html class on mount
 useEffect(() => {
 const stored = localStorage.getItem("theme") as Theme | null;
 const initial = stored === "dark" ? "dark" : "light";
 setTheme(initial);
 document.documentElement.classList.toggle("dark", initial === "dark");
 }, []);

 const toggleTheme = useCallback(() => {
 setTheme((prev) => {
 const next = prev === "light" ? "dark" : "light";
 localStorage.setItem("theme", next);
 document.documentElement.classList.toggle("dark", next === "dark");
 return next;
 });
 }, []);

 return (
 <ThemeContext.Provider value={{ theme, toggleTheme }}>
 {children}
 </ThemeContext.Provider>
 );
}
