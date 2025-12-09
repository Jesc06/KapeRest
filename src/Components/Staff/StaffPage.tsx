import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faArrowUp, faArrowDown, faChartLine, faCalendarDays, faX } from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import StaffInflation from './StaffInflation';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

interface StaffSalesData {
  date: string;
  totalSales: number;
  transactionCount: number;
}

const StaffPage: React.FC = () => {
  const { t } = useLanguage();
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
    <div className="min-h-screen w-full relative overflow-hidden bg-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0_0_0)_1px,transparent_0)] bg-[size:40px_40px]"></div>
      </div>
      
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

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
                  className="lg:hidden flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl border-2 border-orange-300 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900 dark:hover:to-amber-900 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-[52px] w-[52px] items-center justify-center rounded-xl border-2 border-orange-300 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900 dark:hover:to-amber-900 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-500 tracking-tight leading-tight">
                    Staff Portal
                  </h1>
                  <p className="hidden sm:block text-sm font-bold text-stone-500 dark:text-stone-400 tracking-wide">Inventory Management</p>
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
                          <p className="text-orange-50 text-base font-semibold tracking-wide">{t('staff.dashboard')}</p>
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
                    
                    {/* Static Daily Summary - Will be replaced with API */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {/* Today's Sales */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950 dark:to-orange-900 rounded-2xl p-5 border-2 border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase tracking-widest">Today's Sales</p>
                          <FontAwesomeIcon icon={faChartLine} className="text-lg text-orange-500 dark:text-orange-400" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-orange-900 dark:text-orange-100 mb-2">₱1,898.40</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                          <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                          <span>+12.5%</span>
                        </div>
                      </div>

                      {/* Today's Transactions */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">Today's Orders</p>
                          <FontAwesomeIcon icon={faChartLine} className="text-lg text-blue-500 dark:text-blue-400" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-blue-900 dark:text-blue-100 mb-2">24</p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Transactions today</p>
                      </div>

                      {/* Average per Order */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950 dark:to-green-900 rounded-2xl p-5 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-widest">Avg per Order</p>
                          <FontAwesomeIcon icon={faChartLine} className="text-lg text-green-500 dark:text-green-400" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-green-900 dark:text-green-100 mb-2">₱79.10</p>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">Per transaction</p>
                      </div>

                      {/* Peak Hour */}
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950 dark:to-amber-900 rounded-2xl p-5 border-2 border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">Peak Hour</p>
                          <FontAwesomeIcon icon={faCalendarDays} className="text-lg text-amber-500 dark:text-amber-400" />
                        </div>
                        <p className="text-3xl sm:text-4xl font-extrabold text-amber-900 dark:text-amber-100 mb-2">2:00 PM</p>
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Highest activity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Separator */}
              <div className="mb-10 border-t-2 border-stone-200 dark:border-stone-700"></div>

              {/* Sales Inflation Component */}
              <StaffInflation />

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
                        Use the sidebar to navigate. Access <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded font-medium">Suppliers</span> and <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded font-medium">Items</span> to manage inventory.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-orange-50 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-600 dark:text-orange-300 rounded-md text-xs font-medium border border-orange-100 dark:border-orange-800/40">📦 Inventory</span>
                        <span className="px-3 py-1.5 bg-blue-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-100 dark:border-blue-800/40">🏪 Suppliers</span>
                        <span className="px-3 py-1.5 bg-green-50 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-300 rounded-md text-xs font-medium border border-green-100 dark:border-green-800/40">📊 Reports</span>
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

export default StaffPage;
