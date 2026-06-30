"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface Props {
 /** Compact mode for tablet icon-only sidebar */
 compact?: boolean;
}

export default function ThemeToggle({ compact }: Props) {
 const { theme, toggleTheme } = useTheme();

 if (compact) {
 return (
 <button
 onClick={toggleTheme}
 className="flex items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface)] p-2.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-elevated)]"
 aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
 title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
 >
 {theme === "dark" ? (
 <Sun className="h-4 w-4 text-yellow-400 stroke-[2.5]" />
 ) : (
 <Moon className="h-4 w-4 text-blue-600 stroke-[2.5] " />
 )}
 </button>
 );
 }

 return (
 <button
 onClick={toggleTheme}
 className="flex items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-elevated)]"
 aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
 >
 {theme === "dark" ? (
 <Sun className="h-4 w-4 shrink-0 text-yellow-400 stroke-[2.5]" />
 ) : (
 <Moon className="h-4 w-4 shrink-0 text-blue-600 stroke-[2.5] " />
 )}
 {theme === "dark" ? "Light Mode" : "Dark Mode"}
 </button>
 );
}
