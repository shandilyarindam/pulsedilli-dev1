"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Sparkles, 
  ArrowRight, Calendar, CalendarDays, CalendarRange, 
  Building2, Map as MapIcon, SlidersHorizontal, CheckSquare,
  Download, ArrowUpRight, ArrowDownRight,
  Plus, ChevronDown, FileSpreadsheet
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [scheduledReports, setScheduledReports] = useState([
    { id: 1, name: "Daily Report", freq: "Every day at 08:00 AM", dest: "PDF to: cm.delhi@gov.in", active: true },
    { id: 2, name: "Weekly Report", freq: "Every Monday at 09:00 AM", dest: "PDF to: cm.delhi@gov.in", active: true },
    { id: 3, name: "Monthly Report", freq: "1st of every month at 10:00 AM", dest: "PDF to: cm.delhi@gov.in", active: true },
    { id: 4, name: "Department Performance Report", freq: "Every Friday at 06:00 PM", dest: "Excel to: principalsecretary@gov.in", active: false }
  ]);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  const [assistantQuery, setAssistantQuery] = useState("");
  const [assistantResponse, setAssistantResponse] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // New States for Custom Reports
  const [customParameters, setCustomParameters] = useState<string[]>([
    "Complaint Overview", "Category Wise Analysis", "Department Performance", "District Performance", "Citizen Satisfaction", "AI Insights & Summary"
  ]);
  const [customDateRange, setCustomDateRange] = useState("Last 30 Days");
  const [generatingCustomReport, setGeneratingCustomReport] = useState(false);

  // New State for Quick Reports
  const [generatingQuickReport, setGeneratingQuickReport] = useState<string | null>(null);

  // New State for Recently Generated Reports
  const [recentReports, setRecentReports] = useState([
    { id: 1, name: "Daily Report - 20 May 2025", type: "Daily Report", date: "20 May 2025, 08:00 AM", by: "System" },
    { id: 2, name: "Weekly Report (12 May – 18 May 2025)", type: "Weekly Report", date: "18 May 2025, 11:30 AM", by: "Anita Sharma (Admin)" },
    { id: 3, name: "Monthly Report - April 2025", type: "Monthly Report", date: "01 May 2025, 09:15 AM", by: "System" },
    { id: 4, name: "Water Department Report - East Delhi", type: "Department Report", date: "19 May 2025, 04:20 PM", by: "Rohit Verma (Officer)" },
  ]);

  useEffect(() => {
    // Fetch AI Executive Summary on mount
    async function fetchSummary() {
      try {
        const res = await fetch("/api/ai-report", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setAiSummary(data.summary);
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error("Failed to fetch AI summary:", err);
      } finally {
        setAiSummaryLoading(false);
      }
    }
    fetchSummary();
    
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSchedule = (id: number) => {
    setScheduledReports(scheduledReports.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const handleAssistantGenerate = async () => {
    if (!assistantQuery.trim()) return;
    setAssistantLoading(true);
    setAssistantResponse("");
    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: assistantQuery })
      });
      const data = await res.json();
      if (data.success) {
        setAssistantResponse(data.answer);
      } else {
        setAssistantResponse("Error: " + data.error);
      }
    } catch (err) {
      setAssistantResponse("Failed to connect to AI Assistant.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const generatePDFFromText = (title: string, text: string) => {
    const doc = new jsPDF();
    
    // Minimalist, high-contrast engineering aesthetic (red and white)
    doc.setFillColor(220, 38, 38); // Red-600
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PulseDilli - Governance Report", 15, 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(title, 15, 45);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(text || "No content generated.", 180);
    doc.text(splitText, 15, 55);

    doc.save(`PulseDilli_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleQuickReportGenerate = async (type: string) => {
    setGeneratingQuickReport(type);
    try {
      const res = await fetch("/api/generate-quick-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        generatePDFFromText(type, data.reportText);
        // Add to recent reports
        setRecentReports(prev => [
          { 
            id: Date.now(), 
            name: `${type} - ${new Date().toLocaleDateString('en-GB')}`, 
            type: type, 
            date: new Date().toLocaleString('en-GB'), 
            by: "System (AI)" 
          },
          ...prev
        ]);
      } else {
        alert("Failed to generate report: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to server.");
    } finally {
      setGeneratingQuickReport(null);
    }
  };

  const toggleCustomParameter = (param: string) => {
    setCustomParameters(prev => 
      prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param]
    );
  };

  const handleCustomReportGenerate = async () => {
    if (customParameters.length === 0) {
      alert("Please select at least one parameter.");
      return;
    }
    setGeneratingCustomReport(true);
    try {
      const res = await fetch("/api/generate-custom-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameters: customParameters, dateRange: customDateRange })
      });
      const data = await res.json();
      if (data.success) {
        generatePDFFromText("Custom Analytical Report", data.reportText);
        setRecentReports(prev => [
          { 
            id: Date.now(), 
            name: `Custom Report - ${new Date().toLocaleDateString('en-GB')}`, 
            type: "Custom Report", 
            date: new Date().toLocaleString('en-GB'), 
            by: "Current User" 
          },
          ...prev
        ]);
      } else {
        alert("Failed to generate custom report: " + data.error);
      }
    } catch (err) {
      alert("Failed to connect to server.");
    } finally {
      setGeneratingCustomReport(false);
    }
  };

  const exportAsPDF = () => {
    setExportDropdownOpen(false);
    const doc = new jsPDF();
    
    // Minimalist, high-contrast engineering aesthetic (red and white)
    doc.setFillColor(220, 38, 38); // Red-600
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("PulseDilli - Governance Report", 15, 20);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Daily Executive Summary", 15, 45);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitSummary = doc.splitTextToSize(aiSummary || "No summary available.", 180);
    doc.text(splitSummary, 15, 55);

    if (metrics) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      // Calculate where to start the metrics table (below the summary text)
      const textHeight = splitSummary.length * 5;
      const startY = 55 + textHeight + 10;
      doc.text("Key Metrics", 15, startY);
      
      autoTable(doc, {
        startY: startY + 5,
        head: [['Metric', 'Value']],
        body: [
          ['Total Pending Complaints', metrics.pending],
          ['Total Resolved Complaints', metrics.resolved],
          ['Total Complaints Ever', metrics.total],
          ['Critical Open', metrics.critical],
          ['Avg Resolution Time', `${metrics.avgResolutionDays ?? 'N/A'} days`]
        ],
        theme: 'plain',
        styles: { textColor: [0, 0, 0], fontSize: 10, cellPadding: 4, lineColor: [200, 200, 200], lineWidth: 0.1 },
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' }
      });
    }

    doc.save(`PulseDilli_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportAsExcel = () => {
    setExportDropdownOpen(false);
    window.location.href = "/api/export-excel";
  };

  const customParametersList = [
    "Complaint Overview", "Category Wise Analysis", "Department Performance", 
    "District Performance", "Resolution Time Analysis", "Citizen Satisfaction", 
    "Heat Map", "AI Insights & Summary", "Escalated Issues", "Trending Issues"
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] [#0a0a0a] text-slate-900 ">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 ">Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Generate, schedule and export official reports with AI insights</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 relative" ref={exportRef}>
            <button 
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Export <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 top-12 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <button 
                  onClick={exportAsPDF}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 transition"
                >
                  <FileText className="w-4 h-4 text-red-500" /> Download as PDF
                </button>
                <button 
                  onClick={exportAsExcel}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-green-600 flex items-center gap-2 transition border-t border-slate-100"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-500" /> Download as Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Executive Summary */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-4">
            <Sparkles className="w-5 h-5" /> AI Executive Summary
          </div>
          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Daily Governance Brief - {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h3>
              {aiSummaryLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {aiSummary || "Summary could not be generated."}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:w-auto w-full border-t xl:border-t-0 xl:border-l border-slate-200 pt-4 xl:pt-0 xl:pl-6">
              <div>
                <div className="text-2xl font-bold text-slate-900 ">{metrics?.pending ?? "..."}</div>
                <div className="text-xs text-slate-500 mb-1">Pending Complaints</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 ">{metrics?.resolved ?? "..."}</div>
                <div className="text-xs text-slate-500 mb-1">Resolved Complaints</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 ">{metrics?.total > 0 ? ((metrics.resolved / metrics.total) * 100).toFixed(1) : "0"}%</div>
                <div className="text-xs text-slate-500 mb-1">Resolution Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 ">{metrics?.avgResolutionDays ?? "N/A"}</div>
                <div className="text-xs text-slate-500 mb-1">Avg. Res Time (Days)</div>
              </div>
            </div>
            <div className="xl:ml-4 shrink-0 w-full xl:w-auto">
              <button 
                onClick={exportAsPDF}
                className="w-full xl:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
              >
                Export AI Summary <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Report Templates */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 ">Quick Report Templates</h2>
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
              <div 
                key={i} 
                onClick={() => {
                  if (t.title !== "Custom Report") {
                    handleQuickReportGenerate(t.title);
                  } else {
                    document.getElementById('custom-report-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`border rounded-xl p-4 transition cursor-pointer group ${generatingQuickReport === t.title ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.bg} ${t.color} mb-3`}>
                  <t.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">{t.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">{t.desc}</p>
                <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                  {t.title === "Custom Report" ? "Create Custom" : (generatingQuickReport === t.title ? "Generating..." : "Generate")} <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="custom-report-section">
          
          {/* Build Custom Report */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 ">Build Custom Report</h2>
              <p className="text-sm text-slate-500">Select parameters to include in your report</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {customParametersList.map((item, i) => {
                const isChecked = customParameters.includes(item);
                return (
                  <label key={i} className="flex items-center gap-2 cursor-pointer group" onClick={(e) => e.preventDefault()}>
                    <div 
                      onClick={() => toggleCustomParameter(item)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 group-hover:border-blue-500'}`}
                    >
                      {isChecked && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <span onClick={() => toggleCustomParameter(item)} className="text-xs text-slate-700 select-none">{item}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-auto">
              <h3 className="text-xs font-semibold text-slate-900 mb-2">Select Date Range</h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <select 
                  value={customDateRange}
                  onChange={(e) => setCustomDateRange(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Custom Range</option>
                </select>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 flex-[2] cursor-not-allowed opacity-70">
                  <span className="text-slate-600 ">01 {new Date().toLocaleString('default', { month: 'short', year: 'numeric'})}</span>
                  <span className="text-slate-400">to</span>
                  <span className="text-slate-600 ">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                  <CalendarRange className="w-4 h-4 text-slate-400 ml-auto" />
                </div>
              </div>
              <button 
                onClick={handleCustomReportGenerate}
                disabled={generatingCustomReport}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {generatingCustomReport ? "Generating AI Report..." : "Generate Custom Report"}
              </button>
            </div>
          </div>

          {/* AI Report Assistant */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6 flex flex-col">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-base mb-2">
              <Sparkles className="w-5 h-5" /> AI Report Assistant
            </div>
            <p className="text-sm text-slate-500 mb-4">Ask anything and AI will generate a detailed report for you.</p>
            
            <textarea 
              className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4 min-h-[100px]"
              placeholder="e.g. Generate a report for Water Supply complaints in East Delhi for the last 6 months."
              value={assistantQuery}
              onChange={(e) => setAssistantQuery(e.target.value)}
            ></textarea>

            {assistantResponse && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-slate-700 max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                {assistantResponse}
              </div>
            )}

            <div className="mt-auto">
              <button 
                onClick={handleAssistantGenerate}
                disabled={assistantLoading || !assistantQuery.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 w-max"
              >
                {assistantLoading ? "Analyzing..." : "Generate"} <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scheduled Reports */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 ">Scheduled Reports</h2>
                <p className="text-xs text-slate-500">Automate report generation and delivery</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition">
                <Plus className="w-4 h-4" /> New Schedule
              </button>
            </div>

            <div className="space-y-4 mb-4">
              {scheduledReports.map(report => (
                <div key={report.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-0.5">{report.name}</h4>
                    <div className="text-xs text-blue-600 mb-0.5">{report.freq}</div>
                    <div className="text-xs text-slate-500">{report.dest}</div>
                  </div>
                  <button 
                    onClick={() => toggleSchedule(report.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${report.active ? 'bg-blue-600' : 'bg-slate-200 '}`}
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
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm p-5 md:p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Recently Generated Reports</h2>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="border-b border-slate-200 text-slate-500 ">
                  <tr>
                    <th className="pb-3 font-semibold w-[38%]">Report Name</th>
                    <th className="pb-3 font-semibold w-[18%]">Type</th>
                    <th className="pb-3 font-semibold w-[20%]">Date Generated</th>
                    <th className="pb-3 font-semibold w-[16%]">Generated By</th>
                    <th className="pb-3 font-semibold text-center w-[8%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 ">
                  {recentReports.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 font-medium text-slate-900 pr-4">{row.name}</td>
                      <td className="py-3.5 text-slate-600 pr-4">{row.type}</td>
                      <td className="py-3.5 text-slate-600 pr-4">{row.date}</td>
                      <td className="py-3.5 text-slate-600 pr-4">{row.by}</td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={exportAsPDF}
                          title="Download Last Summary as PDF"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150"
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
