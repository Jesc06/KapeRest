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
          {/* Minimal Clean Header */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm">
            <div className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Controls & Title */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
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
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-stone-100 truncate">Admin Dashboard</h1>
                </div>

                {/* Right: Logout Panel */}
                <LogoutPanel />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-8 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 md:py-12 overflow-auto bg-gradient-to-br from-white via-stone-50 to-orange-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
              {/* Welcome Section */}
              <section className="mb-16 sm:mb-20">
                <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-700 rounded-3xl p-10 sm:p-12 md:p-16 shadow-2xl shadow-orange-500/30 overflow-hidden group border border-orange-300/20">
                  {/* Animated Premium Background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 group-hover:via-white/10 transition-all duration-700"></div>
                  
                  {/* Floating Particles Effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                    <div className="absolute top-20 right-20 w-3 h-3 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-20 right-1/4 w-2.5 h-2.5 bg-white/45 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-12">
                    <div className="flex-1 space-y-8">
                      <div className="flex items-start gap-5 sm:gap-6">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/60 shadow-2xl shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0">
                          <FontAwesomeIcon icon={faShieldAlt} className="text-4xl sm:text-5xl text-white drop-shadow-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-2xl leading-tight">
                            {getGreeting()}!
                          </h2>
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/25 backdrop-blur-md border border-white/40 shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse flex-shrink-0 shadow-lg shadow-yellow-300/50"></div>
                            <span className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider">Administrator Portal</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white text-base sm:text-lg leading-relaxed font-medium max-w-2xl drop-shadow-lg">
                        Welcome to your comprehensive control center. Manage all aspects of your business operations with full administrative privileges.
                      </p>
                    </div>
                    <div className="w-full lg:w-auto shrink-0 bg-white/25 backdrop-blur-xl rounded-2xl px-6 sm:px-8 py-5 sm:py-6 border-2 border-white/50 shadow-2xl shadow-black/20 group-hover:scale-105 group-hover:shadow-3xl transition-all duration-500">
                      <p className="text-white text-xs font-black uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                        <span>📅</span>
                        <span>Today's Date</span>
                      </p>
                      <p className="text-white text-3xl sm:text-4xl font-black drop-shadow-2xl leading-none mb-1.5 sm:mb-2">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white text-base sm:text-lg font-bold drop-shadow-lg">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Performance Metrics Section */}
              <section className="mb-16 sm:mb-20">
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                    Performance Metrics
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    Real-time overview of your business performance
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                  {statsCards.map((stat, index) => (
                    <div
                      key={index}
                      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03]`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700"></div>
                      </div>
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/25 backdrop-blur-md shadow-xl shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/30">
                            <FontAwesomeIcon icon={stat.icon} className="h-7 w-7 text-white drop-shadow-lg" />
                          </div>
                          <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-white/30 backdrop-blur-md text-white flex items-center gap-1.5 shadow-lg border border-white/30">
                            <FontAwesomeIcon
                              icon={stat.isIncrease ? faArrowUp : faArrowDown}
                              className="h-3.5 w-3.5"
                            />
                            {stat.change}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <p className="text-xs font-bold uppercase tracking-wider text-white/90">{stat.title}</p>
                          <p className="text-4xl font-black text-white leading-none drop-shadow-lg">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions Section */}
              <section className="mb-16 sm:mb-20">
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    Fast access to key management functions
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 transition-all duration-500 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-400 hover:shadow-2xl hover:shadow-orange-500/10 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.03] text-left"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/50 to-orange-50 dark:from-orange-950/10 dark:via-amber-950/10 dark:to-orange-950/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/20 dark:via-orange-500/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      </div>

                      <div className="relative z-10 flex flex-col h-full min-h-[180px]">
                        {/* Icon Section */}
                        <div className="mb-5">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-xl shadow-black/10 group-hover:shadow-2xl group-hover:shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/20`}>
                            <FontAwesomeIcon icon={action.icon} className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h4 className="text-xl font-black text-neutral-900 dark:text-white leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                              {action.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                              {action.description}
                            </p>
                          </div>

                          {/* Arrow Indicator */}
                          <div className="mt-5 flex items-center gap-2 text-xs font-black text-orange-600 dark:text-orange-400 group-hover:gap-3 transition-all duration-300">
                            <span className="uppercase tracking-wider">Access Now</span>
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Premium Sales Overview Section */}
              <div className="mb-12 sm:mb-16">
                {/* Premium Header */}
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-1">
                    Sales Overview
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
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
              <aside className="bg-white dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 rounded-2xl p-6 lg:p-8 shadow-lg" role="complementary">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FontAwesomeIcon icon={faShieldAlt} className="h-7 w-7 lg:h-8 lg:w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Administrator Privileges</span>
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                      You have full system access with comprehensive control over all administrative functions. Navigate through the system to manage user accounts, configure business settings, monitor inventory levels, and oversee multi-branch operations.
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
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
