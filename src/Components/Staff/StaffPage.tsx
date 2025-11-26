import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBoxOpen, faPlus, faList, faWarehouse, faArrowUp, faArrowDown, faChartLine, faCalendarDays, faX } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface StaffSalesData {
  date: string;
  totalSales: number;
  transactionCount: number;
}

const StaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dateRange, setDateRange] = useState<'1d' | '7d' | '30d' | 'custom'>('7d');
  const [showCalendar, setShowCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesData, setSalesData] = useState<StaffSalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch sales data based on dateRange
  const fetchSalesData = async (range: '1d' | '7d' | '30d' | 'custom', startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      let endpoint = '';
      let params = '';

      switch (range) {
        case '1d':
          endpoint = 'Daily';
          break;
        case '7d':
          endpoint = 'Weekly';
          break;
        case '30d':
          endpoint = 'Monthly';
          break;
        case 'custom':
          endpoint = 'Custom';
          params = `?startDate=${startDate}&endDate=${endDate}`;
          break;
      }

      const response = await fetch(`${API_BASE_URL}/StaffSalesReport/${endpoint}${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch sales data');
      const data: StaffSalesData[] = await response.json();
      setSalesData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when dateRange or custom dates change
  useEffect(() => {
    if (dateRange === 'custom') {
      fetchSalesData('custom', customStartDate, customEndDate);
    } else {
      fetchSalesData(dateRange);
    }
  }, [dateRange, customStartDate, customEndDate]);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Process sales data for chart and stats
  const processSalesData = () => {
    if (salesData.length === 0) return null;

    const chartData = salesData.map(d => d.totalSales);
    const totalSales = chartData.reduce((sum, val) => sum + val, 0);
    const totalTransactions = salesData.reduce((sum, d) => sum + d.transactionCount, 0);

    // Calculate percentage change (trend)
    const firstValue = chartData[0];
    const lastValue = chartData[chartData.length - 1];
    const percentChange = firstValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    const trend: 'up' | 'down' = percentChange >= 0 ? 'up' : 'down';

    return {
      title: 'Sales Overview',
      value: `₱${totalSales.toLocaleString()}`,
      icon: faChartLine,
      color: 'from-purple-500 to-purple-600',
      trend,
      trendValue: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
      chartData,
      label: 'Revenue Trend',
      totalTransactions,
    };
  };

  const salesOverview = processSalesData();

  // Quick action cards
  const quickActions = [
    {
      title: 'Add Item',
      description: 'Add new products',
      icon: faPlus,
      color: 'from-blue-500 to-blue-600',
      path: '/staff/add-item'
    },
    {
      title: 'Add Stocks',
      description: 'Manage inventory',
      icon: faWarehouse,
      color: 'from-green-500 to-green-600',
      path: '/staff/add-stocks'
    }
  ];

  // Quick stats cards - Sales Overview
  const statsCards = salesOverview ? [salesOverview] : [];

  // Management cards
  const managementCards = [
    {
      title: 'Supplier List',
      description: 'View and manage all suppliers',
      icon: faList,
      path: '/staff/suppliers'
    },
    {
      title: 'Item List',
      description: 'Browse all products',
      icon: faBoxOpen,
      path: '/staff/items'
    },
    {
      title: 'Stock List',
      description: 'Monitor stock levels',
      icon: faWarehouse,
      path: '/staff/stocks'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Title */}
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-stone-100 truncate">Staff Portal</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
              {/* Welcome Section */}
              <div className="mb-16 sm:mb-20">
                <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 dark:from-amber-600 dark:via-orange-700 dark:to-rose-700 rounded-3xl p-10 sm:p-12 md:p-16 shadow-2xl overflow-hidden group border border-orange-400/30">
                  {/* Animated Premium Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  {/* Floating Particles Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
                    <div className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                  </div>
                  
                  <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 lg:gap-16">
                    <div className="flex-1">
                      <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/50 shadow-2xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 flex-shrink-0">
                          <FontAwesomeIcon icon={faWarehouse} className="text-5xl text-white drop-shadow-lg" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-lg leading-tight">
                            {getGreeting()}!
                          </h2>
                          <div className="text-orange-50 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-300 flex-shrink-0"></div>
                            <span>Staff Portal</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/95 text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
                        Welcome to your workspace. Ready to manage suppliers, items, and inventory efficiently.
                      </p>
                    </div>
                    <div className="w-full lg:w-auto bg-white/20 backdrop-blur-lg rounded-2xl px-8 py-6 border-2 border-white/40 shadow-2xl group-hover:scale-110 group-hover:shadow-3xl transition-all duration-300">
                      <p className="text-white/90 text-xs font-black uppercase tracking-widest mb-4">📅 Today's Date</p>
                      <p className="text-white text-4xl font-black drop-shadow-lg leading-none mb-2">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/95 text-lg font-bold drop-shadow-lg">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mb-16 sm:mb-20">
                <div className="mb-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl blur-lg opacity-30"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500 via-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/30">
                          <FontAwesomeIcon icon={faChartLine} className="h-7 w-7 text-white drop-shadow-2xl" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 dark:from-orange-400 dark:via-amber-400 dark:to-orange-500 bg-clip-text text-transparent tracking-tight mb-1">
                          {dateRange === '7d' ? "Today's Overview" : "Sales Overview"}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 font-bold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          Sales data for selected period
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-white via-neutral-50 to-white dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 rounded-2xl p-2 border-2 border-neutral-200/60 dark:border-neutral-600/60 shadow-lg backdrop-blur-sm">
                      {(['1d', '7d', '30d'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range)}
                          className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                            dateRange === range
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/30 scale-105'
                              : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 hover:scale-105 active:scale-95'
                          }`}
                        >
                          {dateRange === range && <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"></div>}
                          <span className="relative">{range === '1d' ? '1 Day' : range === '7d' ? '7 Days' : '30 Days'}</span>
                        </button>
                      ))}
                      <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-neutral-300 dark:via-neutral-600 to-transparent mx-2"></div>
                      <div className="relative">
                        <button
                          onClick={() => setShowCalendar(!showCalendar)}
                          className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 flex items-center gap-2.5 ${
                            dateRange === 'custom'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/30 scale-105'
                              : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 hover:scale-105 active:scale-95'
                          }`}
                        >
                          {dateRange === 'custom' && <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"></div>}
                          <FontAwesomeIcon icon={faCalendarDays} className="relative h-4 w-4" />
                          <span className="relative">Custom</span>
                        </button>

                        {/* Calendar Picker Dropdown */}
                        {showCalendar && (
                          <div className="absolute top-full right-0 mt-3 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-2xl p-6 z-50 border-2 border-neutral-200/60 dark:border-neutral-700/60 w-96 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                  <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-white" />
                                </div>
                                <h4 className="font-black text-neutral-900 dark:text-white text-lg">Select Date Range</h4>
                              </div>
                              <button
                                onClick={() => setShowCalendar(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95"
                              >
                                <FontAwesomeIcon icon={faX} className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-4 mb-6">
                              <div>
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 block mb-3 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm font-bold focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 block mb-3 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm font-bold focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t-2 border-neutral-200 dark:border-neutral-700">
                              <button
                                onClick={() => {
                                  setDateRange('custom');
                                  setShowCalendar(false);
                                }}
                                className="relative flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                                <span className="relative">Apply Range</span>
                              </button>
                              <button
                                onClick={() => setShowCalendar(false)}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-black text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:scale-105 active:scale-95 transition-all duration-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {loading ? (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-center text-neutral-600 dark:text-neutral-400">Loading sales data...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                      <p className="text-center text-red-600 dark:text-red-400">Error: {error}</p>
                    </div>
                  ) : statsCards.length > 0 ? (
                    statsCards.map((stat, index) => {
                      const minValue = Math.min(...stat.chartData);
                      const maxValue = Math.max(...stat.chartData);
                      const range = maxValue - minValue;
                      const normalizedData = stat.chartData.map((val: number) => ((val - minValue) / range) * 100);
                      
                      return (
                      <div
                        key={index}
                        className="group relative bg-gradient-to-br from-white via-white to-neutral-50/50 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-900/50 rounded-3xl p-8 border-2 border-neutral-200/80 dark:border-neutral-700/80 hover:border-purple-400/60 dark:hover:border-purple-500/60 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500`}></div>
                            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            <FontAwesomeIcon icon={stat.icon} className="h-8 w-8 text-white drop-shadow-2xl" />
                          </div>
                        </div>
                        <div className={`relative flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg backdrop-blur-md border-2 transition-all duration-300 ${stat.trend === 'up' ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/40 border-green-300/50 dark:border-green-600/50' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/40 dark:to-rose-900/40 border-red-300/50 dark:border-red-600/50'}`}>
                          <div className={`absolute inset-0 rounded-xl blur-md opacity-30 ${stat.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <FontAwesomeIcon 
                            icon={stat.trend === 'up' ? faArrowUp : faArrowDown} 
                            className={`relative h-4 w-4 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          />
                          <span className={`relative text-sm font-black ${stat.trend === 'up' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {stat.trendValue}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <p className="text-xs font-black uppercase tracking-widest text-neutral-600 dark:text-neutral-400 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/50"></span>
                          {stat.title}
                        </p>
                        <p className="text-5xl font-black bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-700 dark:from-white dark:via-neutral-100 dark:to-neutral-200 bg-clip-text text-transparent leading-none mb-4">{stat.value}</p>
                        <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 px-4 py-2 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-sm"></div>
                            <div className="relative h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg"></div>
                          </div>
                          <p className="text-xs font-black text-orange-700 dark:text-orange-300">{stat.totalTransactions} Transactions</p>
                        </div>
                      </div>

                      {/* Chart Section - Premium Line Graph with Trend Visualization */}
                      <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl blur-lg opacity-40"></div>
                              <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                                <FontAwesomeIcon icon={faChartLine} className="h-7 w-7 text-white drop-shadow-2xl" />
                              </div>
                            </div>
                            <div>
                              <p className="text-xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent mb-1">Revenue Trend Analysis</p>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">Interactive sales performance visualization</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 bg-gradient-to-r from-white via-neutral-50 to-white dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 px-6 py-3 rounded-2xl border-2 border-neutral-200/60 dark:border-neutral-600/60 shadow-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-50"></div>
                                <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg"></div>
                              </div>
                              <span className="text-xs font-black text-green-700 dark:text-green-300 uppercase tracking-wider">Increase</span>
                            </div>
                            <div className="w-0.5 h-6 bg-gradient-to-b from-transparent via-neutral-300 dark:via-neutral-600 to-transparent"></div>
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-50"></div>
                                <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg"></div>
                              </div>
                              <span className="text-xs font-black text-red-700 dark:text-red-300 uppercase tracking-wider">Decrease</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative h-[28rem] bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 dark:from-neutral-900 dark:via-neutral-800 dark:to-indigo-950/30 rounded-3xl p-10 overflow-hidden border-2 border-neutral-200/80 dark:border-neutral-700/80 shadow-2xl shadow-indigo-500/10">
                          {/* Enhanced Ambient Effects */}
                          <div className="absolute inset-0 rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-blue-500/8 to-indigo-500/8 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white/60 dark:from-neutral-800/60 to-transparent pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white/60 dark:from-neutral-800/60 to-transparent pointer-events-none"></div>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_50%)]"></div>
                          </div>
                          
                          {/* Premium Grid Lines with Enhanced Y-axis Labels */}
                          <div className="absolute inset-0 pointer-events-none pl-8 pr-8">
                            {[...Array(6)].map((_, i) => {
                              const percentage = 100 - (i * 20);
                              const value = minValue + (range * percentage / 100);
                              return (
                                <div key={i} className="absolute w-full flex items-center transition-all duration-300" style={{ top: `${i * 20}%`, left: 0 }}>
                                  <div className="flex items-center gap-3 w-24 justify-end pr-4">
                                    <span className="text-xs font-black text-neutral-700 dark:text-neutral-300 bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-700 px-3 py-1.5 rounded-lg shadow-md border border-neutral-200/50 dark:border-neutral-600/50">
                                      ₱{Math.round(value).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex-1 border-t border-dashed border-neutral-300/60 dark:border-neutral-600/60 mr-8 relative">
                                    <div className="absolute inset-0 border-t border-neutral-200/40 dark:border-neutral-500/40 translate-y-[1px]"></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Premium Line Graph Container with Enhanced Spacing */}
                          <div className="relative h-full pl-24 pr-6 pt-4 pb-20">
                            <svg className="absolute inset-0 w-full h-full" style={{ left: '96px', right: '24px', top: '16px', bottom: '64px' }}>
                              <defs>
                                {/* Enhanced Gradient for Area Fill */}
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                                  <stop offset="30%" stopColor="#8b5cf6" stopOpacity="0.15" />
                                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.1" />
                                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                                </linearGradient>
                                
                                {/* Enhanced Glow Filters */}
                                <filter id="glowGreen">
                                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                  <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                  </feMerge>
                                </filter>
                                <filter id="glowRed">
                                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                  <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                  </feMerge>
                                </filter>
                              </defs>
                              
                              {/* Enhanced Gradient Area Under Line */}
                              <path
                                d={`M 0,100% ${normalizedData.map((height, i) => {
                                  const x = (i / (normalizedData.length - 1)) * 100;
                                  const y = 100 - Math.max(height, 8);
                                  return `L ${x}%,${y}%`;
                                }).join(' ')} L 100%,100% Z`}
                                fill="url(#areaGradient)"
                                className="opacity-80 transition-opacity duration-500"
                              />
                              
                              {/* Enhanced Premium Connecting Lines with Smooth Curves */}
                              {normalizedData.map((height, i) => {
                                if (i === normalizedData.length - 1) return null;
                                const x1 = (i / (normalizedData.length - 1)) * 100;
                                const x2 = ((i + 1) / (normalizedData.length - 1)) * 100;
                                const y1 = 100 - Math.max(height, 8);
                                const y2 = 100 - Math.max(normalizedData[i + 1], 8);
                                
                                const currentValue = stat.chartData[i];
                                const nextValue = stat.chartData[i + 1];
                                const isIncrease = nextValue >= currentValue;
                                
                                return (
                                  <g key={i}>
                                    {/* Enhanced Shadow Layer for 3D Effect */}
                                    <line
                                      x1={`${x1}%`}
                                      y1={`${y1}%`}
                                      x2={`${x2}%`}
                                      y2={`${y2}%`}
                                      stroke={isIncrease ? '#166534' : '#991b1b'}
                                      strokeWidth="7"
                                      opacity="0.15"
                                      strokeLinecap="round"
                                    />
                                    {/* Middle Shadow for Depth */}
                                    <line
                                      x1={`${x1}%`}
                                      y1={`${y1}%`}
                                      x2={`${x2}%`}
                                      y2={`${y2}%`}
                                      stroke={isIncrease ? '#15803d' : '#b91c1c'}
                                      strokeWidth="6"
                                      opacity="0.25"
                                      strokeLinecap="round"
                                    />
                                    {/* Main Enhanced Gradient Line */}
                                    <line
                                      x1={`${x1}%`}
                                      y1={`${y1}%`}
                                      x2={`${x2}%`}
                                      y2={`${y2}%`}
                                      stroke={isIncrease ? 'url(#greenGradient)' : 'url(#redGradient)'}
                                      strokeWidth="5"
                                      strokeLinecap="round"
                                      filter={isIncrease ? 'url(#glowGreen)' : 'url(#glowRed)'}
                                      className="transition-all duration-500 hover:stroke-width-6"
                                    />
                                  </g>
                                );
                              })}
                              
                              {/* Enhanced Gradient Definitions for Lines */}
                              <defs>
                                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#059669" />
                                  <stop offset="50%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#34d399" />
                                </linearGradient>
                                <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#dc2626" />
                                  <stop offset="50%" stopColor="#ef4444" />
                                  <stop offset="100%" stopColor="#f87171" />
                                </linearGradient>
                              </defs>
                            </svg>

                            {/* Enhanced Premium Data Points with Smooth Animations */}
                            <div className="relative h-full flex items-end justify-between gap-1">
                              {normalizedData.map((height, i) => {
                                const prevValue = i === 0 ? stat.chartData[0] : stat.chartData[i - 1];
                                const currentValue = stat.chartData[i];
                                const percentChange = prevValue !== 0 ? (((currentValue - prevValue) / prevValue) * 100).toFixed(1) : '0';
                                const isIncrease = currentValue >= prevValue;
                                const dateLabel = salesData[i]?.date ? new Date(salesData[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Day ${i + 1}`;
                                
                                return (
                                  <div 
                                    key={i} 
                                    className="group/point relative flex flex-col items-center transition-all duration-500 hover:scale-105"
                                    style={{ 
                                      height: '100%',
                                      justifyContent: 'flex-end',
                                      alignItems: 'center',
                                      paddingBottom: `${100 - Math.max(height, 8)}%`,
                                      animation: `slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.12}s both`
                                    }}
                                  >
                                    {/* Enhanced Trend Arrow and Percentage with Smooth Animations */}
                                    {i > 0 && (
                                      <div className="absolute -top-14 flex flex-col items-center gap-1.5 transition-all duration-500 group-hover/point:scale-125 group-hover/point:-translate-y-1">
                                        {/* Enhanced Animated Arrow with Multi-layer Glow */}
                                        <div className={`relative ${isIncrease ? 'animate-bounce' : 'animate-pulse'}`}>
                                          <div className={`absolute inset-0 blur-lg ${
                                            isIncrease ? 'bg-green-500/60' : 'bg-red-500/60'
                                          } rounded-full scale-150`}></div>
                                          <div className={`absolute inset-0 blur-md ${
                                            isIncrease ? 'bg-green-400/40' : 'bg-red-400/40'
                                          } rounded-full scale-125`}></div>
                                          <FontAwesomeIcon 
                                            icon={isIncrease ? faArrowUp : faArrowDown}
                                            className={`relative h-7 w-7 ${
                                              isIncrease ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                                            } drop-shadow-2xl transition-transform duration-300 group-hover/point:scale-110`}
                                            style={{
                                              filter: isIncrease 
                                                ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.9)) drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))' 
                                                : 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.9)) drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))'
                                            }}
                                          />
                                        </div>
                                        
                                        {/* Enhanced Percentage Badge with Multi-layer Design */}
                                        <div className={`relative px-3.5 py-1.5 rounded-xl shadow-2xl border-2 backdrop-blur-md transition-all duration-300 ${
                                          isIncrease 
                                            ? 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-green-300/50 shadow-green-500/50' 
                                            : 'bg-gradient-to-br from-red-500 via-red-600 to-rose-600 border-red-300/50 shadow-red-500/50'
                                        } group-hover/point:shadow-3xl`}>
                                          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-xl"></div>
                                          <span className="relative text-xs font-black text-white flex items-center gap-1">
                                            <span>{isIncrease ? '▲' : '▼'}</span>
                                            <span>{percentChange}%</span>
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Enhanced Premium Data Point with Multi-layer Effects */}
                                    <div className="relative group-hover/point:z-10">
                                      {/* Outer Animated Pulsing Ring */}
                                      <div className={`absolute inset-0 rounded-full animate-ping ${
                                        i === 0 ? 'bg-indigo-500/50' : isIncrease ? 'bg-green-500/50' : 'bg-red-500/50'
                                      }`} style={{ width: '28px', height: '28px', left: '-6px', top: '-6px', animationDuration: '2s' }}></div>
                                      
                                      {/* Second Pulsing Layer for Depth */}
                                      <div className={`absolute inset-0 rounded-full animate-ping ${
                                        i === 0 ? 'bg-indigo-400/40' : isIncrease ? 'bg-green-400/40' : 'bg-red-400/40'
                                      }`} style={{ width: '24px', height: '24px', left: '-4px', top: '-4px', animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                                      
                                      {/* Enhanced Glow Ring */}
                                      <div className={`absolute inset-0 rounded-full blur-md ${
                                        i === 0 ? 'bg-indigo-500/70' : isIncrease ? 'bg-green-500/70' : 'bg-red-500/70'
                                      }`} style={{ width: '22px', height: '22px', left: '-3px', top: '-3px' }}></div>
                                      
                                      {/* Main Enhanced Point */}
                                      <div className={`relative w-5 h-5 rounded-full border-[3px] bg-white dark:bg-neutral-800 shadow-2xl cursor-pointer transition-all duration-700 group-hover/point:w-8 group-hover/point:h-8 group-hover/point:border-[5px] group-hover/point:shadow-3xl ${
                                        i === 0 ? 'border-indigo-500' : isIncrease ? 'border-green-500' : 'border-red-500'
                                      }`}>
                                        {/* Multi-layer Inner Gradient */}
                                        <div className={`absolute inset-[2px] rounded-full bg-gradient-to-br shadow-inner ${
                                          i === 0 
                                            ? 'from-indigo-400 via-indigo-500 to-indigo-600' 
                                            : isIncrease 
                                            ? 'from-green-400 via-green-500 to-emerald-600' 
                                            : 'from-red-400 via-red-500 to-rose-600'
                                        }`}></div>
                                        {/* Inner Highlight */}
                                        <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
                                      </div>
                                      
                                      {/* Enhanced Premium Tooltip with Glass Morphism */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 scale-90 group-hover/point:opacity-100 group-hover/point:scale-100 transition-all duration-500 pointer-events-none z-40 whitespace-nowrap">
                                        <div className={`relative px-6 py-5 rounded-2xl shadow-2xl backdrop-blur-xl border-2 overflow-hidden ${
                                          i === 0 
                                            ? 'bg-gradient-to-br from-indigo-500/95 via-indigo-600/95 to-blue-600/95 border-indigo-300/60 shadow-indigo-500/50' 
                                            : isIncrease 
                                            ? 'bg-gradient-to-br from-green-500/95 via-emerald-600/95 to-green-600/95 border-green-300/60 shadow-green-500/50' 
                                            : 'bg-gradient-to-br from-red-500/95 via-rose-600/95 to-red-600/95 border-red-300/60 shadow-red-500/50'
                                        }`}>
                                          {/* Animated Shimmer Effect */}
                                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl animate-pulse"></div>
                                          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                                          
                                          <div className="relative">
                                            <p className="text-xs font-black text-white/95 mb-3 uppercase tracking-widest flex items-center gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
                                              {dateLabel}
                                            </p>
                                            <p className="text-3xl font-black text-white drop-shadow-2xl mb-3">₱{currentValue.toLocaleString()}</p>
                                            {i > 0 && (
                                              <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/40">
                                                <div className={`p-2 rounded-xl ${isIncrease ? 'bg-white/25' : 'bg-white/25'} backdrop-blur-sm`}>
                                                  <FontAwesomeIcon 
                                                    icon={isIncrease ? faArrowUp : faArrowDown} 
                                                    className="h-5 w-5 text-white drop-shadow-lg"
                                                  />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Change</span>
                                                  <span className="text-lg font-black text-white drop-shadow-lg">{percentChange}%</span>
                                                </div>
                                              </div>
                                            )}
                                            {i === 0 && (
                                              <div className="pt-3 border-t border-white/40">
                                                <p className="text-xs font-black text-white/90 uppercase tracking-wider flex items-center gap-2">
                                                  <span className="w-2 h-2 rounded-full bg-white/80"></span>
                                                  Starting Point
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        {/* Enhanced Tooltip Arrow */}
                                        <div className={`w-4 h-4 rotate-45 absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-lg ${
                                          i === 0 ? 'bg-gradient-to-br from-indigo-600 to-blue-600' : isIncrease ? 'bg-gradient-to-br from-green-600 to-emerald-600' : 'bg-gradient-to-br from-red-600 to-rose-600'
                                        }`}></div>
                                      </div>
                                    </div>
                                    
                                    {/* Enhanced Premium Date Label with Multi-layer Design */}
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                                      {/* Enhanced Color Indicator with Glow */}
                                      {i > 0 && (
                                        <div className="relative">
                                          <div className={`absolute inset-0 rounded-full blur-sm ${
                                            isIncrease ? 'bg-green-500/60' : 'bg-red-500/60'
                                          }`}></div>
                                          <div className={`relative w-2.5 h-2.5 rounded-full shadow-xl ${
                                            isIncrease ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/60' : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/60'
                                          }`}></div>
                                        </div>
                                      )}
                                      {i === 0 && (
                                        <div className="relative">
                                          <div className="absolute inset-0 rounded-full blur-sm bg-indigo-500/60"></div>
                                          <div className="relative w-2.5 h-2.5 rounded-full shadow-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/60"></div>
                                        </div>
                                      )}
                                      {/* Enhanced Date Label Badge */}
                                      <div className={`relative transition-all duration-500 px-3 py-1.5 rounded-lg shadow-lg border ${
                                        i === 0 
                                          ? 'text-indigo-700 dark:text-indigo-300 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 border-indigo-200 dark:border-indigo-700 shadow-indigo-500/20' 
                                          : isIncrease 
                                          ? 'text-green-700 dark:text-green-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-green-200 dark:border-green-700 shadow-green-500/20' 
                                          : 'text-red-700 dark:text-red-300 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/40 border-red-200 dark:border-red-700 shadow-red-500/20'
                                      } group-hover/point:scale-125 group-hover/point:shadow-2xl group-hover/point:-translate-y-1`}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/40 dark:to-white/10 rounded-lg"></div>
                                        <span className="relative text-xs font-black">
                                          {dateLabel}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Chart Summary with Premium Cards */}
                        <div className="mt-8 pt-8 border-t-2 border-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent">
                          <div className="grid grid-cols-3 gap-6">
                            <div className="group relative text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-2xl p-6 border-2 border-blue-300/60 dark:border-blue-700/60 transition-all duration-500 hover:shadow-2xl hover:scale-110 hover:border-blue-500 dark:hover:border-blue-500 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex items-center justify-center gap-2 mb-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50"></div>
                                  <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg"></div>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">Minimum</p>
                              </div>
                              <p className="relative text-3xl font-black bg-gradient-to-br from-blue-700 to-indigo-700 dark:from-blue-200 dark:to-indigo-200 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-125">₱{Math.min(...stat.chartData).toLocaleString()}</p>
                            </div>
                            <div className="group relative text-center bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 dark:from-orange-900/30 dark:via-amber-900/30 dark:to-orange-900/30 rounded-2xl p-6 border-2 border-orange-300/60 dark:border-orange-700/60 transition-all duration-500 hover:shadow-2xl hover:scale-110 hover:border-orange-500 dark:hover:border-orange-500 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex items-center justify-center gap-2 mb-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur-md opacity-50"></div>
                                  <div className="relative w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-amber-600 shadow-lg"></div>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-orange-700 dark:text-orange-300">Average</p>
                              </div>
                              <p className="relative text-3xl font-black bg-gradient-to-br from-orange-700 to-amber-700 dark:from-orange-200 dark:to-amber-200 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-125">
                                ₱{Math.round(stat.chartData.reduce((a, b) => a + b, 0) / stat.chartData.length).toLocaleString()}
                              </p>
                            </div>
                            <div className="group relative text-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-purple-900/30 rounded-2xl p-6 border-2 border-purple-300/60 dark:border-purple-700/60 transition-all duration-500 hover:shadow-2xl hover:scale-110 hover:border-purple-500 dark:hover:border-purple-500 backdrop-blur-sm overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative flex items-center justify-center gap-2 mb-4">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50"></div>
                                  <div className="relative w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 shadow-lg"></div>
                                </div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-300">Maximum</p>
                              </div>
                              <p className="relative text-3xl font-black bg-gradient-to-br from-purple-700 to-pink-700 dark:from-purple-200 dark:to-pink-200 bg-clip-text text-transparent transition-all duration-500 group-hover:scale-125">₱{Math.max(...stat.chartData).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {dateRange === '7d' ? 'Last 7 days' : dateRange === '1d' ? 'Last 24 hours' : dateRange === '30d' ? 'Last 30 days' : 'Custom period'} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      </div>
                    );
                  })
                  ) : (
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                      <p className="text-center text-neutral-600 dark:text-neutral-400">No sales data available for the selected period.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-12">
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-1">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    Fast access to key functions
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 transition-all duration-300 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                          <FontAwesomeIcon icon={action.icon} className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {action.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Management Section */}
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-1">
                    Management
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    View and manage all records
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {managementCards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(card.path)}
                      className="group bg-white dark:bg-neutral-800 rounded-2xl p-6 transition-all duration-300 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md text-left"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                          <FontAwesomeIcon icon={card.icon} className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {card.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {card.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="mt-7 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1.5 flex items-center gap-2">
                      <span>💡 Quick Tip</span>
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                      Use the sidebar to navigate between different sections. Click on quick actions above for faster access to commonly used features. Pro tip: Use keyboard shortcuts for even faster navigation!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
