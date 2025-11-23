import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faPercent, faBoxes, faBuilding, faChartLine, faShieldAlt, faArrowUp, faArrowDown, faCalendar } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Sales Chart State
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'monthly' | 'yearly' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  // Mock branches data - replace with actual API data
  const branches = [
    { id: 'all', name: 'All Branches' },
    { id: '1', name: 'Main Branch - Manila' },
    { id: '2', name: 'SM Mall of Asia' },
    { id: '3', name: 'Bonifacio Global City' },
    { id: '4', name: 'Makati Branch' }
  ];

  // Mock accounts/staff data - replace with actual API data
  const getAccountsForBranch = (branchId: string) => {
    if (branchId === 'all') {
      return [
        { id: 'all', name: 'All Accounts', role: '' }
      ];
    }
    // This would come from API filtered by branch
    return [
      { id: 'all', name: 'All Accounts', role: '' },
      { id: '1', name: 'Juan Dela Cruz', role: 'Cashier' },
      { id: '2', name: 'Maria Santos', role: 'Staff' },
      { id: '3', name: 'Pedro Reyes', role: 'Cashier' },
      { id: '4', name: 'Ana Garcia', role: 'Staff' }
    ];
  };

  const accounts = getAccountsForBranch(selectedBranch);

  // Mock sales data - replace with actual API data
  const getSalesData = () => {
    const mockData = [
      { day: 'Mon', sales: 12500 },
      { day: 'Tue', sales: 15800 },
      { day: 'Wed', sales: 14200 },
      { day: 'Thu', sales: 18900 },
      { day: 'Fri', sales: 21300 },
      { day: 'Sat', sales: 25600 },
      { day: 'Sun', sales: 19400 }
    ];
    return mockData;
  };

  const salesData = getSalesData();
  const maxSales = Math.max(...salesData.map(d => d.sales));
  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0);
  const avgSales = totalSales / salesData.length;
  
  // Calculate yesterday's change
  const yesterdayIndex = salesData.length - 2;
  const todayIndex = salesData.length - 1;
  const yesterdayChange = yesterdayIndex >= 0 
    ? ((salesData[todayIndex].sales - salesData[yesterdayIndex].sales) / salesData[yesterdayIndex].sales) * 100
    : 0;
  const isIncrease = yesterdayChange > 0;

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Premium Quick Actions
  const quickActions = [
    {
      title: 'Manage Accounts',
      description: 'Control user access & permissions',
      icon: faUsers,
      color: 'from-purple-500 via-purple-600 to-indigo-600',
      path: '/admin/accounts'
    },
    {
      title: 'Tax & Discounts',
      description: 'Configure pricing rules',
      icon: faPercent,
      color: 'from-emerald-500 via-teal-600 to-cyan-600',
      path: '/admin/tax-discounts'
    },
    {
      title: 'Inventory',
      description: 'Monitor stock levels',
      icon: faBoxes,
      color: 'from-orange-500 via-amber-600 to-yellow-600',
      path: '/admin/inventory'
    },
    {
      title: 'Branch Management',
      description: 'Oversee all locations',
      icon: faBuilding,
      color: 'from-blue-500 via-indigo-600 to-purple-600',
      path: '/admin/branch'
    }
  ];

  // Stats Cards
  const statsCards = [
    {
      title: 'Total Users',
      value: '248',
      change: '+12.5%',
      isIncrease: true,
      icon: faUsers,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      title: 'Active Branches',
      value: '8',
      change: '+2',
      isIncrease: true,
      icon: faBuilding,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Inventory Items',
      value: '1,245',
      change: '-3.2%',
      isIncrease: false,
      icon: faBoxes,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      title: 'Total Revenue',
      value: '₱127,850',
      change: '+18.7%',
      isIncrease: true,
      icon: faChartLine,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-stone-950 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300/20 via-amber-300/15 to-yellow-300/10 dark:from-orange-500/10 dark:via-amber-500/8 dark:to-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-300/20 via-orange-300/15 to-yellow-300/10 dark:from-amber-500/10 dark:via-orange-500/8 dark:to-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-200/15 via-amber-200/10 to-yellow-200/8 dark:from-orange-600/8 dark:via-amber-600/5 dark:to-yellow-600/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Premium accent elements */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-orange-400/8 to-amber-500/3 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Premium Header with Glass Morphism */}
          <div className="sticky top-0 z-20 border-b border-orange-200/30 dark:border-orange-700/20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl shadow-2xl shadow-orange-500/10">
            {/* Premium accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent"></div>

            <div className="px-5 sm:px-7 md:px-9 py-6">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 active:scale-95 shadow-xl shadow-orange-500/30 border border-orange-400/20"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="hidden lg:flex flex-shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-300 active:scale-95 shadow-xl shadow-orange-500/30 border border-orange-400/20"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                  </button>

                  <div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                      Admin Dashboard
                    </h1>
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                      Complete System Control Center
                    </p>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <LogoutPanel />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-8 px-6 sm:px-8 lg:px-10 py-8 overflow-auto">
              {/* Welcome Section */}
              <section className="mb-12">
                <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 rounded-2xl p-8 lg:p-10 shadow-2xl shadow-orange-500/20 overflow-hidden border border-orange-400/20">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/15 rounded-full blur-xl"></div>
                  </div>

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-black text-white mb-2">
                          {getGreeting()}, Administrator!
                        </h2>
                        <p className="text-orange-100 text-lg font-semibold leading-relaxed">
                          Welcome to your comprehensive admin control center
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-orange-100/90">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                          <span className="text-sm font-medium">System Status: Operational</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">All Services Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="bg-white/15 backdrop-blur-md rounded-xl px-6 py-4 border border-white/30 shadow-lg">
                        <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">Today</p>
                        <p className="text-white text-2xl font-black drop-shadow-lg">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        <p className="text-white/95 text-sm font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Performance Metrics Section */}
              <section className="mb-12">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/20 flex-shrink-0">
                      <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white mb-1">
                        Performance Metrics
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                        Real-time overview of your business performance
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsCards.map((stat, index) => (
                    <div
                      key={index}
                      className={`group relative bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border-2 ${stat.borderColor} shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-105 border-t-4 border-t-orange-400/50`}
                    >
                      {/* Premium accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-t-2xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-2 right-2 w-8 h-8 bg-orange-400/10 rounded-full blur-sm group-hover:bg-orange-400/20 transition-colors duration-500"></div>

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Top Section - Icon and Badge */}
                        <div className="flex items-start justify-between mb-5">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 border-2 border-white/20`}>
                            <FontAwesomeIcon icon={stat.icon} className="h-6 w-6 text-white drop-shadow-sm" />
                          </div>
                          <span className={`text-xs font-black px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg flex items-center gap-1.5 border ${
                            stat.isIncrease
                              ? 'bg-emerald-100/90 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border-emerald-300/50'
                              : 'bg-red-100/90 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-300/50'
                          }`}>
                            <FontAwesomeIcon
                              icon={stat.isIncrease ? faArrowUp : faArrowDown}
                              className="h-3.5 w-3.5"
                            />
                            {stat.change}
                          </span>
                        </div>

                        {/* Bottom Section - Label and Value */}
                        <div className="flex-1 flex flex-col justify-end">
                          <h3 className="text-xs font-black text-neutral-600 dark:text-neutral-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-3 bg-gradient-to-b from-orange-400 to-amber-500 rounded-full"></div>
                            {stat.title}
                          </h3>
                          <p className="text-3xl font-black text-neutral-900 dark:text-white leading-none drop-shadow-sm">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions Section */}
              <section className="mb-12">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/20 flex-shrink-0">
                      <FontAwesomeIcon icon={faBars} className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl lg:text-3xl font-black text-neutral-900 dark:text-white mb-1">
                        Quick Actions
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                        Fast access to key management functions
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 transition-all duration-500 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-400/50 overflow-hidden transform hover:-translate-y-2 hover:scale-105 shadow-xl hover:shadow-2xl text-left border-t-4 border-t-orange-400/30"
                    >
                      {/* Premium accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-t-2xl"></div>
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      <div className="absolute inset-[3px] bg-white dark:bg-neutral-800 rounded-[14px]"></div>
                      <div className="absolute top-3 right-3 w-6 h-6 bg-orange-400/20 rounded-full blur-sm group-hover:bg-orange-400/30 transition-colors duration-500"></div>

                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon Section */}
                        <div className="mb-5">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500 border-2 border-white/20`}>
                            <FontAwesomeIcon icon={action.icon} className="h-5 w-5 text-white drop-shadow-sm" />
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xl font-black text-neutral-900 dark:text-white mb-3 leading-tight drop-shadow-sm">
                              {action.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                              {action.description}
                            </p>
                          </div>

                          {/* Arrow Indicator */}
                          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            <span className="uppercase tracking-wider">Manage</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Premium Sales Overview Section */}
              <div className="mb-8">
                {/* Premium Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/20 flex-shrink-0">
                      <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                        Sales Overview
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold mt-2">
                    Monitor your sales performance with real-time analytics
                  </p>
                </div>

                {/* Premium Filters Section */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border-2 border-stone-200 dark:border-neutral-700 p-6 mb-6 shadow-xl border-t-4 border-t-orange-400/30 relative overflow-hidden">
                  {/* Premium accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-t-2xl"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 bg-orange-400/10 rounded-full blur-sm"></div>

                  {/* Period Filters Row */}
                  <div className="mb-6">
                    <label className="block text-sm font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-4">
                      Time Period
                    </label>
                    <div className="inline-flex items-center gap-1 bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-950 border-2 border-stone-200 dark:border-neutral-700 rounded-xl p-1.5 shadow-lg">
                      <button
                        onClick={() => setSelectedPeriod('today')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                          selectedPeriod === 'today'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setSelectedPeriod('monthly')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                          selectedPeriod === 'monthly'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setSelectedPeriod('yearly')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                          selectedPeriod === 'yearly'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        Yearly
                      </button>
                      <button
                        onClick={() => setSelectedPeriod('custom')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 flex items-center gap-2 ${
                          selectedPeriod === 'custom'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
                        Custom
                      </button>
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  {selectedPeriod === 'custom' && (
                    <div className="mb-5 pb-5 border-b border-stone-200 dark:border-neutral-700">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                        Date Range
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                            From
                          </label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                          />
                        </div>
                        <div className="flex items-end pb-3">
                          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                            To
                          </label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Branch and Account Filters */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                      Filter by Location & Account
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Branch Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                          Branch Location
                        </label>
                        <div className="relative">
                          <select
                            value={selectedBranch}
                            onChange={(e) => {
                              setSelectedBranch(e.target.value);
                              setSelectedAccount('all');
                            }}
                            className="w-full appearance-none pl-12 pr-12 py-3 rounded-lg border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            {branches.map(branch => (
                              <option key={branch.id} value={branch.id}>
                                {branch.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Account Filter */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                          Staff / Cashier
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            disabled={selectedBranch === 'all'}
                            className={`w-full appearance-none pl-12 pr-12 py-3 rounded-lg border-2 text-sm font-semibold shadow-sm transition-all duration-200 ${
                              selectedBranch === 'all'
                                ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                                : 'border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer'
                            }`}
                          >
                            {accounts.map(account => (
                              <option key={account.id} value={account.id}>
                                {account.name} {account.role && `(${account.role})`}
                              </option>
                            ))}
                          </select>
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${selectedBranch === 'all' ? 'opacity-40' : ''}`}>
                            <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${selectedBranch === 'all' ? 'opacity-40' : ''}`}>
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Filter Indicator */}
                    {selectedBranch !== 'all' && selectedAccount !== 'all' && (
                      <div className="mt-4 inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-white/90 block">Active Filter</span>
                          <span className="text-sm font-semibold text-white">
                            {branches.find(b => b.id === selectedBranch)?.name} • {accounts.find(a => a.id === selectedAccount)?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Premium Sales Chart Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 sm:p-8 border-2 border-stone-200 dark:border-neutral-700 shadow-2xl border-t-4 border-t-orange-400/30 relative overflow-hidden">
                  {/* Premium accents */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 rounded-t-2xl"></div>
                  <div className="absolute top-3 right-3 w-8 h-8 bg-orange-400/10 rounded-full blur-sm"></div>

                  {/* Chart Header */}
                  <div className="mb-8 pb-6 border-b-2 border-stone-200 dark:border-neutral-700">
                    <h4 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-3">
                      <div className="w-1.5 h-7 bg-gradient-to-b from-orange-400 via-orange-500 to-amber-500 rounded-full"></div>
                      Sales Overview
                    </h4>
                  </div>

                  {/* Premium Stats Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-lg border-t-4 border-t-emerald-400/50 relative overflow-hidden">
                      <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-400/20 rounded-full blur-sm"></div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                          <div className="w-1 h-3 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full"></div>
                          Total Sales
                        </p>
                        <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-3xl font-black text-emerald-900 dark:text-emerald-300 drop-shadow-sm">₱{totalSales.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg border-t-4 border-t-blue-400/50 relative overflow-hidden">
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-400/20 rounded-full blur-sm"></div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
                          <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full"></div>
                          Avg Daily
                        </p>
                        <FontAwesomeIcon icon={faCalendar} className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-3xl font-black text-blue-900 dark:text-blue-300 drop-shadow-sm">₱{avgSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>

                    <div className={`bg-gradient-to-br ${isIncrease ? 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 border-t-green-400/50' : 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800 border-t-red-400/50'} border-2 rounded-2xl p-6 shadow-lg border-t-4 relative overflow-hidden`}>
                      <div className={`absolute top-2 right-2 w-6 h-6 ${isIncrease ? 'bg-green-400/20' : 'bg-red-400/20'} rounded-full blur-sm`}></div>
                      <div className="flex items-center justify-between mb-3">
                        <p className={`text-sm font-black ${isIncrease ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} uppercase tracking-wide flex items-center gap-2`}>
                          <div className={`w-1 h-3 bg-gradient-to-b ${isIncrease ? 'from-green-400 to-emerald-500' : 'from-red-400 to-rose-500'} rounded-full`}></div>
                          Change
                        </p>
                        <FontAwesomeIcon icon={isIncrease ? faArrowUp : faArrowDown} className={`h-6 w-6 ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                      </div>
                      <p className={`text-3xl font-black ${isIncrease ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'} drop-shadow-sm`}>
                        {isIncrease ? '+' : ''}{Math.abs(yesterdayChange).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Premium Bar Chart */}
                  <div>
                    <h5 className="text-lg font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wide mb-6 flex items-center gap-2">
                      <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-amber-500 rounded-full"></div>
                      Daily Performance
                    </h5>
                    <div className="space-y-4">
                      {salesData.map((data, index) => {
                        const percentage = (data.sales / maxSales) * 100;
                        const isToday = index === salesData.length - 1;

                        return (
                          <div key={data.day} className="flex items-center gap-4 group">
                            <span className={`text-sm font-black min-w-[50px] ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                              {data.day}
                            </span>
                            <div className="flex-1 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-xl overflow-hidden shadow-inner border border-neutral-200 dark:border-neutral-600">
                              <div
                                className={`h-full rounded-xl transition-all duration-700 ease-out relative ${
                                  isToday
                                    ? 'bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 shadow-lg border-2 border-orange-400/50'
                                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className={`text-base font-black tabular-nums ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-900 dark:text-white'} drop-shadow-sm`}>
                              ₱{data.sales.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Premium View Details Button */}
                  <div className="mt-10 pt-8 border-t-2 border-stone-200 dark:border-neutral-700 text-center">
                    <button
                      onClick={() => navigate('/admin/sales')}
                      className="group inline-flex items-center gap-4 px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-base uppercase tracking-wide hover:shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl"
                    >
                      <span>Detailed Analytics</span>
                      <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Administrator Information */}
              <aside className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 lg:p-8 shadow-xl" role="complementary">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-xl border-2 border-white/30">
                    <FontAwesomeIcon icon={faShieldAlt} className="h-7 w-7 lg:h-8 lg:w-8 text-white drop-shadow-lg" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg lg:text-xl font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-3">
                      <FontAwesomeIcon icon={faShieldAlt} className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                      <span>Administrator Privileges</span>
                    </h3>
                    <p className="text-sm lg:text-base text-indigo-800 dark:text-indigo-400 leading-relaxed font-medium">
                      You have full system access with comprehensive control over all administrative functions. Navigate through the system to manage user accounts, configure business settings, monitor inventory levels, and oversee multi-branch operations with elevated permissions.
                    </p>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        System Status: Fully Operational
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
