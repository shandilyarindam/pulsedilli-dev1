"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download, Filter, Search, MoreHorizontal, Eye,
  ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  Droplet, Zap, Car, Trash2, ShieldAlert, RefreshCw, AlertTriangle
} from "lucide-react";
import {
  getAggregateMetrics,
  getComplaintsList,
  type ComplaintListRow,
} from "@/services/complaints";

/* ─────────────────────────────────────────────────────────
   Category icon helpers
───────────────────────────────────────────────────────── */
type CatConfig = {
  icon: React.ReactNode;
  label: string;
  bg: string;
  color: string;
};

function getCategoryConfig(name: string | null, dept: string | null): CatConfig {
  const key = (name || dept || "").toLowerCase();

  if (key.includes("water") || dept === "DJB Water")
    return { icon: <Droplet className="w-4 h-4" />, label: name || "Water Supply", bg: "bg-blue-100", color: "text-blue-600" };
  if (key.includes("electric") || key.includes("bses") || key.includes("tpddl") || dept === "BSES/TPDDL")
    return { icon: <Zap className="w-4 h-4" />, label: name || "Electricity", bg: "bg-amber-100", color: "text-amber-600" };
  if (key.includes("road") || key.includes("pwd") || dept === "PWD")
    return { icon: <Car className="w-4 h-4" />, label: name || "Roads", bg: "bg-slate-100", color: "text-slate-600" };
  if (key.includes("sanit") || key.includes("sewage") || key.includes("drainage") || key.includes("garbage") || key.includes("waste") || key.includes("mcd") || dept === "MCD" || dept === "DJB Drainage")
    return { icon: <Trash2 className="w-4 h-4" />, label: name || "Sanitation", bg: "bg-emerald-100", color: "text-emerald-600" };
  if (key.includes("traffic"))
    return { icon: <ShieldAlert className="w-4 h-4" />, label: name || "Traffic", bg: "bg-indigo-100", color: "text-indigo-600" };

  return { icon: <ShieldAlert className="w-4 h-4" />, label: name || "General", bg: "bg-indigo-100", color: "text-indigo-600" };
}

/* ─────────────────────────────────────────────────────────
   Priority Badge
───────────────────────────────────────────────────────── */
function PriorityBadge({ severity }: { severity: string | null }) {
  const s = (severity || "low").toLowerCase();
  const map: Record<string, string> = {
    critical: "bg-rose-100 text-rose-700 border-rose-200",
    high:     "bg-orange-100 text-orange-700 border-orange-200",
    medium:   "bg-blue-100 text-blue-700 border-blue-200",
    low:      "bg-slate-100 text-slate-600 border-slate-200",
  };
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${map[s] || map["low"]}`}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Status Badge
───────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase();
  const map: Record<string, { cls: string; label: string }> = {
    submitted:   { cls: "bg-slate-100 text-slate-600 border-slate-200",     label: "Pending" },
    open:        { cls: "bg-amber-100 text-amber-700 border-amber-200",      label: "Pending" },
    in_progress: { cls: "bg-amber-100 text-amber-700 border-amber-200",      label: "In Progress" },
    resolved:    { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Resolved" },
  };
  const { cls, label } = map[s] || map["submitted"];
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Format date/time
───────────────────────────────────────────────────────── */
function formatReportedOn(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `Reported on ${date}, ${time}`;
}

/* ─────────────────────────────────────────────────────────
   Officer initials avatar
───────────────────────────────────────────────────────── */
function OfficerAvatar({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Skeleton Row
───────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      <td className="px-4 py-4 text-center"><div className="h-4 w-4 rounded bg-slate-200 mx-auto" /></td>
      {[40, 90, 64, 180, 80, 60, 60, 110, 48].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded bg-slate-200" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

export default function CitizenComplaintsPage() {
  /* ── Area dropdown state ── */
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Districts");
  const areaRef = useRef<HTMLDivElement>(null);

  const areas = [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi",
    "North East Delhi", "North West Delhi", "Outer North Delhi", "Shahdara",
    "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ];
  const filteredAreas = areas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setAreaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── Supabase: KPI metrics ── */
  const [metrics, setMetrics] = useState({
    total: 0, pending: 0, inProgress: 0, resolved: 0,
    avgResolutionDays: null as number | null,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  /* ── Supabase: complaints table ── */
  const [allComplaints, setAllComplaints] = useState<ComplaintListRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  /* ── Filter state ── */
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Fetch metrics ── */
  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const agg = await getAggregateMetrics();
      setMetrics({
        total: agg.total,
        pending: agg.submitted + agg.open,
        inProgress: agg.inProgress,
        resolved: agg.resolved,
        avgResolutionDays: agg.avgResolutionDays,
      });
    } catch (e) {
      console.error("Metrics fetch failed:", e);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  /* ── Fetch complaints ── */
  const fetchComplaints = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const res = await getComplaintsList(1, 200);
      setAllComplaints((res.data || []) as ComplaintListRow[]);
      setTotalCount(res.count || 0);
    } catch (e) {
      console.error("Complaints fetch failed:", e);
      setTableError("Could not load complaints. Please retry.");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchComplaints();
  }, [fetchMetrics, fetchComplaints]);

  /* ── Client filtering ── */
  const filtered = allComplaints.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (priorityFilter !== "all" && (c.severity || "").toLowerCase() !== priorityFilter) return false;
    if (selectedArea !== "All Districts" && (c.city || "").toLowerCase() !== selectedArea.toLowerCase()) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, priorityFilter, selectedArea]);

  /* ── CSV Export ── */
  function exportCSV() {
    const header = ["Complaint ID", "Category", "Title", "Area/District", "Priority", "Status", "Assigned Officer", "Role", "Reported On"];
    const rows = filtered.map(c => [
      c.ticket_id || c.id,
      c.categories?.name || "General",
      `"${(c.title || "").replace(/"/g, '""')}"`,
      c.city || "Delhi",
      c.severity || "low",
      c.status || "",
      c.profiles?.full_name || "Unassigned",
      c.profiles?.role || c.categories?.department || "",
      c.created_at ? new Date(c.created_at).toLocaleString("en-IN") : "",
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Delhi_Complaints_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Computed KPI display values ── */
  const avgLabel = metrics.avgResolutionDays !== null
    ? metrics.avgResolutionDays.toFixed(1)
    : "—";

  /* ── Pagination helpers ── */
  const startRow = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(currentPage * PAGE_SIZE, filtered.length);

  function getPaginationPages() {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track public grievances across Delhi</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchMetrics(); fetchComplaints(); }}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              <Download className="w-4 h-4" /> Export as PDF
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Total Complaints</span>
            <div className="flex items-end gap-2 mb-2">
              {metricsLoading
                ? <div className="h-9 w-24 rounded bg-slate-200 animate-pulse" />
                : <span className="text-3xl font-bold text-slate-900">{metrics.total.toLocaleString()}</span>
              }
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="w-3 h-3" /> Live from database
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Pending</span>
            <div className="flex items-end gap-2 mb-2">
              {metricsLoading
                ? <div className="h-9 w-20 rounded bg-slate-200 animate-pulse" />
                : <span className="text-3xl font-bold text-slate-900">{metrics.pending.toLocaleString()}</span>
              }
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-rose-600">
              <TrendingUp className="w-3 h-3" /> Awaiting action
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">In Progress</span>
            <div className="flex items-end gap-2 mb-2">
              {metricsLoading
                ? <div className="h-9 w-20 rounded bg-slate-200 animate-pulse" />
                : <span className="text-3xl font-bold text-slate-900">{metrics.inProgress.toLocaleString()}</span>
              }
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <TrendingDown className="w-3 h-3" /> Being resolved
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Resolved</span>
            <div className="flex items-end gap-2 mb-2">
              {metricsLoading
                ? <div className="h-9 w-20 rounded bg-slate-200 animate-pulse" />
                : <span className="text-3xl font-bold text-slate-900">{metrics.resolved.toLocaleString()}</span>
              }
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="w-3 h-3" /> Closed successfully
            </div>
          </div>

          {/* Avg. Resolution Time */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Avg. Resolution Time</span>
            <div className="flex items-end gap-2 mb-2">
              {metricsLoading
                ? <div className="h-9 w-24 rounded bg-slate-200 animate-pulse" />
                : <span className="text-3xl font-bold text-slate-900">
                    {avgLabel}<span className="text-lg text-slate-500 font-semibold ml-1">days</span>
                  </span>
              }
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingDown className="w-3 h-3" /> From resolved tickets
            </div>
          </div>
        </div>

        {/* ── Filters + Table ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">

          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-3">

            {/* Department / Category (static — filtering by category not in current schema columns) */}
            <div className="relative">
              <select
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="Department"
              >
                <option>Department</option>
                <option>Water Supply</option>
                <option>PWD</option>
                <option>MCD</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Area Dropdown */}
            <div className="relative" ref={areaRef}>
              <button
                onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
                className="flex items-center justify-between w-44 bg-slate-50 border border-slate-300 text-slate-700 py-2 pl-3 pr-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="truncate">{selectedArea}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              {areaDropdownOpen && (
                <div className="absolute z-10 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-100 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search district..."
                      className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                      value={areaSearch}
                      onChange={(e) => setAreaSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      onClick={() => { setSelectedArea("District"); setAreaDropdownOpen(false); setAreaSearch(""); }}
                    >
                      All Districts
                    </button>
                    {filteredAreas.map(area => (
                      <button
                        key={area}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                        onClick={() => { setSelectedArea(area); setAreaDropdownOpen(false); setAreaSearch(""); }}
                      >
                        {area}
                      </button>
                    ))}
                    {filteredAreas.length === 0 && (
                      <div className="px-4 py-2 text-sm text-slate-500 text-center">No areas found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Status</option>
                <option value="submitted">Pending</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Priority filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Date Range (static UI) */}
            <div className="relative">
              <select className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Date Range</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex-grow" />

            <button className="flex items-center gap-2 text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition">
              <Filter className="w-4 h-4" /> More Filters
            </button>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
              Apply Filters
            </button>
          </div>

          {/* Table Error */}
          {tableError && (
            <div className="m-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {tableError}
              </div>
              <button
                onClick={fetchComplaints}
                className="rounded border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-normal break-words">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint Details</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Area / District</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Officer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableLoading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-14 text-center text-slate-400 text-sm">
                      No complaints match your current filters.
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => {
                    const cat = getCategoryConfig(c.categories?.name ?? null, c.categories?.department ?? null);
                    const ticketDisplay = `#${(c.ticket_id || c.id).substring(0, 6).toUpperCase()}`;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-4 text-center">
                          <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        </td>

                        {/* Complaint ID */}
                        <td className="px-4 py-4 font-medium text-slate-900">{ticketDisplay}</td>

                        {/* Category + Icon */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${cat.bg} flex items-center justify-center ${cat.color}`}>
                              {cat.icon}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                          </div>
                        </td>

                        {/* Complaint Details */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col max-w-[260px]">
                            <span className="text-sm font-semibold text-slate-900 line-clamp-2">
                              {c.title || "Complaint reported"}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {formatReportedOn(c.created_at)}
                            </span>
                          </div>
                        </td>

                        {/* Area / District */}
                        <td className="px-4 py-4 text-sm text-slate-700">{c.city || "Delhi"}</td>

                        {/* Priority */}
                        <td className="px-4 py-4">
                          <PriorityBadge severity={c.severity} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusBadge status={c.status} />
                        </td>

                        {/* Assigned Officer */}
                        <td className="px-4 py-4">
                          {c.profiles?.full_name ? (
                            <div className="flex items-center gap-3">
                              <OfficerAvatar name={c.profiles.full_name} />
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-900">{c.profiles.full_name}</span>
                                <span className="text-xs text-slate-500">
                                  {c.profiles.role || c.categories?.department || "Officer"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                --
                              </div>
                              <span className="text-sm font-semibold text-slate-500 italic">Unassigned</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button className="text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                            <button className="text-slate-400 hover:text-slate-700 transition"><MoreHorizontal className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Rows per page:</span>
              <select className="bg-transparent font-medium focus:outline-none cursor-pointer">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <span className="mr-4">
                {tableLoading ? "Loading…" : `${startRow}–${endRow} of ${filtered.length.toLocaleString()}`}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {getPaginationPages().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-slate-400">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-8 h-8 rounded-md font-medium flex items-center justify-center transition text-sm ${
                        currentPage === p
                          ? "bg-blue-600 text-white"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-slate-100 text-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
