"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, memo } from "react";
import {
 LayoutDashboard,
 Map,
 FileText,
 PieChart,
 Menu,
 X,
 TrendingUp,
 Command,
} from "lucide-react";

const NAV = [
 { href: "/", label: "Dashboard", icon: LayoutDashboard },
 { href: "/analytics", label: "Analytics", icon: TrendingUp },
 { href: "/map", label: "Map", icon: Map },
 { href: "/command-centre", label: "Command Centre", icon: Command },
 { href: "/citizen-complaints", label: "Complaints", icon: FileText },
 { href: "/reports", label: "Reports", icon: PieChart },
] as const;

/**
 * Sidebar — single fluid structure.
 * Collapsed → w-16 (icons only). Expanded → w-60 (icons + labels).
 * No absolute panels, no duplicate renders, no icon strips.
 * GPU-accelerated via will-change + translateZ(0) + backface-visibility.
 * Wrapped in React.memo so parent page re-renders never touch this tree.
 */
const Sidebar = memo(function Sidebar() {
 const path = usePathname();
 const [mobileOpen, setMobileOpen] = useState(false);
 const [isExpanded, setIsExpanded] = useState(false);

 // Close mobile drawer on route change
 useEffect(() => { setMobileOpen(false); }, [path]);

 // Escape closes mobile drawer
 const handleKey = useCallback((e: KeyboardEvent) => {
 if (e.key === "Escape") setMobileOpen(false);
 }, []);
 useEffect(() => {
 document.addEventListener("keydown", handleKey);
 return () => document.removeEventListener("keydown", handleKey);
 }, [handleKey]);

 // Lock body scroll when mobile drawer open
 useEffect(() => {
 document.body.style.overflow = mobileOpen ? "hidden" : "";
 return () => { document.body.style.overflow = ""; };
 }, [mobileOpen]);

 // ── Shared nav list (used in both desktop + mobile) ─────────────────────
 const NavItems = ({ expanded }: { expanded: boolean }) => (
 <ul className="space-y-1">
 {NAV.map(({ href, label, icon: Icon }) => {
 const active = href === "/" ? path === "/" : path.startsWith(href);
 return (
 <li key={href}>
 <Link
 href={href}
 title={!expanded ? label : undefined}
 className={`flex items-center gap-3 rounded-xl py-2.5 text-[13px] font-bold
 transition-colors duration-150 ease-in-out overflow-hidden
 ${expanded ? "px-3" : "px-2.5 justify-center"}
 ${active
 ? "bg-red-50 text-red-600"
 : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
 }`}
 >
 <Icon className={`h-5 w-5 shrink-0 ${active ? "text-red-600" : "text-[#64748B]"}`} />
 {/* Label fades in/out — no second render of icons */}
 <span
 className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out leading-none ${
 expanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
 }`}
 style={{ willChange: "max-width, opacity" }}
 >
 {label}
 </span>
 </Link>
 </li>
 );
 })}
 </ul>
 );

 return (
 <>
 {/* ── Mobile hamburger ──────────────────────────────────────────────── */}
 <button
 onClick={() => setMobileOpen(true)}
 className="fixed top-4 right-4 z-40 rounded-lg p-2.5 bg-white text-[#0F172A] shadow-md border border-[#E8EDF5] md:hidden hover:bg-slate-50 transition-colors"
 aria-label="Open navigation"
 >
 <Menu className="h-5 w-5" />
 </button>

 {/* ── Mobile overlay ────────────────────────────────────────────────── */}
 <div
 className={`fixed inset-0 z-40 bg-[#0F172A]/40 md:hidden backdrop-blur-sm
 transition-opacity duration-300 ease-in-out
 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
 onClick={() => setMobileOpen(false)}
 />

 {/* ── Desktop sidebar ───────────────────────────────────────────────────
 Single <aside>. Width animates between w-16 and w-60.
 overflow-hidden clips labels during collapse.
 No absolute panels, no duplicate icon layers.
 ─────────────────────────────────────────────────────────────────────── */}
 <aside
 onMouseEnter={() => setIsExpanded(true)}
 onMouseLeave={() => setIsExpanded(false)}
 className={`hidden md:flex flex-col h-full shrink-0 z-30 overflow-hidden
 border-r transition-all duration-300 ease-in-out
 ${isExpanded
 ? "w-60 bg-white border-[#E8EDF5] shadow-lg"
 : "w-16 bg-[#F8FAFC] border-transparent"
 }`}
 style={{
 willChange: "width",
 backfaceVisibility: "hidden",
 WebkitBackfaceVisibility: "hidden",
 transform: "translateZ(0)",
 }}
 >
 {/* Logo row */}
 <div className="shrink-0 flex items-center border-b border-[#E8EDF5] py-5 overflow-hidden"
 style={{ paddingLeft: isExpanded ? "1rem" : "0.5rem", paddingRight: isExpanded ? "1rem" : "0.5rem" }}>
 <img src="/pulsedilli_logo-removebg.png" alt="PulseDilli Logo" className="h-10 w-auto max-w-[40px] object-contain shrink-0" />
 <span
 className={`ml-3 flex flex-col whitespace-nowrap overflow-hidden
 transition-all duration-300 ease-in-out
 ${isExpanded ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"}`}
 style={{ willChange: "max-width, opacity" }}
 >
 <span className="text-[18px] font-black tracking-tight leading-tight"><span className="text-slate-900">Pulse</span><span className="text-red-600 font-semibold">Dilli</span></span>
 <span className="text-[10px] font-bold text-[#64748B]">The real time pulse of Delhi</span>
 </span>
 </div>

 {/* Nav */}
 <nav className={`flex-1 py-4 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "px-3" : "px-2"}`}>
 <NavItems expanded={isExpanded} />
 </nav>

 {/* Bottom */}
 <div className={`shrink-0 mt-auto border-t border-[#E8EDF5] py-3 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "px-3" : "px-2"}`}>
 </div>
 </aside>

 {/* ── Mobile full-width drawer ───────────────────────────────────────── */}
 <div
 className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col h-full bg-white
 border-r border-[#E8EDF5] shadow-xl md:hidden
 transition-transform duration-300 ease-in-out
 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
 style={{
 willChange: "transform",
 backfaceVisibility: "hidden",
 WebkitBackfaceVisibility: "hidden",
 transform: mobileOpen ? "translateZ(0)" : "translateX(-100%)",
 }}
 >
 {/* Logo + close */}
 <div className="shrink-0 flex items-center justify-between border-b border-[#E8EDF5] py-5 px-4">
 <div className="flex items-center gap-3">
 <img src="/pulsedilli_logo-removebg.png" alt="PulseDilli Logo" className="h-10 w-auto max-w-[40px] object-contain shrink-0" />
 <span className="text-[18px] font-black tracking-tight"><span className="text-slate-900">Pulse</span><span className="text-red-600 font-semibold">Dilli</span></span>
 </div>
 <button
 onClick={() => setMobileOpen(false)}
 className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-50 transition-colors"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Mobile nav — always expanded */}
 <nav className="flex-1 py-4 px-3">
 <NavItems expanded={true} />
 </nav>

 {/* Mobile bottom */}
 </div>
 </>
 );
});

export default Sidebar;
