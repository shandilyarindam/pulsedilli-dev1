"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Smile, ArrowUp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";


const now = Date.now();
const MOCK_DATA_ARRAY = [
  { category: 'Water Supply', status: 'Resolved', created_at: new Date(now - 86400000 * 30).toISOString(), satisfaction_rating: 4, area: 'South Delhi' },
  { category: 'Electricity', status: 'Pending', created_at: new Date(now - 86400000 * 27).toISOString(), satisfaction_rating: 3, area: 'North Delhi' },
  { category: 'Roads & Infrastructure', status: 'Resolved', created_at: new Date(now - 86400000 * 24).toISOString(), satisfaction_rating: 5, area: 'East Delhi' },
  { category: 'Sanitation', status: 'In Progress', created_at: new Date(now - 86400000 * 21).toISOString(), satisfaction_rating: 2, area: 'West Delhi' },
  { category: 'Public Transport', status: 'Resolved', created_at: new Date(now - 86400000 * 18).toISOString(), satisfaction_rating: 4, area: 'Central Delhi' },
  { category: 'Water Supply', status: 'Pending', created_at: new Date(now - 86400000 * 15).toISOString(), satisfaction_rating: 3, area: 'North West Delhi' },
  { category: 'Electricity', status: 'Resolved', created_at: new Date(now - 86400000 * 12).toISOString(), satisfaction_rating: 5, area: 'South Delhi' },
  { category: 'Sanitation', status: 'Resolved', created_at: new Date(now - 86400000 * 10).toISOString(), satisfaction_rating: 4, area: 'East Delhi' },
  { category: 'Roads & Infrastructure', status: 'Pending', created_at: new Date(now - 86400000 * 7).toISOString(), satisfaction_rating: 2, area: 'North Delhi' },
  { category: 'Public Transport', status: 'In Progress', created_at: new Date(now - 86400000 * 5).toISOString(), satisfaction_rating: 3, area: 'South Delhi' },
  { category: 'Water Supply', status: 'Resolved', created_at: new Date(now - 86400000 * 3).toISOString(), satisfaction_rating: 5, area: 'West Delhi' },
  { category: 'Electricity', status: 'Pending', created_at: new Date(now - 86400000 * 1).toISOString(), satisfaction_rating: 3, area: 'Central Delhi' },
];

export default function AnalyticsPage() {
  const trendChartRef = useRef<HTMLDivElement>(null);
  const categoryChartRef = useRef<HTMLDivElement>(null);
  const satisfactionChartRef = useRef<HTMLDivElement>(null);
  const [chartsRendered, setChartsRendered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [complaintData, setComplaintData] = useState<any[]>(MOCK_DATA_ARRAY);
  const [areaData, setAreaData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const { data, error } = await supabase.from('complaints').select('*').limit(600);
        if (error) {
          console.error("Supabase error, using mock data:", error);
          return;
        }
        if (data && data.length > 0) {
          setComplaintData(data);
          setChartsRendered(false); // re-render charts with live data
        }
        // if data is empty, MOCK_DATA_ARRAY default state is kept — charts are never blank
      } catch (err) {
        console.error("Error fetching from Supabase, using mock data:", err);
      }
    };
    fetchAnalyticsData();
  }, []);


  useEffect(() => {
    if (isLoading) return;
    
    const renderCharts = () => {
      if (typeof window === "undefined") return;
      if (!(window as any).ApexCharts) {
        setTimeout(renderCharts, 100);
        return;
      }
      if (chartsRendered) return;
      
      const ApexCharts = (window as any).ApexCharts;

    const commonOptions = {
        chart: {
            toolbar: { show: false },
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            background: 'transparent'
        },
        dataLabels: { enabled: false },
        tooltip: {
            theme: 'light',
            style: { fontSize: '12px' }
        }
    };

    // Process Data
    let categoryLabels: string[] = [];
    let catData: number[] = [];
    
    let trendLabels: string[] = [];
    let trendReceived: number[] = [];
    let trendResolved: number[] = [];

    let satLabels: string[] = [];
    let satData: number[] = [];

    if (complaintData && complaintData.length > 0) {
        const catMap: Record<string, number> = {};
        const recMap: Record<string, number> = {};
        const resMap: Record<string, number> = {};
        const satMap: Record<string, { total: number, count: number }> = {};

        complaintData.forEach(c => {
            if (c.category) {
                catMap[c.category] = (catMap[c.category] || 0) + 1;
            }
            const dVal = c.created_at || c.timestamp || c.resolved_at;
            if (dVal) {
                const dateObj = new Date(dVal);
                if (!isNaN(dateObj.getTime())) {
                    const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                    recMap[dateStr] = (recMap[dateStr] || 0) + 1;
                    if (c.status === 'Resolved') {
                        resMap[dateStr] = (resMap[dateStr] || 0) + 1;
                    }
                    
                    // Satisfaction mapping (monthly)
                    const monthStr = dateObj.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
                    if (c.satisfaction_rating) {
                        if (!satMap[monthStr]) satMap[monthStr] = { total: 0, count: 0 };
                        satMap[monthStr].total += c.satisfaction_rating;
                        satMap[monthStr].count++;
                    }
                }
            }
            
            // Area
            const area = c.area || c.district;
            if (area) {
                // Not mapped to chart but used for table below
            }
        });

        // Compute area stats for the table
        const aStats: Record<string, { total: number, resolved: number }> = {};
        complaintData.forEach(c => {
            const a = c.area || c.district || 'Unknown Area';
            if (!aStats[a]) aStats[a] = { total: 0, resolved: 0 };
            aStats[a].total++;
            if (c.status === 'Resolved') aStats[a].resolved++;
        });
        const areaArr = Object.keys(aStats).map(a => ({
            name: a,
            total: aStats[a].total,
            resolved: aStats[a].resolved,
            rate: Math.round((aStats[a].resolved / aStats[a].total) * 100)
        })).sort((a, b) => b.rate - a.rate);
        
        if (areaArr.length > 0) {
            setAreaData(areaArr);
        }

        if (Object.keys(catMap).length > 0) {
            categoryLabels = Object.keys(catMap);
            catData = Object.values(catMap);
        }
        
        if (Object.keys(recMap).length > 0) {
            trendLabels = Object.keys(recMap).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
            trendReceived = trendLabels.map(d => recMap[d] || 0);
            trendResolved = trendLabels.map(d => resMap[d] || 0);
        }

        if (Object.keys(satMap).length > 0) {
            // Sort by month (approximate sort string by parsed date)
            const sortedSat = Object.keys(satMap).sort((a, b) => {
                const dateA = new Date(`01 ${a}`);
                const dateB = new Date(`01 ${b}`);
                return dateA.getTime() - dateB.getTime();
            });
            satLabels = sortedSat;
            satData = sortedSat.map(m => Math.round((satMap[m].total / satMap[m].count) * 20)); // out of 100
        }
    }

    // 1. Complaint Trend Chart
    const trendOptions = {
        ...commonOptions,
        series: [{
            name: 'Received',
            data: trendReceived
        }, {
            name: 'Resolved',
            data: trendResolved
        }],
        chart: { type: 'line', height: 280, ...commonOptions.chart },
        colors: ['#1a56db', '#0e9f6e'],
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
            categories: trendLabels,
            labels: { style: { colors: '#6b7280', fontSize: '12px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { style: { colors: '#6b7280', fontSize: '12px' } }
        },
        grid: {
            borderColor: '#f3f4f6',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            markers: { radius: 12 },
            itemMargin: { horizontal: 10 }
        }
    };

    const trendChart = new ApexCharts(trendChartRef.current, trendOptions);
    trendChart.render();

    // 2. Category Chart
    const categoryOptions = {
        ...commonOptions,
        series: [{
            name: 'Complaints',
            data: catData
        }],
        chart: { type: 'bar', height: 280, ...commonOptions.chart },
        colors: ['#1a56db', '#3f83f8', '#0e9f6e', '#ff8a4c', '#ff5a1f', '#9061f9', '#c084fc'],
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
                barHeight: '40%',
                distributed: true
            }
        },
        xaxis: {
            categories: categoryLabels,
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#374151', fontSize: '13px', fontWeight: 500 }
            }
        },
        grid: { show: false },
        legend: { show: false }
    };
    
    const categoryChart = new ApexCharts(categoryChartRef.current, categoryOptions);
    categoryChart.render();

    // 3. Satisfaction Chart
    const satisfactionOptions = {
        ...commonOptions,
        series: [{
            name: 'Satisfaction Score',
            data: satData
        }],
        chart: { type: 'area', height: 200, ...commonOptions.chart },
        colors: ['#0e9f6e'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        stroke: { curve: 'smooth', width: 3 },
        markers: {
            size: 5,
            colors: ['#fff'],
            strokeColors: '#0e9f6e',
            strokeWidth: 2
        },
        xaxis: {
            categories: satLabels,
            labels: { style: { colors: '#6b7280', fontSize: '11px' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            min: 0,
            max: 100,
            tickAmount: 4,
            labels: { 
                formatter: (val: any) => val + '%',
                style: { colors: '#6b7280', fontSize: '11px' } 
            }
        },
        grid: {
            borderColor: '#f3f4f6',
            strokeDashArray: 4,
        },
        dataLabels: {
            enabled: true,
            formatter: function (val: any) {
                return val + "%";
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ["#0e9f6e"]
            },
            background: {
                enabled: false
            }
        }
    };

    const satisfactionChart = new ApexCharts(satisfactionChartRef.current, satisfactionOptions);
    satisfactionChart.render();

    setChartsRendered(true);
    };

    renderCharts();

    return () => {
        if (trendChartRef.current) trendChartRef.current.innerHTML = '';
        if (categoryChartRef.current) categoryChartRef.current.innerHTML = '';
        if (satisfactionChartRef.current) satisfactionChartRef.current.innerHTML = '';
    };
  }, [chartsRendered, isLoading, complaintData]);

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-gray-50 dark:bg-[#0a0a0a] text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Oversight</h1>
                <p className="text-sm text-gray-500 mt-1">Performance & Resolution Metrics</p>
            </div>
        </div>

        {/* Top Row: Charts */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96 w-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-sm text-gray-500">Loading charts data from Supabase...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complaint Trend */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-5">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                        Complaint Trend Over Time
                        <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                </div>
                <div ref={trendChartRef} className="w-full h-72"></div>
            </div>

            {/* Complaints by Category */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-5">
                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                        Complaints By Category
                        <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>
                    <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
                </div>
                <div ref={categoryChartRef} className="w-full h-72"></div>
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
                    <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Department</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Resolved</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Pending</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Efficiency Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Water</td>
                                <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">92%</td>
                                <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">8%</td>
                                <td className="py-4 border-b border-gray-50 dark:border-gray-800/50"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Excellent</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Electricity</td>
                                <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">88%</td>
                                <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">12%</td>
                                <td className="py-4 border-b border-gray-50 dark:border-gray-800/50"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Good</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-600"></div> Roads</td>
                                <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">74%</td>
                                <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">26%</td>
                                <td className="py-4 border-b border-gray-50 dark:border-gray-800/50"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Average</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800/50 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sanitation</td>
                                <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">58%</td>
                                <td className="py-4 text-sm text-gray-500 border-b border-gray-50 dark:border-gray-800/50">42%</td>
                                <td className="py-4 border-b border-gray-50 dark:border-gray-800/50"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Poor</span></td>
                            </tr>
                            <tr>
                                <td className="py-4 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Traffic Police</td>
                                <td className="py-4 text-sm font-medium">76%</td>
                                <td className="py-4 text-sm text-gray-500">24%</td>
                                <td className="py-4"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Average</span></td>
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
                    <a href="#" className="text-sm text-blue-600 font-medium hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Rank</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Area</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Total</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Resolved</th>
                                <th className="text-xs font-semibold text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">Resolution Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {areaData.length > 0 ? areaData.slice(0,5).map((area, idx) => (
                                <tr key={idx}>
                                    <td className="py-4 text-sm font-bold text-gray-400 border-b border-gray-50 dark:border-gray-800/50">{idx + 1}</td>
                                    <td className="py-4 text-sm font-medium border-b border-gray-50 dark:border-gray-800/50">{area.name}</td>
                                    <td className="py-4 text-sm border-b border-gray-50 dark:border-gray-800/50">{area.total}</td>
                                    <td className="py-4 text-sm border-b border-gray-50 dark:border-gray-800/50">{area.resolved}</td>
                                    <td className="py-4 w-32 border-b border-gray-50 dark:border-gray-800/50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold">{area.rate}%</span>
                                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                                                <div className={`h-full rounded-full ${area.rate > 80 ? 'bg-emerald-500' : area.rate > 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${area.rate}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">No area data available</td>
                                </tr>
                            )}
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
                    {/* Metric item */}
                    <div className="flex items-center justify-between">
                        <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">Power Department</div>
                        <div className="w-1/2 px-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '15%' }}></div>
                            </div>
                        </div>
                        <div className="w-1/6 text-right text-sm font-bold text-gray-900 dark:text-gray-100">0.8 days</div>
                    </div>
                    {/* Metric item */}
                    <div className="flex items-center justify-between">
                        <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">Water Department</div>
                        <div className="w-1/2 px-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                        <div className="w-1/6 text-right text-sm font-bold text-gray-900 dark:text-gray-100">1.2 days</div>
                    </div>
                    {/* Metric item */}
                    <div className="flex items-center justify-between">
                        <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">MCD (Sanitation)</div>
                        <div className="w-1/2 px-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }}></div>
                            </div>
                        </div>
                        <div className="w-1/6 text-right text-sm font-bold text-gray-900 dark:text-gray-100">2.1 days</div>
                    </div>
                    {/* Metric item */}
                    <div className="flex items-center justify-between">
                        <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">Transport Department</div>
                        <div className="w-1/2 px-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div className="w-1/6 text-right text-sm font-bold text-gray-900 dark:text-gray-100">3.7 days</div>
                    </div>
                    {/* Metric item */}
                    <div className="flex items-center justify-between">
                        <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">PWD (Roads)</div>
                        <div className="w-1/2 px-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full overflow-hidden">
                                <div className="bg-red-500 h-full rounded-full" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                        <div className="w-1/6 text-right text-sm font-bold text-gray-900 dark:text-gray-100">4.3 days</div>
                    </div>
                </div>
            </div>

            {/* Satisfaction Trend */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Trend Chart */}
                <div className="md:col-span-3 flex flex-col">
                    <div className="flex justify-between items-center mb-0">
                        <div className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                            User Satisfaction Trend
                            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                        </div>
                    </div>
                    <div ref={satisfactionChartRef} className="flex-grow h-48 md:h-auto mt-2 w-full"></div>
                </div>
                
                {/* KPI Section */}
                <div className="md:col-span-2 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Overall Satisfaction</h3>
                    <div className="flex items-end gap-3 mb-1">
                        <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-500">78%</span>
                        <span className="flex items-center gap-1 text-sm font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded">
                            <Smile className="w-4 h-4" /> Good
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">5%</span> vs last month
                    </p>

                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Breakdown</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Very Satisfied</div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">31%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Satisfied</div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">47%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Neutral</div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">14%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300"><div className="w-2 h-2 rounded-full bg-red-400"></div> Unsatisfied</div>
                            <span className="font-semibold text-gray-700 dark:text-gray-200">6%</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
