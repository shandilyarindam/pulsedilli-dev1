"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Download, Filter, Search, MoreHorizontal, Eye, 
  ChevronDown, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  Droplet, Zap, Car, Trash2, ShieldAlert
} from "lucide-react";

export default function CitizenComplaintsPage() {
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("Area");
  
  const areas = [
    "Central Delhi", "East Delhi", "New Delhi", "North Delhi", 
    "North East Delhi", "North West Delhi", "Outer North Delhi", "Shahdara", 
    "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
  ];
  
  const filteredAreas = areas.filter(a => a.toLowerCase().includes(areaSearch.toLowerCase()));

  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(event.target as Node)) {
        setAreaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track public grievances across Delhi</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              <Download className="w-4 h-4" /> Export as PDF
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* KPI 1 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Total Complaints</span>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">24,592</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-500">
              <TrendingUp className="w-3 h-3" /> 12% vs last month
            </div>
          </div>
          {/* KPI 2 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Pending</span>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">3,421</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-500">
              <TrendingUp className="w-3 h-3" /> 5% vs last month
            </div>
          </div>
          {/* KPI 3 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">In Progress</span>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">1,845</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <TrendingDown className="w-3 h-3" /> 2% vs last month
            </div>
          </div>
          {/* KPI 4 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Resolved</span>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">19,326</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-500">
              <TrendingUp className="w-3 h-3" /> 18% vs last month
            </div>
          </div>
          {/* KPI 5 */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <span className="text-sm font-semibold text-slate-500 mb-1">Avg. Resolution Time</span>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">2.4<span className="text-lg text-slate-500 font-semibold ml-1">days</span></span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-500">
              <TrendingDown className="w-3 h-3" /> 0.3 days vs last month
            </div>
          </div>
        </div>

        {/* Filters and Table Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <div className="relative">
              <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Department</option>
                <option>Water Supply</option>
                <option>PWD</option>
                <option>MCD</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            
            {/* Custom Area Dropdown */}
            <div className="relative" ref={areaRef}>
              <button 
                onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
                className="flex items-center justify-between w-40 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="truncate">{selectedArea}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              
              {areaDropdownOpen && (
                <div className="absolute z-10 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-2.5" />
                    <input 
                      type="text" 
                      placeholder="Search area..." 
                      className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-200"
                      value={areaSearch}
                      onChange={(e) => setAreaSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      onClick={() => { setSelectedArea("Area"); setAreaDropdownOpen(false); setAreaSearch(""); }}
                    >
                      All Areas
                    </button>
                    {filteredAreas.map(area => (
                      <button 
                        key={area}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        onClick={() => { setSelectedArea(area); setAreaDropdownOpen(false); setAreaSearch(""); }}
                      >
                        {area}
                      </button>
                    ))}
                    {filteredAreas.length === 0 && (
                      <div className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 text-center">No areas found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Status</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Priority</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Date Range</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex-grow"></div>

            <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              <Filter className="w-4 h-4" /> More Filters
            </button>
            <button className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-white transition">
              Apply Filters
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-normal break-words">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complaint ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complaint Details</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Area / District</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Officer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* Row 1 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">#C-82931</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Droplet className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Water Supply</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Severe water logging on Main Rd</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Reported on 12 May 2026, 09:30 AM</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">South West Delhi</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">Critical</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">In Progress</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                        RK
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Rajesh Kumar</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Junior Engineer, DJB</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button className="text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">#C-82930</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Electricity</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Power outage for 6+ hours</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Reported on 11 May 2026, 11:15 PM</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">East Delhi</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">High</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">Resolved</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                        MS
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Meera Singh</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Field Supervisor, BSES</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button className="text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">#C-82929</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <Car className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Roads</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Deep potholes near market</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Reported on 10 May 2026, 04:20 PM</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">New Delhi</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">Medium</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Pending</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                        --
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 italic">Unassigned</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button className="text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">#C-82928</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sanitation</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Garbage not collected for 3 days</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Reported on 09 May 2026, 08:00 AM</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">North West Delhi</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">Medium</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">Resolved</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                        AK
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Amit Kumar</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Sanitation Inspector, MCD</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button className="text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-4 text-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">#C-82927</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Traffic</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Broken traffic light at crossing</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Reported on 09 May 2026, 07:15 AM</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">South East Delhi</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">Critical</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">In Progress</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                        VN
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Vikram Negi</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Traffic Police</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button className="text-slate-400 hover:text-blue-600 transition"><Eye className="w-4 h-4" /></button>
                      <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer (Pagination) */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Rows per page:</span>
              <select className="bg-transparent font-medium focus:outline-none cursor-pointer">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
              <span className="mr-4">1-10 of 24,592</span>
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-md bg-blue-600 text-white font-medium flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center transition">2</button>
                <button className="w-8 h-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center transition">3</button>
                <span className="px-1 text-slate-400">...</span>
                <button className="w-10 h-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center transition">2459</button>
              </div>
              <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
