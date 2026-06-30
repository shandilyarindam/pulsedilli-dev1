"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { ticketId, timeAgo } from "@/lib/constants";

interface RawComplaint {
 id: string;
 summary: string | null;
 category: string | null;
 status: string | null;
 urgency: string | null;
 location: string | null;
 ward: string | null;
 assigned_to: string | null;
 assigned_at: string | null;
 resolved_at: string | null;
 timestamp: string | null;
}

function initials(name: string): string {
 const parts = name.split(" ");
 return (parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
}

function urgencyBadgeColor(u: string | null): string {
 const v = (u || "").split("(")[0].trim();
 if (v === "Critical") return "bg-red-500 text-[var(--btn-primary-fg)]";
 if (v === "High") return "bg-orange-500 text-[var(--btn-primary-fg)]";
 if (v === "Medium") return "bg-yellow-500 text-[var(--btn-primary-fg)]";
 return "bg-[var(--skeleton)] text-[var(--text-secondary)]";
}

function urgencyLabel(u: string | null): string {
 const v = (u || "").split("(")[0].trim();
 if (v === "Critical") return "URGENT";
 if (v === "High") return "HIGH";
 if (v === "Medium") return "MED";
 return "LOW";
}

export default function TimelinePage() {
 const [allComplaints, setAllComplaints] = useState<RawComplaint[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchOfficer, setSearchOfficer] = useState("");
 const [filterUrgency, setFilterUrgency] = useState("ALL");

 const fetchData = useCallback(async () => {
 try {
 const { data } = await supabase
 .from("complaints")
 .select("id,ticket_id,title,status,severity,city,assigned_officer_id,created_at,resolved_at")
 .order("created_at", { ascending: false })
 .limit(200);
 setAllComplaints((data || []) as RawComplaint[]);
 } catch (err) {
 console.error("Failed to fetch data for timeline", err);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const timelineEntries = allComplaints
 .filter((c) => c.assigned_to && (c.assigned_at || c.resolved_at))
 .flatMap((c) => {
 const entries: { type: "assigned" | "resolved"; complaint: RawComplaint; time: string }[] = [];
 if (c.assigned_at) entries.push({ type: "assigned", complaint: c, time: c.assigned_at });
 if (c.status === "resolved" && c.resolved_at) entries.push({ type: "resolved", complaint: c, time: c.resolved_at });
 return entries;
 })
 .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
 .slice(0, 100);

 return (
 <div className="p-4 md:p-6 lg:p-8">
 <div className="flex justify-between items-start gap-4 mb-4 md:mb-6">
 <div>
 <h1 className="mb-1 text-xl font-bold text-[var(--brand)] md:text-2xl">
 System Activity Timeline
 </h1>
 <p className="text-xs text-[var(--text-secondary)] md:text-sm">
 Chronological record of complaint assignments and resolutions across all departments
 </p>
 </div>
 </div>

 <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
 <input
 type="text"
 placeholder="Search by Officer Name..."
 value={searchOfficer}
 onChange={(e) => setSearchOfficer(e.target.value)}
 className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none sm:max-w-xs"
 />
 <select
 value={filterUrgency}
 onChange={(e) => setFilterUrgency(e.target.value)}
 className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none sm:max-w-xs"
 >
 <option value="ALL">All Urgencies</option>
 <option value="CRITICAL">Critical</option>
 <option value="HIGH">High</option>
 <option value="MEDIUM">Medium</option>
 <option value="LOW">Low</option>
 </select>
 </div>

 <Card className="border border-[var(--border-color)] bg-[var(--surface)] shadow-sm">
 <CardContent className="p-4 md:p-6">
 {loading ? (
 <div className="space-y-4">
 {Array.from({ length: 10 }).map((_, i) => (
 <div key={i} className="h-12 animate-pulse rounded bg-[var(--skeleton)]" />
 ))}
 </div>
 ) : timelineEntries.length === 0 ? (
 <p className="py-8 text-center text-sm text-[var(--text-muted)]">No recent activity</p>
 ) : (
 <div className="relative">
 {/* Vertical connector line */}
 <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--skeleton)]" />

 <div className="space-y-0">
 {timelineEntries
 .filter((entry) => {
 const c = entry.complaint;
 const officerMatch = !searchOfficer || (c.assigned_to && c.assigned_to.toLowerCase().includes(searchOfficer.toLowerCase()));
 const urgencyMatch = filterUrgency === "ALL" || (c.urgency && c.urgency.toUpperCase().includes(filterUrgency));
 return officerMatch && urgencyMatch;
 })
 .map((entry, idx) => {
 const c = entry.complaint;
 const officerName = c.assigned_to || "Unknown";
 const isResolved = entry.type === "resolved";

 return (
 <div key={`${c.id}-${entry.type}-${idx}`} className="relative flex gap-4 py-3">
 {/* Avatar */}
 <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-[var(--btn-primary-fg)] ${isResolved ? "bg-emerald-600" : "bg-blue-600"}`}>
 {initials(officerName)}
 </div>

 {/* Content */}
 <div className="min-w-0 flex-1 pt-0.5">
 <p className="text-sm text-[var(--text-primary)]">
 <span className="font-semibold">{officerName}</span>
 {isResolved ? " resolved " : " was assigned "}
 complaint{" "}
 <span className="font-mono font-semibold text-[var(--brand)]">
 #{ticketId(c.id)}
 </span>
 <Badge className={`ml-2 text-[10px] ${urgencyBadgeColor(c.urgency)}`}>
 {urgencyLabel(c.urgency)}
 </Badge>
 {" -- "}
 <span className="text-[var(--text-secondary)]">{c.category || "Uncategorized"}</span>
 {c.location && (
 <span className="text-[var(--text-muted)]"> in {c.location}</span>
 )}
 </p>
 <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
 <Clock className="h-3 w-3" />
 {timeAgo(entry.time)}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
