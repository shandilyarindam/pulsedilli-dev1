"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  Clock,
  Download,
  AlertTriangle,
  RefreshCw,
  UserX,
  Hourglass,
  TrendingUp,
} from "lucide-react";


import ManageComplaintModal, {
  type ManageComplaint,
} from "@/components/manage-complaint-modal";
import {
  getAggregateMetrics,
  getComplaintsList,
  type ComplaintListRow,
} from "@/services/complaints";

/* ─────────────────────────────────────────────────────────
   Category SVG Icons
───────────────────────────────────────────────────────── */
function WaterSupplyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function ElectricityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function RoadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2H3" />
      <polyline points="9 18 9 12 15 12 15 18" />
    </svg>
  );
}

function SanitationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function WasteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function OtherIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

type CategoryIconConfig = {
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  text: string;
  label: string;
};

const CATEGORY_ICON_MAP: Record<string, CategoryIconConfig> = {
  "Water Supply": { icon: WaterSupplyIcon, bg: "bg-sky-100",     text: "text-sky-700",     label: "Water Supply" },
  "water supply": { icon: WaterSupplyIcon, bg: "bg-sky-100",     text: "text-sky-700",     label: "Water Supply" },
  "water":        { icon: WaterSupplyIcon, bg: "bg-sky-100",     text: "text-sky-700",     label: "Water Supply" },
  "Electricity":  { icon: ElectricityIcon, bg: "bg-amber-100",   text: "text-amber-700",   label: "Electricity" },
  "electricity":  { icon: ElectricityIcon, bg: "bg-amber-100",   text: "text-amber-700",   label: "Electricity" },
  "BSES/TPDDL":   { icon: ElectricityIcon, bg: "bg-amber-100",   text: "text-amber-700",   label: "Electricity" },
  "Roads":        { icon: RoadsIcon,       bg: "bg-slate-100",   text: "text-slate-700",   label: "Roads" },
  "roads":        { icon: RoadsIcon,       bg: "bg-slate-100",   text: "text-slate-700",   label: "Roads" },
  "PWD":          { icon: RoadsIcon,       bg: "bg-slate-100",   text: "text-slate-700",   label: "Roads" },
  "Sanitation":   { icon: SanitationIcon,  bg: "bg-teal-100",    text: "text-teal-700",    label: "Sanitation" },
  "sanitation":   { icon: SanitationIcon,  bg: "bg-teal-100",    text: "text-teal-700",    label: "Sanitation" },
  "Sewage & Drainage": { icon: SanitationIcon, bg: "bg-teal-100", text: "text-teal-700",   label: "Sanitation" },
  "DJB Drainage": { icon: SanitationIcon,  bg: "bg-teal-100",    text: "text-teal-700",    label: "Sanitation" },
  "Waste Management": { icon: WasteIcon,   bg: "bg-green-100",   text: "text-green-700",   label: "Waste Mgmt" },
  "waste management": { icon: WasteIcon,   bg: "bg-green-100",   text: "text-green-700",   label: "Waste Mgmt" },
  "MCD":          { icon: WasteIcon,       bg: "bg-green-100",   text: "text-green-700",   label: "Waste Mgmt" },
};

function getCategoryConfig(name: string | null, dept: string | null): CategoryIconConfig {
  const key = name || dept || "";
  return (
    CATEGORY_ICON_MAP[key] ||
    CATEGORY_ICON_MAP[key.toLowerCase()] ||
    { icon: OtherIcon, bg: "bg-violet-100", text: "text-violet-700", label: key || "General" }
  );
}

/* ─────────────────────────────────────────────────────────
   Priority Badge
───────────────────────────────────────────────────────── */
function PriorityBadge({ severity }: { severity: string | null }) {
  const s = (severity || "low").toLowerCase();
  const cfg: Record<string, { cls: string; label: string }> = {
    critical: { cls: "bg-red-600 text-white border-red-700",        label: "Critical" },
    high:     { cls: "bg-orange-500 text-white border-orange-600",   label: "High" },
    medium:   { cls: "bg-amber-400 text-amber-900 border-amber-500", label: "Medium" },
    low:      { cls: "bg-green-100 text-green-800 border-green-300", label: "Low" },
  };
  const { cls, label } = cfg[s] || cfg["low"];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Status Badge
───────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string | null }) {
  const s = (status || "").toLowerCase();

  const cfg: Record<string, { cls: string; dot: string; label: string }> = {
    submitted:   { cls: "bg-slate-100 text-slate-700 border-slate-300",   dot: "bg-slate-400",   label: "Pending" },
    open:        { cls: "bg-amber-100 text-amber-800 border-amber-300",   dot: "bg-amber-500",   label: "Open" },
    in_progress: { cls: "bg-blue-100 text-blue-800 border-blue-300",      dot: "bg-blue-500",    label: "In Progress" },
    resolved:    { cls: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-500", label: "Resolved" },
  };

  const { cls, dot, label } = cfg[s] || cfg["submitted"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Format complaint date/time for display
───────────────────────────────────────────────────────── */
function formatReportedOn(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `Reported on ${date}, ${time}`;
}

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface KpiMetrics {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResolutionDays: number | null;
}

/* ─────────────────────────────────────────────────────────
   Skeleton Row
───────────────────────────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded bg-slate-200" style={{ width: `${55 + (i * 13) % 35}%` }} />
        </td>
      ))}
    </tr>
  );
}

/* ─────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────── */
export default function ComplaintsPage() {
  // ── KPI state ──
  const [metrics, setMetrics] = useState<KpiMetrics>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionDays: null,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // ── Table state ──
  const [complaints, setComplaints] = useState<ComplaintListRow[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);

  // ── Filter state ──
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Modal state ──
  const [selectedComplaint, setSelectedComplaint] = useState<ManageComplaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Fetch KPIs ── */
  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const agg = await getAggregateMetrics();
      setMetrics({
        total: agg.total,
        pending: agg.submitted + agg.open,
        inProgress: agg.inProgress,
        resolved: agg.resolved,
        avgResolutionDays: agg.avgResolutionDays,
      });
    } catch (err) {
      console.error("Failed to fetch aggregate metrics:", err);
      setMetricsError("Could not load summary metrics.");
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  /* ── Fetch Complaints Table ── */
  const fetchComplaints = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const res = await getComplaintsList(1, 200);
      setComplaints((res.data || []) as ComplaintListRow[]);
    } catch (err) {
      console.error("Failed to fetch complaints list:", err);
      setTableError("Could not load complaints data. Please retry.");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchComplaints();
  }, [fetchMetrics, fetchComplaints]);

  /* ── Client-side filtering ── */
  const filtered = complaints.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (priorityFilter !== "all" && (c.severity || "").toLowerCase() !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchTicket = c.ticket_id?.toLowerCase().includes(q);
      const matchCity = c.city?.toLowerCase().includes(q);
      const matchCat = c.categories?.name?.toLowerCase().includes(q);
      if (!matchTitle && !matchTicket && !matchCity && !matchCat) return false;
    }
    return true;
  });

  /* ── Modal helpers ── */
  function openManageModal(c: ComplaintListRow) {
    setSelectedComplaint({
      id: c.id,
      summary: c.title ?? null,
      category: c.categories?.name ?? null,
      status: c.status,
      urgency: c.severity,
      timestamp: c.created_at,
      location: c.city || "Delhi",
      ward: null,
      assigned_to: c.profiles?.full_name ?? null,
    });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedComplaint(null);
  }
  function handleUpdated() {
    closeModal();
    fetchMetrics();
    fetchComplaints();
  }

  /* ── Export CSV ── */
  function exportCSV() {
    const header = ["Complaint ID", "Category", "Department", "Title", "Area/District", "Priority", "Status", "Assigned Officer", "Reported On"];
    const rows = filtered.map((c) => [
      c.ticket_id || c.id,
      c.categories?.name || "General",
      c.categories?.department || "",
      `"${(c.title || "").replace(/"/g, '""')}"`,
      c.city || "Delhi",
      c.severity || "low",
      c.status || "",
      c.profiles?.full_name || "Unassigned",
      c.created_at ? new Date(c.created_at).toLocaleString("en-IN") : "",
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Delhi_Complaints_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── KPI card definitions ── */
  const resolvedPct = metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0;
  const avgDaysLabel =
    metrics.avgResolutionDays !== null
      ? `${metrics.avgResolutionDays} days`
      : "—";

  const kpiCards = [
    {
      id: "total",
      label: "Total Complaints",
      value: metrics.total.toLocaleString(),
      icon: FileText,
      accent: "text-[#dc2626]",
      iconBg: "bg-red-50",
      sparkline: true,
    },
    {
      id: "pending",
      label: "Pending",
      value: metrics.pending.toLocaleString(),
      icon: Hourglass,
      accent: "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      id: "inprogress",
      label: "In Progress",
      value: metrics.inProgress.toLocaleString(),
      icon: TrendingUp,
      accent: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      id: "resolved",
      label: "Resolved",
      value: `${metrics.resolved.toLocaleString()} (${resolvedPct}%)`,
      icon: CheckCircle,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      id: "avgtime",
      label: "Avg. Resolution Time",
      value: avgDaysLabel,
      icon: Clock,
      accent: "text-violet-600",
      iconBg: "bg-violet-50",
    },
  ];

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[#f8fafc] min-h-screen">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#dc2626] md:text-2xl">
            Citizen Grievances
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
            Grievance Registry — live data from Supabase
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchMetrics(); fetchComplaints(); }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-[#dc2626] bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#b91c1c]"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── 5 KPI Cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 md:gap-4">
        {kpiCards.map((card) => (
          <Card
            key={card.id}
            className="border border-slate-200 bg-white shadow-sm relative overflow-hidden"
          >
            <CardContent className="p-5 relative z-10">
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <card.icon className={`h-4 w-4 ${card.accent}`} />
                </div>
                <div className="min-w-0 flex-1">
                  {metricsLoading ? (
                    <div className="mb-1 h-6 w-16 animate-pulse rounded bg-slate-200" />
                  ) : (
                    <p className={`text-xl font-bold leading-tight ${card.accent}`}>
                      {card.value}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 leading-snug">
                    {card.label}
                  </p>
                </div>
              </div>
              {/* Sparkline decoration on total card */}
              {card.sparkline && (
                <svg
                  className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.08] pointer-events-none z-0"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 100"
                >
                  <path
                    d="M0,100 L0,92 L8,80 L12,88 L20,65 L28,75 L36,50 L42,62 L50,38 L58,52 L66,28 L74,42 L80,20 L88,32 L95,12 L100,18 L100,100 Z"
                    fill="#dc2626"
                  />
                  <polyline
                    points="0,92 8,80 12,88 20,65 28,75 36,50 42,62 50,38 58,52 66,28 74,42 80,20 88,32 95,12 100,18"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                  />
                </svg>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Metrics Error ── */}
      {metricsError && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {metricsError}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ticket, title, area..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Pending</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Row count */}
        {!tableLoading && (
          <span className="ml-auto text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">{filtered.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">{complaints.length}</span>{" "}
            complaint{complaints.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Table Error ── */}
      {tableError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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

      {/* ── Complaints Table ── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
          <h3 className="text-sm font-bold text-slate-800">Complaints Register</h3>
          {tableLoading && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-4 py-3 whitespace-nowrap">Complaint ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Category</th>
                <th className="px-4 py-3 min-w-[220px]">Complaint Details</th>
                <th className="px-4 py-3 whitespace-nowrap">Area / District</th>
                <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Assigned Officer</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText className="h-8 w-8 opacity-40" />
                      <p className="text-sm font-medium">No complaints match your filters</p>
                      <p className="text-xs">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const catCfg = getCategoryConfig(
                    c.categories?.name ?? null,
                    c.categories?.department ?? null
                  );
                  const CatIcon = catCfg.icon;
                  const isResolved = c.status === "resolved";

                  return (
                    <tr
                      key={c.id}
                      onClick={() => openManageModal(c)}
                      className={`border-b border-slate-100 transition-colors cursor-pointer hover:bg-slate-50 ${isResolved ? "bg-emerald-50/30" : ""}`}
                    >
                      {/* Complaint ID */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[12px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          #{(c.ticket_id || c.id).substring(0, 8).toUpperCase()}
                        </span>
                      </td>

                      {/* Category + SVG Icon */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${catCfg.bg}`}>
                            <CatIcon className={`h-3.5 w-3.5 ${catCfg.text}`} />
                          </span>
                          <span className="text-xs font-semibold text-slate-700 leading-tight">
                            {catCfg.label}
                          </span>
                        </div>
                      </td>

                      {/* Complaint Details */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900 text-sm leading-snug line-clamp-2 max-w-[280px]">
                          {c.title || "Complaint reported"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {formatReportedOn(c.created_at)}
                        </p>
                      </td>

                      {/* Area / District */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-slate-700">
                          {c.city || "Delhi"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5">
                        <PriorityBadge severity={c.severity} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Assigned Officer */}
                      <td className="px-4 py-3.5">
                        {c.profiles?.full_name ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-snug">
                              {c.profiles.full_name}
                            </p>
                            {c.profiles.role ? (
                              <p className="text-[11px] text-slate-400 leading-snug">
                                {c.profiles.role}
                              </p>
                            ) : c.categories?.department ? (
                              <p className="text-[11px] text-slate-400 leading-snug">
                                {c.categories.department}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <UserX className="h-3.5 w-3.5" />
                            <span className="text-xs italic">Unassigned</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!tableLoading && filtered.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-2.5">
            <p className="text-[11px] text-slate-400">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} •{" "}
              Click any row to manage a complaint
            </p>
          </div>
        )}
      </div>

      {/* ── Manage Complaint Modal ── */}
      <ManageComplaintModal
        complaint={selectedComplaint}
        open={modalOpen}
        onClose={closeModal}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
