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
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-1">
                        {dateRange === '7d' ? "Today's Overview" : "Sales Overview"}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                        Sales data for selected period
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-2">
                      {(['1d', '7d', '30d'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            dateRange === range
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 active:scale-95'
                          }`}
                        >
                          {range === '1d' ? '1 Day' : range === '7d' ? '7 Days' : '30 Days'}
                        </button>
                      ))}
                      <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 mx-1"></div>
                      <div className="relative">
                        <button
                          onClick={() => setShowCalendar(!showCalendar)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                            dateRange === 'custom'
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 active:scale-95'
                          }`}
                        >
                          <FontAwesomeIcon icon={faCalendarDays} className="h-4 w-4" />
                          Custom
                        </button>

                        {/* Calendar Picker Dropdown */}
                        {showCalendar && (
                          <div className="absolute top-full right-0 mt-2 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-4 z-50 border border-neutral-200 dark:border-neutral-700 w-80">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-neutral-900 dark:text-white">Select Date Range</h4>
                              <button
                                onClick={() => setShowCalendar(false)}
                                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-all"
                              >
                                <FontAwesomeIcon icon={faX} className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                              </button>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">From</label>
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">To</label>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setDateRange('custom');
                                  setShowCalendar(false);
                                }}
                                className="flex-1 px-3 py-2 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-all"
                              >
                                Apply
                              </button>
                              <button
                                onClick={() => setShowCalendar(false)}
                                className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 font-bold text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
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
                        className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400 dark:hover:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                          <FontAwesomeIcon icon={stat.icon} className="h-6 w-6 text-white" />
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          <FontAwesomeIcon 
                            icon={stat.trend === 'up' ? faArrowUp : faArrowDown} 
                            className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          />
                          <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {stat.trendValue}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{stat.title}</p>
                        <p className="text-3xl font-black text-neutral-900 dark:text-white">{stat.value}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{stat.label}</p>
                      </div>

                      <div className="mb-4">
                        <div className="relative h-32 bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-700/50 dark:to-neutral-700 rounded-lg p-3 overflow-hidden">
                          {/* Grid lines */}
                          <div className="absolute inset-0 opacity-20">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="absolute w-full border-t border-neutral-300 dark:border-neutral-600" style={{ top: `${i * 20}%` }}></div>
                            ))}
                          </div>

                          {/* Line chart bars */}
                          <div className="flex items-end justify-between h-full gap-0.5 relative z-10">
                            {normalizedData.map((height, i) => {
                              const prevValue = i === 0 ? stat.chartData[0] : stat.chartData[i - 1];
                              const currentValue = stat.chartData[i];
                              const percentChange = (((currentValue - prevValue) / prevValue) * 100).toFixed(0);
                              const isIncrease = currentValue >= prevValue;
                              
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                                  {/* Percentage label */}
                                  <div className="absolute -top-6 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className={isIncrease ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                                      {isIncrease ? '+' : ''}{percentChange}%
                                    </span>
                                  </div>
                                  
                                  <div
                                    className={`w-full rounded-t transition-all duration-300 ${
                                      stat.trend === 'up' 
                                        ? 'bg-gradient-to-t from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 shadow-lg' 
                                        : 'bg-gradient-to-t from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 shadow-lg'
                                    }`}
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                    title={`₱${stat.chartData[i]} (${isIncrease ? '+' : ''}${percentChange}%)`}
                                  ></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 text-center">
                          From ₱{Math.min(...stat.chartData)} to ₱{Math.max(...stat.chartData)}
                        </p>
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
