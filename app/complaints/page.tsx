"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Download,
  Loader2,
} from "lucide-react";
import {
  ticketId,
  dept,
  CATEGORIES,
  STATUS_COLOR,
  URGENCY_COLOR,
  shortUrgency,
  type Status,
  type Urgency,
  fmtDate,
} from "@/lib/constants";
import ManageComplaintModal, {
  type ManageComplaint,
} from "@/components/manage-complaint-modal";
import { getAggregateMetrics, getComplaintsList, type ComplaintListRow } from "@/services/complaints";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface KpiMetrics {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
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
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // ── Table state ──
  const [complaints, setComplaints] = useState<ManageComplaint[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Modal state ──
  const [selectedComplaint, setSelectedComplaint] =
    useState<ManageComplaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Fetch KPIs from getAggregateMetrics() ── */
  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const agg = await getAggregateMetrics();
      setMetrics({
        total: agg.total,
        pending: agg.submitted,       // "submitted" = awaiting triage
        inProgress: agg.inProgress,   // "in_progress" = being worked on
        resolved: agg.resolved,
      });
    } catch (err) {
      console.error("Failed to fetch aggregate metrics:", err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  /* ── Fetch rows from getComplaintsList() ── */
  const fetchComplaints = useCallback(async () => {
    setTableLoading(true);
    try {
      // Fetch up to 200 rows per page; pagination can be added later
      const res = await getComplaintsList(1, 200);

      const mapped: ManageComplaint[] = (res.data || []).map((c: ComplaintListRow) => ({
        // Use the friendly ticket_id; fall back to UUID
        id: c.ticket_id || c.id,
        summary: c.title ?? null,
        // categories is joined — pull .name for category label, .department for dept column
        category:
          c.categories?.name ||
          c.categories?.department ||
          "General",
        // Normalise DB statuses → UI statuses
        status:
          c.status === "in_progress"
            ? "assigned"
            : c.status === "submitted"
            ? "open"
            : c.status,
        // Capitalise severity for the Urgency badge
        urgency: c.severity
          ? c.severity.charAt(0).toUpperCase() + c.severity.slice(1)
          : "Low",
        timestamp: c.created_at,
        location: c.city || "Delhi",
        ward: null,
        // profiles is joined — pull .full_name for officer
        assigned_to: c.profiles?.full_name ?? null,
      }));

      setComplaints(mapped);
    } catch (err) {
      console.error("Failed to fetch complaints list:", err);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchComplaints();
  }, [fetchMetrics, fetchComplaints]);

  /* ── Filtering ── */
  const filtered = complaints.filter((c) => {
    if (catFilter !== "all" && c.category !== catFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  /* ── Modal helpers ── */
  function openManageModal(complaint: ManageComplaint) {
    setSelectedComplaint(complaint);
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
    const header = [
      "Ticket ID",
      "Category",
      "Department",
      "Urgency",
      "Location",
      "Summary",
      "Status",
      "Assigned To",
      "Date Received",
    ];
    const rows = filtered.map((c) => [
      ticketId(c.id),
      c.category || "",
      dept(c.category),
      shortUrgency(c.urgency),
      c.location || "",
      `"${(c.summary || "").replace(/"/g, '""')}"`,
      c.status || "open",
      c.assigned_to || "",
      c.timestamp ? fmtDate(c.timestamp) : "",
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
  const kpiCards = [
    {
      label: "Total Complaints",
      value: metrics.total,
      icon: FileText,
      accent: "text-[var(--brand)]",
      bg: "bg-blue-50",
    },
    {
      label: "Pending / Submitted",
      value: metrics.pending,
      icon: Clock,
      accent: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "In Progress",
      value: metrics.inProgress,
      icon: Search,
      accent: "text-[#2E7D9E]",
      bg: "bg-sky-50",
    },
    {
      label: "Resolved",
      value: metrics.resolved,
      icon: CheckCircle,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--brand)] dark:text-white md:text-2xl">
            Citizen Grievances
          </h1>
          <p className="text-xs text-[var(--text-secondary)] md:text-sm">
            Grievance Registry — live data from Supabase
          </p>
        </div>

        {/* Export button */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all hover:border-slate-300 hover:shadow-md"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--brand)]/5">
              <Download className="h-4 w-4 text-[var(--brand)]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--brand)]">
                Export CSV
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ── 4 KPI Cards ── */}
      <div className="mb-4 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mb-6 md:gap-4">
        {kpiCards.map((card) => (
          <Card
            key={card.label}
            className="border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg} ${card.accent}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                {metricsLoading ? (
                  <div className="mb-1 h-7 w-14 animate-pulse rounded bg-slate-200" />
                ) : (
                  <span className={`text-2xl font-bold ${card.accent}`}>
                    {card.value.toLocaleString()}
                  </span>
                )}
                <p className="text-xs text-[var(--text-secondary)]">
                  {card.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          value={catFilter}
          onValueChange={(v) => setCatFilter(v ?? "all")}
        >
          <SelectTrigger className="w-48 bg-[var(--surface)]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-40 bg-[var(--surface)]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="assigned">Assigned / In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>

        {/* Live row count */}
        {!tableLoading && (
          <span className="ml-auto text-xs text-[var(--text-muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--text-secondary)]">
              {filtered.length}
            </span>{" "}
            complaint{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Ticket ID</TableHead>
                <TableHead className="text-xs">Subject &amp; Summary</TableHead>
                <TableHead className="text-xs">Department</TableHead>
                <TableHead className="text-xs">Assigned Officer</TableHead>
                <TableHead className="text-xs">Urgency</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date Received</TableHead>
                <TableHead className="w-10 text-xs" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableLoading ? (
                /* Loading skeleton */
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="py-12 text-center text-sm text-[var(--text-muted)]">
                      No complaints match the selected filters.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-[var(--surface-elevated)]/50"
                  >
                    {/* Ticket ID */}
                    <TableCell className="font-mono text-xs font-medium text-[var(--text-primary)]">
                      {ticketId(c.id)}
                    </TableCell>

                    {/* Subject + category badge */}
                    <TableCell className="max-w-[260px]">
                      <p className="truncate text-sm text-[var(--text-primary)]">
                        {c.summary || "No summary"}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] text-[var(--text-secondary)]"
                      >
                        {c.category || "Uncategorized"}
                      </Badge>
                    </TableCell>

                    {/* Department — derived from categories.name via dept() */}
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {dept(c.category)}
                    </TableCell>

                    {/* Assigned officer — from profiles.full_name */}
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {c.assigned_to || (
                        <span className="italic text-slate-400">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Urgency badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          URGENCY_COLOR[
                            (shortUrgency(c.urgency) as Urgency) || "Low"
                          ]
                        }`}
                      >
                        {shortUrgency(c.urgency)}
                      </Badge>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${
                          STATUS_COLOR[(c.status as Status) || "open"]
                        }`}
                      >
                        {c.status || "open"}
                      </Badge>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {c.timestamp ? fmtDate(c.timestamp) : "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <button
                        onClick={() => openManageModal(c)}
                        className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--stat-bg)] hover:text-[var(--text-secondary)]"
                        title="Manage complaint"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
