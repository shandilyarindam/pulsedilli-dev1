"use client";

import { useEffect, useState } from "react";
import { Info, Smile, ArrowUp, Loader2 } from "lucide-react";
import {
 LineChart,
 Line,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell,
} from "recharts";
import { getExecutiveCharts } from "@/services/complaints";

const BAR_COLORS = [
 "#1a56db",
 "#3f83f8",
 "#0e9f6e",
 "#ff8a4c",
 "#ff5a1f",
 "#9061f9",
 "#c084fc",
 "#f59e0b",
];

/* ── Seeded 30-day mock data for Complaint Trend (Jun 2 – Jun 30) ── */
const TREND_DATA = (() => {
  // Deterministic pseudo-random so the chart looks the same on every render
  const seed = (n: number) => {
    const x = Math.sin(n + 7) * 43758.5453;
    return x - Math.floor(x);
  };
  const seed2 = (n: number) => {
    const x = Math.sin(n * 2 + 13) * 67891.1234;
    return x - Math.floor(x);
  };
  const startDate = new Date("2026-06-02");
  return Array.from({ length: 29 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    // Sharp spiky zig-zag for reports between 80 and 250
    const reports = Math.round(80 + seed(i * 3 + 1) * 170);
    // Resolved runs roughly parallel but slightly below reports (offset ~15–55)
    const resolvedOffset = Math.round(15 + seed2(i * 5 + 3) * 40);
    const resolved = Math.max(10, reports - resolvedOffset);
    return { date: label, reports, resolved };
  });
})();

export default function AnalyticsPage() {
 const [isLoading, setIsLoading] = useState(true);
 const [complaintsPerDay, setComplaintsPerDay] = useState<
 { date: string; received: number; resolved: number }[]
 >([]);
 const [complaintsByDepartment, setComplaintsByDepartment] = useState<
 { department: string; count: number }[]
 >([]);

 useEffect(() => {
 const fetchCharts = async () => {
 setIsLoading(true);
 try {
 const charts = await getExecutiveCharts();
 if (charts.complaintsPerDay && charts.complaintsPerDay.length > 0) {
 // Format date labels to be shorter (e.g., "Jun 28")
 const formatted = charts.complaintsPerDay.map((d) => ({
 ...d,
 date: new Date(d.date).toLocaleDateString("en-GB", {
 day: "2-digit",
 month: "short",
 }),
 }));
 setComplaintsPerDay(formatted);
 }
 if (
 charts.complaintsByDepartment &&
 charts.complaintsByDepartment.length > 0
 ) {
 setComplaintsByDepartment(charts.complaintsByDepartment);
 }
 } catch (err) {
 console.error("Error fetching executive charts:", err);
 } finally {
 setIsLoading(false);
 }
 };
 fetchCharts();
 }, []);

 return (
 <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-gray-50 [#0a0a0a] text-gray-900">
 <div className="max-w-7xl mx-auto space-y-6">

 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 ">
 Executive Oversight
 </h1>
 <p className="text-sm text-gray-500 mt-1">
 Performance &amp; Resolution Metrics
 </p>
 </div>
 </div>

 {/* Top Row: Charts */}
 {isLoading ? (
 <div className="flex justify-center items-center h-72 w-full bg-white border border-gray-200 rounded-xl shadow-sm">
 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
 <span className="ml-3 text-sm text-gray-500">
 Loading chart data…
 </span>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Complaint Trend Over Time — Dual-series LineChart */}
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
   <div className="flex justify-between items-center mb-5">
     <div className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
       Complaint Trend Over Time
       <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
     </div>
     <div className="flex items-center gap-4">
       <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
         <span className="inline-block w-3 h-0.5 bg-[#DC2626] rounded" />
         Reports
       </span>
       <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
         <span className="inline-block w-3 h-0.5 bg-[#2563EB] rounded" />
         Resolved
       </span>
       <span className="text-xs font-medium text-gray-400">Jun 2 – Jun 30, 2026</span>
     </div>
   </div>
   <ResponsiveContainer width="100%" height={280}>
     <LineChart
       data={TREND_DATA}
       margin={{ top: 8, right: 16, left: 0, bottom: 5 }}
     >
       <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
       <XAxis
         dataKey="date"
         tick={{ fontSize: 11, fill: "#6b7280" }}
         axisLine={false}
         tickLine={false}
         interval={3}
       />
       <YAxis
         tick={{ fontSize: 11, fill: "#6b7280" }}
         axisLine={false}
         tickLine={false}
         allowDecimals={false}
         domain={[0, 280]}
         width={36}
       />
       <Tooltip
         contentStyle={{
           borderRadius: "8px",
           border: "1px solid #e5e7eb",
           background: "#ffffff",
           fontSize: "12px",
           color: "#374151",
           boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
         }}
         labelStyle={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}
       />
       <Line
         type="linear"
         dataKey="reports"
         name="Reports"
         stroke="#DC2626"
         strokeWidth={2}
         dot={{ r: 3, fill: "#DC2626", stroke: "#fff", strokeWidth: 1.5 }}
         activeDot={{ r: 5.5, fill: "#DC2626", stroke: "#fff", strokeWidth: 2 }}
         isAnimationActive={true}
       />
       <Line
         type="linear"
         dataKey="resolved"
         name="Resolved"
         stroke="#2563EB"
         strokeWidth={2}
         dot={{ r: 3, fill: "#2563EB", stroke: "#fff", strokeWidth: 1.5 }}
         activeDot={{ r: 5.5, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
         isAnimationActive={true}
       />
     </LineChart>
   </ResponsiveContainer>
  </div>

 {/* Complaints By Category — BarChart */}
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
 <div className="flex justify-between items-center mb-5">
 <div className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
 Complaints By Category
 <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
 </div>
 <a
 href="#"
 className="text-sm text-blue-600 font-medium hover:underline"
 >
 View All
 </a>
 </div>
 <ResponsiveContainer width="100%" height={280}>
 <BarChart
 data={complaintsByDepartment}
 layout="vertical"
 margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
 >
 <CartesianGrid
 strokeDasharray="4 4"
 stroke="#f3f4f6"
 horizontal={false}
 />
 <XAxis
 type="number"
 tick={{ fontSize: 11, fill: "#6b7280" }}
 axisLine={false}
 tickLine={false}
 allowDecimals={false}
 />
 <YAxis
 type="category"
 dataKey="department"
 tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
 axisLine={false}
 tickLine={false}
 width={110}
 />
 <Tooltip
 contentStyle={{
 borderRadius: "8px",
 border: "1px solid #e5e7eb",
 fontSize: "12px",
 }}
 cursor={{ fill: "#f9fafb" }}
 />
 <Bar dataKey="count" name="Complaints" radius={[0, 4, 4, 0]}>
 {complaintsByDepartment.map((_, idx) => (
 <Cell
 key={`cell-${idx}`}
 fill={BAR_COLORS[idx % BAR_COLORS.length]}
 />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 )}

 {/* Middle Row: Performance Tables */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Department Performance */}
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
 <div className="flex justify-between items-center mb-5">
 <div className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
 Department Performance
 <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
 </div>
 <a
 href="#"
 className="text-sm text-blue-600 font-medium hover:underline"
 >
 View All
 </a>
 </div>
 <div className="overflow-x-auto flex-grow">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Department
 </th>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Resolved
 </th>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Pending
 </th>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Efficiency Score
 </th>
 </tr>
 </thead>
 <tbody>
 <tr>
 <td className="py-4 text-sm text-gray-700 border-b border-gray-50 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}
 Water
 </td>
 <td className="py-4 text-sm font-medium border-b border-gray-50 ">
 92%
 </td>
 <td className="py-4 text-sm text-gray-500 border-b border-gray-50 ">
 8%
 </td>
 <td className="py-4 border-b border-gray-50 ">
 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 ">
 Excellent
 </span>
 </td>
 </tr>
 <tr>
 <td className="py-4 text-sm text-gray-700 border-b border-gray-50 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-amber-500"></div>{" "}
 Electricity
 </td>
 <td className="py-4 text-sm font-medium border-b border-gray-50 ">
 88%
 </td>
 <td className="py-4 text-sm text-gray-500 border-b border-gray-50 ">
 12%
 </td>
 <td className="py-4 border-b border-gray-50 ">
 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 ">
 Good
 </span>
 </td>
 </tr>
 <tr>
 <td className="py-4 text-sm text-gray-700 border-b border-gray-50 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-gray-600"></div>{" "}
 Roads
 </td>
 <td className="py-4 text-sm font-medium border-b border-gray-50 ">
 74%
 </td>
 <td className="py-4 text-sm text-gray-500 border-b border-gray-50 ">
 26%
 </td>
 <td className="py-4 border-b border-gray-50 ">
 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ">
 Average
 </span>
 </td>
 </tr>
 <tr>
 <td className="py-4 text-sm text-gray-700 border-b border-gray-50 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
 Sanitation
 </td>
 <td className="py-4 text-sm font-medium border-b border-gray-50 ">
 58%
 </td>
 <td className="py-4 text-sm text-gray-500 border-b border-gray-50 ">
 42%
 </td>
 <td className="py-4 border-b border-gray-50 ">
 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 ">
 Poor
 </span>
 </td>
 </tr>
 <tr>
 <td className="py-4 text-sm text-gray-700 flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-indigo-500"></div>{" "}
 Traffic Police
 </td>
 <td className="py-4 text-sm font-medium">76%</td>
 <td className="py-4 text-sm text-gray-500">24%</td>
 <td className="py-4">
 <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 ">
 Average
 </span>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* DISTRICT PERFORMANCE */}
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
 <div className="flex justify-between items-center mb-5">
 <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
 DISTRICT PERFORMANCE
 </div>
 <a
 href="#"
 className="text-sm text-blue-600 font-medium hover:underline"
 >
 View All
 </a>
 </div>
 <div className="overflow-x-auto flex-grow">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Rank
 </th>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Area
 </th>
 <th className="text-xs font-semibold text-gray-500 pb-4 border-b border-gray-200 ">
 Resolution Rate
 </th>
 </tr>
 </thead>
 <tbody>
 {[
 { name: "New Delhi", rate: 91 },
 { name: "South Delhi", rate: 85 },
 { name: "Central Delhi", rate: 79 },
 { name: "North Delhi", rate: 72 },
 { name: "East Delhi", rate: 65 },
 ].map((area, idx) => (
 <tr key={idx}>
 <td className="py-4 text-sm font-bold text-gray-400 border-b border-gray-50 ">
 {idx + 1}
 </td>
 <td className="py-4 text-sm font-medium border-b border-gray-50 ">
 {area.name}
 </td>
 <td className="py-4 w-40 border-b border-gray-50 ">
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold">
 {area.rate}%
 </span>
 <div className="bg-gray-200 rounded-full h-2 w-full overflow-hidden">
 <div
 className={`h-full rounded-full ${
 area.rate > 80
 ? "bg-emerald-500"
 : area.rate > 60
 ? "bg-amber-500"
 : "bg-red-500"
 }`}
 style={{ width: `${area.rate}%` }}
 ></div>
 </div>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>

 {/* Bottom Row: Resolution & Satisfaction */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
 {/* Resolution Time Analytics */}
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
 <div className="flex justify-between items-center mb-5">
 <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">
 Resolution Time Analytics
 </div>
 <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
 <option>Average Resolution Time</option>
 <option>Median Resolution Time</option>
 </select>
 </div>
 <div className="flex-grow flex flex-col justify-center space-y-6 mt-4">
 {[
 { dept: "Power Department", days: 0.8, pct: 15, color: "bg-emerald-500" },
 { dept: "Water Department", days: 1.2, pct: 25, color: "bg-blue-500" },
 { dept: "MCD (Sanitation)", days: 2.1, pct: 45, color: "bg-purple-500" },
 { dept: "Transport Department", days: 3.7, pct: 65, color: "bg-amber-500" },
 { dept: "PWD (Roads)", days: 4.3, pct: 80, color: "bg-red-500" },
 ].map((item) => (
 <div key={item.dept} className="flex items-center justify-between">
 <div className="w-1/3 text-sm font-medium text-gray-700 ">
 {item.dept}
 </div>
 <div className="w-1/2 px-4">
 <div className="bg-gray-200 rounded-full h-2 w-full overflow-hidden">
 <div
 className={`${item.color} h-full rounded-full`}
 style={{ width: `${item.pct}%` }}
 ></div>
 </div>
 </div>
 <div className="w-1/6 text-right text-sm font-bold text-gray-900 ">
 {item.days} days
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Satisfaction Trend */}
 <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
 {/* KPI Section */}
 <div className="md:col-span-2 flex flex-col justify-center border-t md:border-t-0 md:border-r border-gray-100 pt-4 md:pt-0 md:pr-6">
 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
 Overall Satisfaction
 </h3>
 <div className="flex items-end gap-3 mb-1">
 <span className="text-4xl font-bold text-emerald-600 ">
 92%
 </span>
 <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
 <Smile className="w-4 h-4" /> Excellent
 </span>
 </div>
 <p className="text-xs text-gray-500 mb-6 flex items-center gap-1">
 <ArrowUp className="w-3 h-3 text-emerald-500" />
 <span className="text-emerald-500 font-medium">4%</span> vs
 last 7 days
 </p>

 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
 Breakdown
 </h3>
 <div className="space-y-2">
 {[
 { label: "Very Satisfied", pct: "38%", color: "bg-emerald-500" },
 { label: "Satisfied", pct: "54%", color: "bg-emerald-400" },
 { label: "Neutral", pct: "6%", color: "bg-amber-400" },
 { label: "Unsatisfied", pct: "2%", color: "bg-red-400" },
 ].map((item) => (
 <div
 key={item.label}
 className="flex justify-between items-center text-sm"
 >
 <div className="flex items-center gap-2 text-gray-700 ">
 <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
 {item.label}
 </div>
 <span className="font-semibold text-gray-700 ">
 {item.pct}
 </span>
 </div>
 ))}
 </div>
 </div>

 {/* Satisfaction Bar Chart */}
 <div className="md:col-span-3 flex flex-col">
 <div className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2 mb-4">
 User Satisfaction Trend
 <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
 </div>
 <ResponsiveContainer width="100%" height={200}>
 <BarChart
 data={[
 { month: "Jan", score: 74 },
 { month: "Feb", score: 76 },
 { month: "Mar", score: 80 },
 { month: "Apr", score: 84 },
 { month: "May", score: 88 },
 { month: "Jun", score: 92 },
 ]}
 margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
 >
 <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
 <XAxis
 dataKey="month"
 tick={{ fontSize: 11, fill: "#6b7280" }}
 axisLine={false}
 tickLine={false}
 />
 <YAxis
 domain={[60, 100]}
 tick={{ fontSize: 11, fill: "#6b7280" }}
 axisLine={false}
 tickLine={false}
 tickFormatter={(v) => `${v}%`}
 />
 <Tooltip
 contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
 formatter={(v) => [`${v}%`, "Score"]}
 />
 <Bar dataKey="score" name="Satisfaction" radius={[4, 4, 0, 0]} fill="#0e9f6e" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
