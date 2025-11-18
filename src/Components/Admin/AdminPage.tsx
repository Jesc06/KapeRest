import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faPercent, faBoxes, faBuilding, faChartLine, faCrown, faShieldAlt, faArrowUp, faArrowDown, faCalendar } from '@fortawesome/free-solid-svg-icons';
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
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-stone-50 to-orange-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />
      
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all duration-200 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hidden lg:flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-white">Admin Dashboard</h1>
            </div>
            <LogoutPanel />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
              {/* Premium Welcome Section */}
              <div className="mb-10 sm:mb-12">
                <div className="relative bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 dark:from-amber-600 dark:via-orange-700 dark:to-rose-700 rounded-2xl p-8 sm:p-10 shadow-2xl overflow-hidden group">
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
                  
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          <FontAwesomeIcon icon={faShieldAlt} className="text-4xl text-white" />
                        </div>
                        <div>
                          <h2 className="text-4xl sm:text-5xl font-black text-white mb-1 tracking-tight drop-shadow-lg">
                            {getGreeting()}!
                          </h2>
                          <p className="text-orange-100 text-base font-bold flex items-center gap-2">
                            <FontAwesomeIcon icon={faCrown} className="h-4 w-4 text-yellow-300" />
                            <span>Admin Control Center</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-white text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
                        Complete system oversight at your fingertips. Monitor operations, manage users, and drive business growth.
                      </p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl px-8 py-5 border-2 border-white/30 shadow-2xl group-hover:scale-105 transition-transform duration-300">
                      <p className="text-white/90 text-xs font-black uppercase tracking-widest mb-2">Today</p>
                      <p className="text-white text-3xl font-black drop-shadow-lg">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/95 text-base font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Stats Grid */}
              <div className="mb-12">
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <FontAwesomeIcon icon={faChartLine} className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                        Performance Metrics
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 ml-11">
                    Real-time overview of your business performance
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsCards.map((stat, index) => (
                    <div
                      key={index}
                      className={`group relative bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border-2 ${stat.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1`}
                    >
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Top Section - Icon and Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                            <FontAwesomeIcon icon={stat.icon} className="h-8 w-8 text-white" />
                          </div>
                          <span className={`text-xs font-black px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1.5 ${
                            stat.isIncrease 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            <FontAwesomeIcon 
                              icon={stat.isIncrease ? faArrowUp : faArrowDown} 
                              className="h-3 w-3" 
                            />
                            {stat.change}
                          </span>
                        </div>
                        
                        {/* Bottom Section - Label and Value */}
                        <div className="flex-1 flex flex-col justify-end">
                          <h3 className="text-xs font-black text-neutral-600 dark:text-neutral-400 mb-2 uppercase tracking-wider">{stat.title}</h3>
                          <p className="text-3xl font-black text-neutral-900 dark:text-white leading-none">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Quick Actions */}
              <div className="mb-12">
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm flex-shrink-0">
                      <FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                        Quick Actions
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 ml-11">
                    Fast access to key management functions
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 transition-all duration-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-transparent overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl text-left"
                    >
                      {/* Premium Gradient Border on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
                      <div className="absolute inset-[2px] bg-white dark:bg-neutral-800 rounded-[14px] z-0"></div>
                      
                      {/* Spotlight Effect */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent dark:from-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon Section */}
                        <div className="mb-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            <FontAwesomeIcon icon={action.icon} className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-black text-neutral-900 dark:text-white mb-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-600 transition-all duration-300">
                              {action.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                              {action.description}
                            </p>
                          </div>
                          
                          {/* Arrow Indicator */}
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            <span className="uppercase tracking-wider">Manage</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sales Overview - Premium Section */}
              <div className="mb-12">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <FontAwesomeIcon icon={faChartLine} className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                        Sales Overview
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 ml-11">
                    Monitor your sales performance with real-time analytics and insights
                  </p>
                </div>

                {/* Filters Section */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border-2 border-stone-200 dark:border-neutral-700 p-6 mb-6 shadow-sm">
                  {/* Period Filters Row */}
                  <div className="mb-6">
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                      Time Period
                    </label>
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-950 border-2 border-stone-200 dark:border-neutral-700 rounded-xl p-1.5 shadow-sm">
                      <button
                        onClick={() => setSelectedPeriod('today')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                          selectedPeriod === 'today'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => setSelectedPeriod('monthly')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                          selectedPeriod === 'monthly'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setSelectedPeriod('yearly')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 ${
                          selectedPeriod === 'yearly'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
                            : 'text-neutral-600 dark:text-neutral-400 hover:bg-orange-50 dark:hover:bg-neutral-800 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        Yearly
                      </button>
                      <button
                        onClick={() => setSelectedPeriod('custom')}
                        className={`px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wide transition-all duration-300 flex items-center gap-2 ${
                          selectedPeriod === 'custom'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg scale-105'
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
                    <div className="mb-6 pb-6 border-b border-stone-200 dark:border-neutral-700">
                      <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                        Date Range
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                            From
                          </label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                          />
                        </div>
                        <div className="flex items-end pb-3">
                          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                            To
                          </label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Branch and Account Filters */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-3">
                      Filter by Location & Account
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Branch Filter */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                          Branch Location
                        </label>
                        <div className="relative">
                          <select
                            value={selectedBranch}
                            onChange={(e) => {
                              setSelectedBranch(e.target.value);
                              setSelectedAccount('all');
                            }}
                            className="w-full appearance-none pl-12 pr-12 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
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
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                          Staff / Cashier
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            disabled={selectedBranch === 'all'}
                            className={`w-full appearance-none pl-12 pr-12 py-3.5 rounded-xl border-2 text-sm font-bold shadow-sm transition-all duration-200 ${
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
                      <div className="mt-4 inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-white/90 block">Active Filter</span>
                          <span className="text-sm font-bold text-white">
                            {branches.find(b => b.id === selectedBranch)?.name} • {accounts.find(a => a.id === selectedAccount)?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales Chart Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 sm:p-8 border-2 border-stone-200 dark:border-neutral-700 shadow-lg">
                  {/* Chart Header */}
                  <div className="mb-6 pb-4 border-b-2 border-stone-200 dark:border-neutral-700">
                    <h4 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                      Performance Metrics
                    </h4>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-5 group hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Total Sales</p>
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 dark:bg-emerald-500/30 flex items-center justify-center">
                            <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        </div>
                        <p className="text-3xl font-black text-emerald-900 dark:text-emerald-300 mb-1">₱{totalSales.toLocaleString()}</p>
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500">for selected period</p>
                      </div>
                    </div>

                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-5 group hover:shadow-lg transition-all duration-300">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Avg Daily</p>
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 dark:bg-blue-500/30 flex items-center justify-center">
                            <FontAwesomeIcon icon={faChartLine} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <p className="text-3xl font-black text-blue-900 dark:text-blue-300 mb-1">₱{avgSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-500">average per day</p>
                      </div>
                    </div>

                    <div className={`relative overflow-hidden bg-gradient-to-br ${isIncrease ? 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800' : 'from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800'} border-2 rounded-xl p-5 group hover:shadow-lg transition-all duration-300`}>
                      <div className={`absolute top-0 right-0 w-20 h-20 ${isIncrease ? 'bg-green-200/30 dark:bg-green-800/20' : 'bg-red-200/30 dark:bg-red-800/20'} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs font-black ${isIncrease ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'} uppercase tracking-widest`}>Change</p>
                          <div className={`w-8 h-8 rounded-lg ${isIncrease ? 'bg-green-500/20 dark:bg-green-500/30' : 'bg-red-500/20 dark:bg-red-500/30'} flex items-center justify-center`}>
                            <FontAwesomeIcon icon={isIncrease ? faArrowUp : faArrowDown} className={`h-4 w-4 ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                          </div>
                        </div>
                        <p className={`text-3xl font-black ${isIncrease ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'} mb-1 flex items-center gap-2`}>
                          {isIncrease ? '+' : ''}{Math.abs(yesterdayChange).toFixed(1)}%
                        </p>
                        <p className={`text-xs font-bold ${isIncrease ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>vs yesterday</p>
                      </div>
                    </div>
                  </div>

                  {/* Bar Chart Section */}
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <h5 className="text-base font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                        Daily Breakdown
                      </h5>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Live Data</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {salesData.map((data, index) => {
                        const percentage = (data.sales / maxSales) * 100;
                        const isToday = index === salesData.length - 1;
                        
                        return (
                          <div key={data.day} className="group">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className={`text-sm font-black min-w-[45px] ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                  {data.day}
                                </span>
                                {isToday && (
                                  <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md">
                                    Today
                                  </span>
                                )}
                              </div>
                              <span className={`text-base font-black tabular-nums ${isToday ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-900 dark:text-white'}`}>
                                ₱{data.sales.toLocaleString()}
                              </span>
                            </div>
                            <div className="relative h-10 bg-neutral-100 dark:bg-neutral-700/50 rounded-xl overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-xl transition-all duration-700 ease-out relative ${
                                  isToday
                                    ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 shadow-lg'
                                    : 'bg-gradient-to-r from-emerald-400 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 animate-pulse"></div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/90">
                                  {percentage.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-8 pt-6 border-t-2 border-stone-200 dark:border-neutral-700 text-center">
                    <button
                      onClick={() => navigate('/admin/sales')}
                      className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm uppercase tracking-wide hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <span>View Detailed Analytics</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Premium Admin Info */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCrown} className="h-4 w-4 text-yellow-500" />
                      <span>Administrator Privileges</span>
                    </h4>
                    <p className="text-sm text-indigo-800 dark:text-indigo-400 leading-relaxed font-medium">
                      You have full system access. Use the navigation menu to manage accounts, configure settings, monitor inventory, and oversee all branch operations. Remember: with great power comes great responsibility!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
