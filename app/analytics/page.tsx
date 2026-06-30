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
  Legend,
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
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Executive Oversight
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Performance &amp; Resolution Metrics
            </p>
          </div>
        </div>

        {/* Top Row: Charts */}
        {isLoading ? (
          <div className="flex justify-center items-center h-72 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">
              Loading chart data…
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaint Trend Over Time — LineChart */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                  Complaint Trend Over Time
                  <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={complaintsPerDay}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="received"
                    name="Received"
                    stroke="#1a56db"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#0e9f6e"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Complaints By Category — BarChart */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
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
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Department
                    </th>
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Resolved
                    </th>
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Pending
                    </th>
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Efficiency Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}
                      Water
                    </td>
                    <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">
                      92%
                    </td>
                    <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">
                      8%
                    </td>
                    <td className="py-4 border-b border-gray-50 dark:border-gray-800/50">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Excellent
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>{" "}
                      Electricity
                    </td>
                    <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">
                      88%
                    </td>
                    <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">
                      12%
                    </td>
                    <td className="py-4 border-b border-gray-50 dark:border-gray-800/50">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Good
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-600"></div>{" "}
                      Roads
                    </td>
                    <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">
                      74%
                    </td>
                    <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">
                      26%
                    </td>
                    <td className="py-4 border-b border-gray-50 dark:border-gray-800/50">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Average
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                      Sanitation
                    </td>
                    <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">
                      58%
                    </td>
                    <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">
                      42%
                    </td>
                    <td className="py-4 border-b border-gray-50 dark:border-gray-800/50">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Poor
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>{" "}
                      Traffic Police
                    </td>
                    <td className="py-4 text-sm font-medium">76%</td>
                    <td className="py-4 text-sm text-gray-500">24%</td>
                    <td className="py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Average
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Area-wise Performance */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Area-wise Performance
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
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Rank
                    </th>
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                      Area
                    </th>
                    <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
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
                      <td className="py-4 text-sm font-bold text-gray-400 border-b border-gray-50 dark:border-gray-800/50">
                        {idx + 1}
                      </td>
                      <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">
                        {area.name}
                      </td>
                      <td className="py-4 w-40 border-b border-gray-50 dark:border-gray-800/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            {area.rate}%
                          </span>
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Resolution Time Analytics
              </div>
              <select className="text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
                  <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.dept}
                  </div>
                  <div className="w-1/2 px-4">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full`}
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-1/6 text-right text-sm font-bold text-gray-900 dark:text-gray-100">
                    {item.days} days
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Satisfaction Trend */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* KPI Section */}
            <div className="md:col-span-2 flex flex-col justify-center border-t md:border-t-0 md:border-r border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pr-6">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Overall Satisfaction
              </h3>
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-500">
                  92%
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded">
                  <Smile className="w-4 h-4" /> Excellent
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1">
                <ArrowUp className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500 font-medium">4%</span> vs
                last 7 days
              </p>

              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
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
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                      {item.label}
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {item.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Satisfaction Bar Chart */}
            <div className="md:col-span-3 flex flex-col">
              <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2 mb-4">
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
