"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { FileText, Search, AlertTriangle, MoreHorizontal, Download } from "lucide-react";
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

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<ManageComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal state
  const [selectedComplaint, setSelectedComplaint] =
    useState<ManageComplaint | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("raw_complaints")
        .select(
          "id,summary,category,status,urgency,timestamp,location,ward,assigned_to"
        )
        .order("timestamp", { ascending: false });
      if (error) throw error;
      setComplaints((data || []) as ManageComplaint[]);
    } catch {
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const filtered = complaints.filter((c) => {
    if (catFilter !== "all" && c.category !== catFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  const total = complaints.length;
  const underInvestigation = complaints.filter(
    (c) => c.status === "assigned"
  ).length;
  const highUrgency = complaints.filter((c) => {
    const urg = shortUrgency(c.urgency);
    return (urg === "High" || urg === "Critical") && c.status !== "resolved";
  }).length;

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
    fetchComplaints();
  }

  // ── Export CSV ──
  function exportCSV() {
    const header = [
      "Ticket ID",
      "Category",
      "Urgency",
      "Location",
      "Ward",
      "Summary",
      "Status",
      "Assigned To",
      "Date Received",
    ];
    const rows = filtered.map((c) => [
      ticketId(c.id),
      c.category || "",
      shortUrgency(c.urgency),
      c.location || "",
      c.ward || "",
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
    a.download = `Jan_Samadhan_Complaints_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    {
      label: "Total Grievances",
      value: total,
      icon: FileText,
      accent: "text-[var(--brand)]",
    },
    {
      label: "Under Investigation",
      value: underInvestigation,
      icon: Search,
      accent: "text-[#2E7D9E]",
    },
    {
      label: "High Urgency",
      value: highUrgency,
      icon: AlertTriangle,
      accent: "text-red-600",
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--brand)] dark:text-white md:text-2xl">
            Citizen Grievances
          </h1>
          <p className="text-xs text-[var(--text-secondary)] md:text-sm">
            Grievance Registry
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
                Export as PDF
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mb-6 md:gap-4">
        {statCards.map((c) => (
          <Card
            key={c.label}
            className="border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--stat-bg)] ${c.accent}`}
              >
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <div className="h-7 w-12 animate-pulse rounded bg-[var(--skeleton)]" />
                ) : (
                  <span className={`text-2xl font-bold ${c.accent}`}>
                    {c.value}
                  </span>
                )}
                <p className="text-xs text-[var(--text-secondary)]">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
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
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Complaint ID</TableHead>
                <TableHead className="text-xs">
                  Subject &amp; Narrative
                </TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Urgency</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Date Received</TableHead>
                <TableHead className="w-10 text-xs" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-20 animate-pulse rounded bg-[var(--skeleton)]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map((c) => (
                    <TableRow key={c.id} className="hover:bg-[var(--surface-elevated)]/50">
                      <TableCell className="font-mono text-xs font-medium text-[var(--text-primary)]">
                        {ticketId(c.id)}
                      </TableCell>
                      <TableCell className="max-w-[280px]">
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
                      <TableCell className="text-xs text-[var(--text-secondary)]">
                        {dept(c.category)}
                      </TableCell>
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
                      <TableCell className="text-xs text-[var(--text-secondary)]">
                        {c.timestamp ? fmtDate(c.timestamp) : "-"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => openManageModal(c)}
                          className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--stat-bg)] hover:text-[var(--text-secondary)]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
              No complaints match the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Shared Manage Complaint Modal ── */}
      <ManageComplaintModal
        complaint={selectedComplaint}
        open={modalOpen}
        onClose={closeModal}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
