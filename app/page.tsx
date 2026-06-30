"use client";

import { useEffect, useState } from "react";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
 AlertCircle,
 CheckCircle,
 Users,
 AlertTriangle,
 Smile,
 Zap,
 Droplet,
 TrendingUp,
 ClipboardList,
 Hourglass,
 Shield,
 MapPin,
 ChevronDown,
 Info,
 ArrowUpRight,
 ArrowRight,
 Plus,
 Minus,
 Target,
 FileText,
 Road,
 HardHat,
 Sparkles,
 X,
 Loader2,
 Maximize2,
} from "lucide-react";
import Map, { Source, Layer, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CMMap from "@/components/cm-map";
import UserProfile from "@/components/user-profile";
import { supabase } from "@/lib/supabase";

const delhiBoundaryData = {
 type: "FeatureCollection",
 features: [
 {
 type: "Feature",
 properties: {},
 geometry: {
 type: "Polygon",
 coordinates: [
 [
 [76.838, 28.404],
 [77.348, 28.404],
 [77.348, 28.883],
 [76.838, 28.883],
 [76.838, 28.404]
 ]
 ]
 }
 }
 ]
};

const complaintPointsData = {
 type: "FeatureCollection",
 features: [
 { type: "Feature", properties: { priority: "high" }, geometry: { type: "Point", coordinates: [77.1025, 28.7041] } },
 { type: "Feature", properties: { priority: "high" }, geometry: { type: "Point", coordinates: [77.2090, 28.6139] } },
 { type: "Feature", properties: { priority: "medium" }, geometry: { type: "Point", coordinates: [77.0697, 28.5355] } },
 { type: "Feature", properties: { priority: "low" }, geometry: { type: "Point", coordinates: [77.3000, 28.6300] } },
 ]
};

export default function DashboardPage() {
 const router = useRouter();
 const [time, setTime] = useState("");
 const [healthScore, setHealthScore] = useState<number | null>(null);
 const [satisfaction, setSatisfaction] = useState<number | null>(null);
 
 const [backlog, setBacklog] = useState<any[]>([]);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
 const [interventionComment, setInterventionComment] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);

 useEffect(() => {
 if (typeof window !== 'undefined') {
 (window as any).openModal = (issue: any) => {
 setSelectedComplaint(issue);
 setIsModalOpen(true);
 };
 }
 }, []);

 const [pendingCount, setPendingCount] = useState<number>(0);
 const [resolvedCount, setResolvedCount] = useState<number>(0);
 const [criticalCount, setCriticalCount] = useState<number>(0);
 const [totalCount, setTotalCount] = useState<number>(0);

 useEffect(() => {
   async function fetchMetrics() {
   // ── Step 1: Fetch aggregate KPI metrics (critical path) ──
   try {
     const { getAggregateMetrics } = await import('@/services/complaints');
     const aggMetrics = await getAggregateMetrics();

     if (aggMetrics) {
       setPendingCount(aggMetrics.pending);
       setResolvedCount(aggMetrics.resolved);
       setCriticalCount(aggMetrics.critical);

       const total = aggMetrics.total || (aggMetrics.pending + aggMetrics.resolved);
       setTotalCount(total);

       if (total > 0) {
         setSatisfaction(Math.round((aggMetrics.resolved / total) * 100));
       } else {
         setSatisfaction(0);
       }

       setHealthScore(Math.max(0, Math.round(100 - (aggMetrics.critical * 0.5) - (aggMetrics.pending * 0.1))));
     } else {
       // Supabase returned nothing — unblock spinner with safe defaults
       setSatisfaction(0);
       setHealthScore(78);
     }
   } catch (err) {
     console.error("Error fetching aggregate metrics:", err);
     // Ensure spinners are not stuck forever
     setSatisfaction(0);
     setHealthScore(78);
   }

   // ── Step 2: Fetch priority interventions (non-critical) ──
   try {
     const { getPriorityInterventions } = await import('@/services/complaints');
     const interventions = await getPriorityInterventions();

     if (interventions && interventions.length > 0) {
       setBacklog(interventions.map((item) => ({
         id: item.id,
         summary: item.title || 'Critical issue pending resolution',
         location: item.city || 'Delhi',
         urgency: 'Critical',
       })));
     }
   } catch (err) {
     // Non-fatal: priority interventions panel stays empty (mock list was previously shown)
     console.warn("Priority interventions fetch failed (column may not exist):", err);
   }
   }
   fetchMetrics();
   }, []);

 const [currentTime, setCurrentTime] = useState<Date | null>(null);
 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(new Date()), 60000);
 setCurrentTime(new Date());
 return () => clearInterval(timer);
 }, []);

 let greeting = 'Good Morning, Chief Minister';
 if (currentTime) {
 const h = currentTime.getHours();
 if (h >= 12 && h < 17) greeting = 'Good Afternoon, Chief Minister';
 else if (h >= 17 || h < 5) greeting = 'Good Evening, Chief Minister';
 }

 const formattedDate = currentTime ? currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ') : '...';
 const formattedTime = currentTime ? currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '...';

 return (
 <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] p-4 lg:p-5 font-sans text-[#0F172A] gap-4">
 {/* 1. Header Section */}
 <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A]">{greeting}</h1>
 <p className="mt-1 text-xs font-medium text-[#64748B]">
 Here's what's happening in Delhi today.
 </p>
 </div>
 
 <div className="flex items-center gap-4">
 {/* Profile */}
 <UserProfile />
 </div>
 </header>

 {/* 2. Top Metric Cards (KPI) */}
 <div className="shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
 {/* Card 1 */}
 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
 <CardContent className="p-2 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center shrink-0 shadow-sm">
 <ClipboardList className="h-5 w-5 text-white" />
 </div>
 <div className="flex flex-col">
 <p className="text-[10px] font-bold text-[#64748B] tracking-wide uppercase">TOTAL COMPLAINTS</p>
 <h3 className="text-lg font-black text-[#0F172A] leading-none mt-1">{totalCount.toLocaleString()}</h3>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[#22C55E] flex items-center gap-1 mt-auto">
 ↑ 8.7% vs last 7 days
 </p>
 </CardContent>
 </Card>

 {/* Card 2 */}
 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
 <CardContent className="p-2 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-9 w-9 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0 shadow-sm">
 <CheckCircle className="h-5 w-5 text-white" />
 </div>
 <div className="flex flex-col">
 <p className="text-[10px] font-bold text-[#64748B] tracking-wide uppercase">RESOLVED</p>
 <h3 className="text-lg font-black text-[#0F172A] leading-none mt-1">{resolvedCount.toLocaleString()}</h3>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[#22C55E] flex items-center gap-1 mt-auto">
 ↑ 12.5% vs last 7 days
 </p>
 </CardContent>
 </Card>

 {/* Card 3 */}
 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
 <CardContent className="p-2 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-9 w-9 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0 shadow-sm">
 <Hourglass className="h-5 w-5 text-white" />
 </div>
 <div className="flex flex-col">
 <p className="text-[10px] font-bold text-[#64748B] tracking-wide uppercase">PENDING</p>
 <h3 className="text-lg font-black text-[#0F172A] leading-none mt-1">{pendingCount.toLocaleString()}</h3>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[#EF4444] flex items-center gap-1 mt-auto">
 ↓ 4.3% vs last 7 days
 </p>
 </CardContent>
 </Card>

 {/* Card 4 */}
 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
 <CardContent className="p-2 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-9 w-9 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0 shadow-sm">
 <AlertTriangle className="h-5 w-5 text-white" />
 </div>
 <div className="flex flex-col">
  <p className="text-[10px] font-bold text-[#64748B] tracking-wide uppercase">CRITICAL CASES</p>
  <h3 className="text-lg font-black text-[#0F172A] leading-none mt-1">42</h3>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[#EF4444] flex items-center gap-1 mt-auto">
 ↑ 5.1% vs last 7 days
 </p>
 </CardContent>
 </Card>

 {/* Card 5 */}
 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
 <CardContent className="p-2 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-9 w-9 rounded-full bg-[#7C3AED] flex items-center justify-center shrink-0 shadow-sm">
 <Shield className="h-5 w-5 text-white" />
 </div>
 <div className="flex flex-col">
  <p className="text-[10px] font-bold text-[#64748B] tracking-wide uppercase">DELHI HEALTH SCORE</p>
  <h3 className="text-lg font-black text-[#0F172A] leading-none mt-1 flex items-center gap-1">
  78 <span className="text-xs text-[#64748B] font-semibold">/100</span>
  </h3>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[#22C55E] flex items-center gap-1.5 mt-auto">
 <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Stable
 </p>
 </CardContent>
 </Card>

 {/* Card 6 */}
 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF]">
 <CardContent className="p-2 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-9 w-9 rounded-full bg-[#14B8A6] flex items-center justify-center shrink-0 shadow-sm">
 <Smile className="h-5 w-5 text-white" />
 </div>
 <div className="flex flex-col">
 <p className="text-[10px] font-bold text-[#64748B] tracking-wide uppercase">CITIZEN SATISFACTION</p>
 <h3 className="text-lg font-black text-[#0F172A] leading-none mt-1 flex items-center gap-1">
 {satisfaction !== null ? `${satisfaction}%` : <Loader2 className="w-4 h-4 animate-spin text-slate-400 inline" />}
 </h3>
 </div>
 </div>
 <p className="text-[11px] font-bold text-[#22C55E] flex items-center gap-1 mt-auto">
 ↑ 4% vs last 7 days
 </p>
 </CardContent>
 </Card>
 </div>

 {/* 3. Main Content (65/35 Split) */}
 <div className="flex-1 min-h-0 flex gap-4">
 
 {/* Left: DELHI MAP (65%) */}
 <div className="flex-[6.5] h-full overflow-hidden rounded-2xl border border-[#E8EDF5] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] bg-[#FFFFFF] flex flex-col">
 <div className="px-6 pt-4 pb-3 shrink-0 flex justify-between items-center">
 <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-wide">DELHI MAP</h2>
 <button 
 onClick={() => router.push('/map')}
 className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
 title="Open Full Map"
 >
 <Maximize2 className="h-5 w-5" />
 </button>
 </div>
 <div className="px-4 pb-4 flex-1 min-h-0">
 <div className="w-full h-full overflow-hidden rounded-xl border border-[#E8EDF5] relative">
 <CMMap previewMode={true} />
 </div>
 </div>
 </div>


 {/* Right: ACTION REQUIRED TODAY (35%) */}
 <Card className="flex-[3.5] h-full overflow-hidden rounded-2xl border border-[#E8EDF5] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] bg-[#FFFFFF] flex flex-col p-4">
 <div className="flex flex-row items-center justify-between pb-2 shrink-0">
 <h2 className="text-lg font-black text-[#0F172A] uppercase tracking-wide">
 PRIORITY INTERVENTIONS
 </h2>
 <button 
 onClick={() => router.push('/command-centre')}
 className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors" 
 title="Open Command Centre"
 >
 <ArrowUpRight className="w-4 h-4" />
 </button>
 </div>
 <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
 <div className="flex-1 flex flex-col overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200 gap-2 pr-2">
 
 {backlog.length > 0 ? backlog.map((issue) => (
 <div key={issue.id} className="flex flex-col bg-[#F8FAFC] rounded-xl px-4 py-3 transition-transform hover:-translate-y-0.5 border border-[#E8EDF5] shrink-0 gap-3">
 <div className="flex items-center">
 <div className="h-9 w-9 shrink-0 rounded-full bg-slate-800 flex items-center justify-center mr-3 shadow-sm">
 <AlertTriangle className="h-4 w-4 text-white" />
 </div>
 <div className="flex-1 min-w-0 mr-2">
 <p className="text-[13px] font-bold text-[#0F172A] truncate leading-snug">{issue.summary}</p>
 <div className="flex items-center gap-2 mt-0.5">
 <p className="text-[11px] font-semibold text-[#64748B] truncate">{issue.location || 'Delhi'}</p>
 <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 shadow-none border-none font-bold rounded px-1.5 py-0 leading-none h-4 text-[9px]">{issue.urgency}</Badge>
 </div>
 </div>
 </div>
 <button 
 onClick={() => {
   if (typeof window !== 'undefined' && (window as any).openModal) {
     (window as any).openModal(issue);
   }
 }}
 className="w-full text-[12px] font-bold text-[#0F172A] border border-[#E8EDF5] bg-white rounded-lg px-3 py-2 hover:bg-slate-50 transition-all shadow-sm"
 >
 Intervene
 </button>
 </div>
 )) : (
 <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400">
 No critical backlog issues found.
 </div>
 )}

 </div>
 </CardContent>
 </Card>
 </div>

 {/* 4. AI INSIGHTS */}
 <div className="shrink-0 flex flex-col gap-2">
 <div className="flex items-center justify-between px-2">
 <div className="flex items-center gap-3">
 <h2 className="text-lg font-black text-[#0F172A] tracking-wide">AI INSIGHTS</h2>
 <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#64748B]">
 Powered by <span className="text-red-600 font-bold flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Gemini</span>
 </div>
 </div>
 <a href="#" className="flex items-center gap-1 text-[13px] font-bold text-red-600 hover:text-red-800 transition-colors">
 View All Insights <ArrowRight className="h-3.5 w-3.5" />
 </a>
 </div>

 <Card className="rounded-2xl border border-[#E8EDF5] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-[#FFFFFF] overflow-hidden">
 <CardContent className="p-0 flex flex-row divide-x divide-gray-200">

 <div className="flex-1 p-3 flex items-start gap-2 hover:bg-slate-50 transition-colors">
 <div className="bg-[#FEF2F2] p-2 rounded-lg shrink-0">
 <TrendingUp className="h-4 w-4 text-[#EF4444]" />
 </div>
 <p className="text-[10px] text-[#64748B] leading-tight font-medium">
 Water complaints increased by <strong className="text-[#EF4444]">28%</strong> in North-East Delhi compared to last week.
 </p>
 </div>

 <div className="flex-1 p-3 flex items-start gap-2 hover:bg-slate-50 transition-colors">
 <div className="bg-red-50 p-2 rounded-lg shrink-0">
 <Droplet className="h-4 w-4 text-red-600" fill="currentColor" />
 </div>
 <p className="text-[10px] text-[#64748B] leading-tight font-medium">
 Water supply issues are the highest concern today (<strong className="text-[#0F172A]">37%</strong> of total complaints).
 </p>
 </div>

 <div className="flex-1 p-3 flex items-start gap-2 hover:bg-slate-50 transition-colors">
 <div className="bg-[#F8FAFC] p-2 rounded-lg shrink-0">
 <Road className="h-4 w-4 text-[#0F172A]" />
 </div>
 <p className="text-[10px] text-[#64748B] leading-tight font-medium">
 Roads Department has the highest unresolved backlog (<strong className="text-[#0F172A]">147 cases &gt; 7 days</strong>).
 </p>
 </div>

 <div className="flex-1 p-3 flex items-start gap-2 hover:bg-slate-50 transition-colors">
 <div className="bg-[#FFFBEB] p-2 rounded-lg shrink-0">
 <Zap className="h-4 w-4 text-[#F59E0B]" fill="currentColor" />
 </div>
 <p className="text-[10px] text-[#64748B] leading-tight font-medium">
 Power outage complaints reduced by <strong className="text-[#22C55E]">15%</strong> compared to last week.
 </p>
 </div>

 <div className="flex-1 p-3 flex items-start gap-2 hover:bg-slate-50 transition-colors">
 <div className="bg-[#F5F3FF] p-2 rounded-lg shrink-0">
 <Users className="h-4 w-4 text-[#7C3AED]" fill="currentColor" />
 </div>
 <p className="text-[10px] text-[#64748B] leading-tight font-medium">
 Women safety complaints increased by <strong className="text-[#0F172A]">12%</strong> in last 7 days.
 </p>
 </div>

 </CardContent>
 </Card>
 </div>
 
 {/* Modal Overlay */}
 {isModalOpen && selectedComplaint && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 ">
 <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 ">
 <div className="flex items-center gap-2">
 <AlertTriangle className="w-5 h-5 text-red-600" />
 <h2 className="text-base font-bold text-slate-900 ">Intervene: {selectedComplaint.id}</h2>
 </div>
 <button 
 onClick={() => setIsModalOpen(false)}
 className="text-slate-400 hover:text-slate-700 :text-slate-200 transition bg-white rounded-full p-1 border border-slate-200 "
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 <div className="p-6">
 <h3 className="text-sm font-semibold text-slate-800 mb-2">{selectedComplaint.summary}</h3>
 <p className="text-xs text-slate-500 mb-4">{selectedComplaint.location}</p>
 
 <label className="block text-sm font-semibold text-slate-700 mb-2">
 Intervention Comments
 </label>
 <textarea
 className="w-full h-28 p-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none text-slate-700 "
 placeholder="Enter directives or instructions..."
 value={interventionComment}
 onChange={(e) => setInterventionComment(e.target.value)}
 />
 </div>
 <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
 <button 
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
 >
 Cancel
 </button>
 <button 
 onClick={async () => {
 console.log("Submitting intervention for complaint_id:", selectedComplaint.id);
 setIsSubmitting(true);
 try {
 await supabase.from('complaints').update({ notes: interventionComment } as never).eq('id', selectedComplaint.id);
 setIsModalOpen(false);
 setInterventionComment("");
 
 // Optimistic update
 setBacklog(prev => prev.filter(c => c.id !== selectedComplaint.id));
 } catch (err) {
 console.error(err);
 } finally {
 setIsSubmitting(false);
 }
 }}
 disabled={isSubmitting || !interventionComment.trim()}
 className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
 Submit Intervention
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
}
