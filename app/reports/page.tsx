"use client";

import React, { useState } from "react";
import { 
  FileText, Sparkles, 
  ArrowRight, Calendar, CalendarDays, CalendarRange, 
  Building2, Map as MapIcon, SlidersHorizontal, CheckSquare,
  Download, ArrowUpRight, ArrowDownRight,
  Plus, ChevronDown
} from "lucide-react";

export default function ReportsPage() {
  const [scheduledReports, setScheduledReports] = useState([
    { id: 1, name: "Daily Report", freq: "Every day at 08:00 AM", dest: "PDF to: cm.delhi@gov.in", active: true },
    { id: 2, name: "Weekly Report", freq: "Every Monday at 09:00 AM", dest: "PDF to: cm.delhi@gov.in", active: true },
    { id: 3, name: "Monthly Report", freq: "1st of every month at 10:00 AM", dest: "PDF to: cm.delhi@gov.in", active: true },
    { id: 4, name: "Department Performance Report", freq: "Every Friday at 06:00 PM", dest: "Excel to: principalsecretary@gov.in", active: false }
  ]);

  const toggleSchedule = (id: number) => {
    setScheduledReports(scheduledReports.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Generate, schedule and export official reports with AI insights</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
              <FileText className="w-4 h-4 text-red-500" /> Export as PDF
            </button>
          </div>
        </div>

        {/* AI Executive Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4">
            <Sparkles className="w-5 h-5" /> AI Executive Summary
          </div>
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Daily Governance Brief - 20 May 2025</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Today, 842 new complaints were registered across Delhi. Water Supply remains the top category with 28% of total complaints. Resolution rate improved by 4% compared to yesterday. East Delhi, North East Delhi and Shahdara districts require immediate attention due to rising waterlogging complaints.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:w-auto w-full border-t xl:border-t-0 xl:border-l border-slate-200 dark:border-slate-800 pt-4 xl:pt-0 xl:pl-6">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">842</div>
                <div className="text-xs text-slate-500 mb-1">New Complaints</div>
                <div className="text-xs font-medium text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 12.4% vs yesterday</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">1,213</div>
                <div className="text-xs text-slate-500 mb-1">Resolved Complaints</div>
                <div className="text-xs font-medium text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 9.2% vs yesterday</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">48.7%</div>
                <div className="text-xs text-slate-500 mb-1">Resolution Rate</div>
                <div className="text-xs font-medium text-emerald-600 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 3.6% vs yesterday</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">2.6 Days</div>
                <div className="text-xs text-slate-500 mb-1">Avg. Resolution Time</div>
                <div className="text-xs font-medium text-emerald-600 flex items-center gap-1"><ArrowDownRight className="w-3 h-3"/> 0.4 days vs yesterday</div>
              </div>
            </div>
            <div className="xl:ml-4 shrink-0 w-full xl:w-auto">
              <button className="w-full xl:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                View Full AI Summary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Report Templates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Quick Report Templates</h2>
            <p className="text-sm text-slate-500">Generate pre-defined reports in one click.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Daily Report", desc: "Overview of complaints and resolution for today.", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
              { title: "Weekly Report", desc: "Summary of performance for the last 7 days.", icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50" },
              { title: "Monthly Report", desc: "Detailed insights and trends for the last 30 days.", icon: CalendarRange, color: "text-orange-600", bg: "bg-orange-50" },
              { title: "Department Report", desc: "Performance and complaints by department.", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
              { title: "District Report", desc: "Detailed district-wise complaint summary.", icon: MapIcon, color: "text-sky-600", bg: "bg-sky-50" },
              { title: "Custom Report", desc: "Build your own report with selected parameters.", icon: SlidersHorizontal, color: "text-rose-600", bg: "bg-rose-50" }
            ].map((t, i) => (
              <div key={i} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.bg} ${t.color} dark:bg-slate-800 mb-3`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">{t.desc}</p>
                <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  {t.title === "Custom Report" ? "Create Custom" : "Generate"} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Build Custom Report */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 md:p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Build Custom Report</h2>
              <p className="text-sm text-slate-500">Select parameters to include in your report</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Complaint Overview", checked: true },
                { label: "Category Wise Analysis", checked: true },
                { label: "Department Performance", checked: true },
                { label: "District Performance", checked: true },
                { label: "Resolution Time Analysis", checked: false },
                { label: "Citizen Satisfaction", checked: true },
                { label: "Heat Map", checked: false },
                { label: "AI Insights & Summary", checked: true },
                { label: "Escalated Issues", checked: false },
                { label: "Trending Issues", checked: false },
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.checked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 group-hover:border-blue-500'}`}>
                    {item.checked && <CheckSquare className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs text-slate-700 dark:text-slate-300">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="mt-auto">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Select Date Range</h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1">
                  <option>Custom Range</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-2 flex-[2]">
                  <span className="text-slate-600 dark:text-slate-300">01 May 2025</span>
                  <span className="text-slate-400">to</span>
                  <span className="text-slate-600 dark:text-slate-300">20 May 2025</span>
                  <CalendarRange className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition">
                Generate Custom Report
              </button>
            </div>
          </div>

          {/* AI Report Assistant */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 md:p-6 flex flex-col">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-base mb-2">
              <Sparkles className="w-5 h-5" /> AI Report Assistant
            </div>
            <p className="text-sm text-slate-500 mb-4">Ask anything and AI will generate a detailed report for you.</p>
            
            <textarea 
              className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4"
              defaultValue="Generate a report for Water Supply complaints in East Delhi for the last 6 months."
            ></textarea>

            <div className="mt-auto">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 w-max">
                Generate <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 md:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Scheduled Reports</h2>
                <p className="text-xs text-slate-500">Automate report generation and delivery</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition">
                <Plus className="w-4 h-4" /> New Schedule
              </button>
            </div>

            <div className="space-y-4 mb-4">
              {scheduledReports.map(report => (
                <div key={report.id} className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">{report.name}</h4>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-0.5">{report.freq}</div>
                    <div className="text-xs text-slate-500">{report.dest}</div>
                  </div>
                  <button 
                    onClick={() => toggleSchedule(report.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${report.active ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${report.active ? 'left-[22px]' : 'left-0.5'}`}></div>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-auto text-center pt-2">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 transition">
                View All Scheduled Reports <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* 2 Column Grid Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recently Generated Reports */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 md:p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recently Generated Reports</h2>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="pb-3 font-semibold w-[38%]">Report Name</th>
                    <th className="pb-3 font-semibold w-[18%]">Type</th>
                    <th className="pb-3 font-semibold w-[20%]">Date Generated</th>
                    <th className="pb-3 font-semibold w-[16%]">Generated By</th>
                    <th className="pb-3 font-semibold text-center w-[8%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {[
                    { name: "Daily Report - 20 May 2025",              type: "Daily Report",       date: "20 May 2025, 08:00 AM", by: "System" },
                    { name: "Weekly Report (12 May – 18 May 2025)",    type: "Weekly Report",      date: "18 May 2025, 11:30 AM", by: "Anita Sharma (Admin)" },
                    { name: "Monthly Report - April 2025",             type: "Monthly Report",     date: "01 May 2025, 09:15 AM", by: "System" },
                    { name: "Water Department Report - East Delhi",    type: "Department Report",  date: "19 May 2025, 04:20 PM", by: "Rohit Verma (Officer)" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-medium text-slate-900 dark:text-white pr-4">{row.name}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400 pr-4">{row.type}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400 pr-4">{row.date}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400 pr-4">{row.by}</td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => {
                            // Trigger PDF download — replace href with actual report URL when available
                            const link = document.createElement('a');
                            link.href = '#';
                            link.download = `${row.name}.pdf`;
                            link.click();
                          }}
                          title="Download PDF"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-blue-600 bg-blue-50 border border-blue-100
                            hover:bg-blue-600 hover:text-white hover:border-blue-600
                            dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800
                            dark:hover:bg-blue-600 dark:hover:text-white
                            transition-all duration-150"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 transition">
                View All Reports <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
