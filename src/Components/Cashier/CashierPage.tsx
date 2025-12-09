import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChartLine, faMoneyBillWave, faReceipt, faArrowUp, faArrowDown, faCalendarDays, faX } from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Sidebar from './Sidebar.tsx';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

interface CashierSalesData {
  date: string;
  totalSales: number;
  transactionCount: number;
}

interface ApiSalesRecord {
  id: number;
  username: string;
  fullName: string;
  email: string;
  branchName: string;
  branchLocation: string;
  menuItemName: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

const CashierPage: React.FC = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dateRange, setDateRange] = useState<'1d' | '7d' | '30d' | 'custom'>('7d');
  const [showCalendar, setShowCalendar] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesData, setSalesData] = useState<CashierSalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todaySales, setTodaySales] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);

  // Fetch sales data based on dateRange
  const fetchSalesData = async (range: '1d' | '7d' | '30d' | 'custom', startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode JWT to get cashierId
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      const cashierId = decoded.cashierId;

      if (!cashierId) {
        setLoading(false);
        return;
      }

      let endpoint = '';
      let params = `?cashierId=${cashierId}`;

      switch (range) {
        case '1d':
          endpoint = 'CashierDailySales';
          break;
        case '7d':
          // Use daily sales for weekly view (backend will return daily data)
          endpoint = 'CashierDailySales';
          break;
        case '30d':
          endpoint = 'CashierMonthlySales';
          break;
        case 'custom':
          // Use daily sales for custom date range
          endpoint = 'CashierDailySales';
          break;
      }

      const response = await fetch(`${API_BASE_URL}/CashierSalesReport/${endpoint}${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch sales data');
      const rawData: ApiSalesRecord[] = await response.json();

      // Aggregate raw transaction data by date
      const aggregatedData = new Map<string, { totalSales: number; transactionCount: number }>();
      
      rawData.forEach(record => {
        const recordDate = new Date(record.dateTime);
        const dateKey = recordDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Apply date filters
        let includeRecord = true;
        if (range === '7d') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          includeRecord = recordDate >= sevenDaysAgo;
        } else if (range === 'custom' && startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          includeRecord = recordDate >= start && recordDate <= end;
        }

        if (includeRecord && record.status.toLowerCase() === 'completed') {
          const existing = aggregatedData.get(dateKey) || { totalSales: 0, transactionCount: 0 };
          aggregatedData.set(dateKey, {
            totalSales: existing.totalSales + record.total,
            transactionCount: existing.transactionCount + 1,
          });
        }
      });

      // Convert to array and sort by date
      const data: CashierSalesData[] = Array.from(aggregatedData.entries())
        .map(([date, stats]) => ({
          date,
          totalSales: stats.totalSales,
          transactionCount: stats.transactionCount,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  useEffect(() => {
    const fetchTodayMetrics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }

        // Decode JWT to get cashierId
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const cashierId = decoded.cashierId;

        if (!cashierId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/CashierSalesReport/CashierDailySales?cashierId=${cashierId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch today metrics');
        const data: ApiSalesRecord[] = await response.json();

        // Calculate today's metrics from raw transactions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTransactions = data.filter(tx => {
          const txDate = new Date(tx.dateTime);
          return txDate >= today && 
                 txDate < tomorrow && 
                 tx.status.toLowerCase() === 'completed';
        });

        const totalSales = todayTransactions.reduce((sum, tx) => sum + tx.total, 0);
        const totalTransactions = todayTransactions.length;

        setTodaySales(totalSales);
        setTodayTransactions(totalTransactions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching today metrics:', err);
        setLoading(false);
      }
    };

    fetchTodayMetrics();
  }, []);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('admin.goodMorning');
    if (hour < 18) return t('admin.goodAfternoon');
    return t('admin.goodEvening');
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
      color: 'from-orange-500 to-amber-600',
      trend,
      trendValue: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
      chartData,
      label: 'Revenue Trend',
      totalTransactions,
    };
  };

  const salesOverview = processSalesData();

  // Quick stats cards - Sales Overview
  const statsCards = salesOverview ? [salesOverview] : [];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0_0_0)_1px,transparent_0)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Top Bar - Enhanced Header */}
          <div className="sticky top-0 z-20 border-b-2 border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900/70 px-4 sm:px-6 md:px-8 py-4 transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-[52px] w-[52px] items-center justify-center rounded-xl bg-white dark:bg-neutral-700 hover:bg-orange-50 dark:hover:bg-neutral-600 text-stone-700 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 border-2 border-orange-200/50 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500 tracking-tight leading-tight">
                    {t('cashier.dashboard')}
                  </h1>
                  <p className="hidden sm:block text-sm font-bold text-stone-500 dark:text-stone-400 tracking-wide">Point of Sale System</p>
                </div>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 max-w-[1600px] mx-auto">
              {/* Dashboard Home - Daily Summary Panel */}
              <div className="mb-8 sm:mb-10">
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden">
                  {/* Header Section */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 sm:px-8 py-10 sm:py-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
                            {getGreeting()}!
                          </h2>
                          <p className="text-orange-50 text-base font-semibold tracking-wide">Cashier Portal Dashboard</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/90 text-xs font-bold uppercase tracking-widest mb-2">Today</p>
                          <p className="text-white text-2xl sm:text-3xl font-extrabold drop-shadow">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Summary Stats */}
                  <div className="p-6 sm:p-8">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mb-6 flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-orange-500 rounded-full shadow-sm"></div>
                      Today's Summary
                    </h3>
                    
                    {/* Today's Summary - 2 cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Today's Sales */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950 dark:to-emerald-900 rounded-2xl p-5 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-widest">Today's Sales</p>
                          <FontAwesomeIcon icon={faMoneyBillWave} className="text-lg text-green-500 dark:text-green-400" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-green-900 dark:text-green-100 mb-2">
                          {loading ? '...' : `₱${todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                          <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                          <span>Revenue generated</span>
                        </div>
                      </div>

                      {/* Today's Transactions */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">Total Transactions</p>
                          <FontAwesomeIcon icon={faReceipt} className="text-lg text-blue-500 dark:text-blue-400" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-blue-900 dark:text-blue-100 mb-2">
                          {loading ? '...' : todayTransactions}
                        </p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Orders processed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Separator */}
              <div className="mb-10 border-t-2 border-stone-200 dark:border-stone-700"></div>

              {/* Detailed Sales Analytics */}
              <div className="mb-8">
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mb-2 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-orange-500 rounded-full shadow-sm"></div>
                        Sales Trend Analysis
                      </h3>
                      <p className="text-base text-stone-600 dark:text-stone-400 ml-5 font-medium">
                        Track performance over time
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-stone-50 dark:bg-neutral-800 rounded-xl p-1.5 border border-stone-200 dark:border-neutral-700">
                      {(['1d', '7d', '30d'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setDateRange(range)}
                          className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            dateRange === range
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {dateRange === range && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-xl"></div>}
                          <span className="relative">{range === '1d' ? '1 Day' : range === '7d' ? '7 Days' : '30 Days'}</span>
                        </button>
                      ))}
                      <div className="w-0.5 h-8 bg-gradient-to-b from-transparent via-neutral-300 dark:via-neutral-600 to-transparent mx-2"></div>
                      <div className="relative">
                        <button
                          onClick={() => setShowCalendar(!showCalendar)}
                          className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                            dateRange === 'custom'
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-700'
                          }`}
                        >
                          {dateRange === 'custom' && <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-xl"></div>}
                          <FontAwesomeIcon icon={faCalendarDays} className="relative h-4 w-4" />
                          <span className="relative">Custom</span>
                        </button>

                        {/* Calendar Picker Dropdown */}
                        {showCalendar && (
                          <div className="absolute top-full right-0 mt-3 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 rounded-2xl shadow-2xl p-6 z-50 border-2 border-stone-200/60 dark:border-stone-700/60 w-96 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                  <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 text-white" />
                                </div>
                                <h4 className="font-black text-stone-900 dark:text-white text-lg">Select Date Range</h4>
                              </div>
                              <button
                                onClick={() => setShowCalendar(false)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-95"
                              >
                                <FontAwesomeIcon icon={faX} className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-4 mb-6">
                              <div>
                                <label className="text-xs font-black uppercase tracking-widest text-stone-600 dark:text-stone-400 flex items-center gap-2 mb-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white text-sm font-bold focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-black uppercase tracking-widest text-stone-600 dark:text-stone-400 flex items-center gap-2 mb-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-700 text-stone-900 dark:text-white text-sm font-bold focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t-2 border-neutral-200 dark:border-stone-700">
                              <button
                                onClick={() => {
                                  setDateRange('custom');
                                  setShowCalendar(false);
                                }}
                                className="relative flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
                                <span className="relative">Apply Range</span>
                              </button>
                              <button
                                onClick={() => setShowCalendar(false)}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-neutral-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-black text-sm hover:bg-stone-100 dark:hover:bg-stone-700 hover:scale-105 active:scale-95 transition-all duration-300"
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
                    <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-6 border border-neutral-200 dark:border-stone-700">
                      <p className="text-center text-stone-600 dark:text-stone-400">Loading sales data...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                      <p className="text-center text-red-600 dark:text-red-400">Error: {error}</p>
                    </div>
                  ) : statsCards.length > 0 ? (
                    statsCards.map((stat, index) => {
                      
                      return (
                      <div
                        key={index}
                        className="group relative bg-white dark:bg-stone-800/60 rounded-xl p-6 border border-stone-200 dark:border-stone-700/60 hover:border-orange-400 dark:hover:border-orange-500/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-5">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${stat.trend === 'up' ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-600/40' : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-600/40'}`}>
                          <FontAwesomeIcon 
                            icon={stat.trend === 'up' ? faArrowUp : faArrowDown} 
                            className={`h-3.5 w-3.5 ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                          />
                          <span className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                            {stat.trendValue}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-sm font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-3">
                          {stat.title}
                        </p>
                        <p className="text-4xl sm:text-5xl font-extrabold text-stone-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-stone-100 dark:to-stone-200 leading-none mb-4">{stat.value}</p>
                        <div className="inline-flex items-center gap-2 bg-orange-50 dark:bg-gradient-to-r dark:from-orange-900/25 dark:to-amber-900/25 px-4 py-2 rounded-lg border-2 border-orange-100 dark:border-orange-800/40">
                          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                          <p className="text-sm font-bold text-orange-700 dark:text-orange-300">{stat.totalTransactions} orders</p>
                        </div>
                      </div>

                      {/* Revenue Chart */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between gap-4 mb-6">
                          <div>
                            <p className="text-xl font-bold text-stone-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-orange-400 dark:to-amber-400 mb-1">Revenue Trend</p>
                            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Sales performance</p>
                          </div>
                          <div className="flex items-center gap-4 bg-gradient-to-r from-stone-50 via-stone-100 to-stone-50 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 px-6 py-3 rounded-2xl border-2 border-stone-200/60 dark:border-stone-600/60 shadow-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="relative">
                                <div className="absolute inset-0 bg-orange-500 rounded-full blur-sm opacity-50"></div>
                                <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 shadow-lg"></div>
                              </div>
                              <span className="text-xs font-black text-orange-700 dark:text-orange-300 uppercase tracking-wider">Revenue</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Recharts Area Chart */}
                        <div className="relative bg-stone-50 dark:bg-stone-900/60 rounded-xl p-6 border border-stone-200 dark:border-stone-700/60 overflow-hidden">
                          
                          <ResponsiveContainer width="100%" height={400}>
                            <AreaChart
                              data={salesData.map((item, index) => ({
                                name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                sales: item.totalSales,
                                transactions: item.transactionCount,
                                trend: index > 0 ? item.totalSales - salesData[index - 1].totalSales : 0
                              }))}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="#d4d4d4"
                                strokeOpacity={0.3}
                                vertical={false}
                              />
                              <XAxis 
                                dataKey="name" 
                                stroke="#78716c"
                                tick={{ fill: '#78716c', fontSize: 12, fontWeight: 700 }}
                                tickLine={{ stroke: '#d4d4d4' }}
                              />
                              <YAxis 
                                stroke="#78716c"
                                tick={{ fill: '#78716c', fontSize: 12, fontWeight: 700 }}
                                tickLine={{ stroke: '#d4d4d4' }}
                                tickFormatter={(value) => `₱${value.toLocaleString()}`}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                  border: '2px solid #fb923c',
                                  borderRadius: '16px',
                                  boxShadow: '0 10px 40px rgba(251, 146, 60, 0.3)',
                                  padding: '16px',
                                  backdropFilter: 'blur(10px)'
                                }}
                                labelStyle={{
                                  color: '#ea580c',
                                  fontWeight: 900,
                                  fontSize: '14px',
                                  marginBottom: '8px'
                                }}
                                formatter={(value: any, name: string) => {
                                  if (name === 'sales') {
                                    return [`₱${value.toLocaleString()}`, 'Revenue'];
                                  }
                                  if (name === 'transactions') {
                                    return [`${value} orders`, 'Transactions'];
                                  }
                                  return [value, name];
                                }}
                              />
                              <Legend 
                                wrapperStyle={{
                                  paddingTop: '20px',
                                  fontWeight: 700,
                                  fontSize: '13px'
                                }}
                                formatter={(value) => {
                                  if (value === 'sales') return 'Revenue (₱)';
                                  if (value === 'transactions') return 'Transactions';
                                  return value;
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#f97316" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorSales)"
                                animationDuration={1500}
                                dot={{ 
                                  fill: '#fff', 
                                  stroke: '#f97316', 
                                  strokeWidth: 3, 
                                  r: 5,
                                  strokeDasharray: ''
                                }}
                                activeDot={{ 
                                  r: 8, 
                                  fill: '#f97316',
                                  stroke: '#fff',
                                  strokeWidth: 3
                                }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Chart Summary Cards */}
                        <div className="mt-5 pt-5 border-t border-stone-200 dark:border-stone-700/60">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center bg-orange-50 dark:bg-gradient-to-br dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-3 border border-orange-100 dark:border-orange-700/40">
                              <p className="text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-300 mb-1">Min</p>
                              <p className="text-xl font-bold text-orange-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-orange-200 dark:to-amber-200">₱{Math.min(...stat.chartData).toLocaleString()}</p>
                            </div>
                            <div className="text-center bg-amber-50 dark:bg-gradient-to-br dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-3 border border-amber-100 dark:border-amber-700/40">
                              <p className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-300 mb-1">Avg</p>
                              <p className="text-xl font-bold text-amber-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-amber-200 dark:to-yellow-200">
                                ₱{Math.round(stat.chartData.reduce((a, b) => a + b, 0) / stat.chartData.length).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center bg-green-50 dark:bg-gradient-to-br dark:from-rose-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-green-100 dark:border-rose-700/40">
                              <p className="text-xs font-medium uppercase tracking-wide text-green-600 dark:text-rose-300 mb-1">Max</p>
                              <p className="text-xl font-bold text-green-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-rose-200 dark:to-orange-200">₱{Math.max(...stat.chartData).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-stone-400">
                        {dateRange === '7d' ? 'Last 7 days' : dateRange === '1d' ? 'Last 24 hours' : dateRange === '30d' ? 'Last 30 days' : 'Custom period'} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      </div>
                    );
                  })
                  ) : (
                    <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-6 border border-neutral-200 dark:border-stone-700">
                      <p className="text-center text-stone-600 dark:text-stone-400">No sales data available for the selected period.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Tips Card */}
              <div className="relative overflow-hidden bg-white dark:bg-stone-800/80 border border-stone-200 dark:border-orange-800/50 rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
                      <span>💡</span>
                      <span>Quick Tips</span>
                    </h4>
                    <div className="space-y-3">
                      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                        Use the sidebar to navigate. Click <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded font-medium">Buy Item</span> to process customer orders and manage transactions.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-orange-50 dark:bg-gradient-to-r dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-300 rounded-md text-xs font-medium border border-orange-100 dark:border-orange-800/40">🛒 Process Orders</span>
                        <span className="px-3 py-1.5 bg-blue-50 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-100 dark:border-blue-800/40">📊 Track Sales</span>
                        <span className="px-3 py-1.5 bg-green-50 dark:bg-gradient-to-r dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-300 rounded-md text-xs font-medium border border-green-100 dark:border-green-800/40">💰 Manage Transactions</span>
                      </div>
                    </div>
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

export default CashierPage;
