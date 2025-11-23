import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart, faChartLine, faCashRegister, faReceipt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar.tsx';
import LogoutPanel from '../Shared/LogoutPanel';

const CashierPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get sample data based on selected date
  const getChartDataForDate = (date: Date) => {
    // In a real app, this would fetch from API based on date
    const dayOfWeek = date.getDay();
    const baseMultiplier = dayOfWeek === 0 ? 1.5 : dayOfWeek === 6 ? 1.3 : 1; // Higher on weekends
    return [
      Math.round(2 * baseMultiplier),
      Math.round(5 * baseMultiplier),
      Math.round(4 * baseMultiplier),
      Math.round(7 * baseMultiplier),
      Math.round(9 * baseMultiplier),
      Math.round(8 * baseMultiplier),
      Math.round(11 * baseMultiplier),
      Math.round(12 * baseMultiplier),
      Math.round(10 * baseMultiplier),
      Math.round(14 * baseMultiplier)
    ];
  };

  const salesChartData = getChartDataForDate(selectedDate);
  const transactionsChartData = [Math.round(5 / (Math.abs((new Date().getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)), 6, 7, 5, 4, 6, 3, 2, 1, 0];

  // Quick action cards
  const quickActions = [
    {
      title: 'Buy Item',
      description: 'Process customer orders',
      icon: faShoppingCart,
      color: 'from-orange-500 to-orange-600',
      path: '/cashier/buy-item'
    },
    {
      title: 'View Sales',
      description: 'Check sales records',
      icon: faChartLine,
      color: 'from-blue-500 to-blue-600',
      path: '/cashier/sales'
    }
  ];

  // Quick stats cards
  const statsCards = [
    {
      title: 'Today\'s Sales',
      value: '₱0.00',
      icon: faCashRegister,
      color: 'from-green-500 to-green-600',
      trend: 'up',
      trendValue: '+5.2%',
      chartData: salesChartData
    },
    {
      title: 'Transactions',
      value: '0',
      icon: faReceipt,
      color: 'from-purple-500 to-purple-600',
      trend: 'down',
      trendValue: '-2.1%',
      chartData: transactionsChartData
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 transition-all duration-300 backdrop-blur-sm">
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
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-stone-100 truncate">Cashier Dashboard</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-stone-50 to-orange-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12">
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
                          <FontAwesomeIcon icon={faCashRegister} className="text-5xl text-white drop-shadow-lg" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-lg leading-tight">
                            {getGreeting()}!
                          </h2>
                          <p className="text-orange-50 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-300 flex-shrink-0"></div>
                            <span>Cashier Portal</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-white/95 text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
                        Welcome to your dashboard. Ready to serve customers and process transactions efficiently.
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
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's Overview" : "Sales Overview"}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                        {selectedDate.toDateString() === new Date().toDateString() 
                          ? 'Real-time performance metrics' 
                          : `Viewing: ${selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-2">
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() - 1);
                          setSelectedDate(newDate);
                        }}
                        className="p-3 rounded-lg transition-all text-neutral-700 dark:text-neutral-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-neutral-600 active:scale-95 font-bold text-2xl"
                        title="Previous day"
                      >
                        ← 
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className={`px-6 py-3 rounded-lg text-base font-bold transition-all ${
                          selectedDate.toDateString() === new Date().toDateString()
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-600 active:scale-95'
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(newDate.getDate() + 1);
                          if (newDate <= new Date()) {
                            setSelectedDate(newDate);
                          }
                        }}
                        className={`p-3 rounded-lg transition-all ${
                          selectedDate.toDateString() === new Date().toDateString()
                            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                            : 'text-neutral-700 dark:text-neutral-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-white dark:hover:bg-neutral-600 active:scale-95 font-bold text-2xl'
                        }`}
                        disabled={selectedDate.toDateString() === new Date().toDateString()}
                        title="Next day"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {statsCards.map((stat, index) => {
                    const maxValue = Math.max(...stat.chartData);
                    const normalizedData = stat.chartData.map(val => (val / maxValue) * 100);
                    
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
                      
                      <p className="text-xs font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-black text-neutral-900 dark:text-white mb-4">
                        {stat.value}
                      </p>
                      
                      {/* Sparkline Chart */}
                      <div className="mb-4 h-12 flex items-end gap-1 rounded-lg bg-neutral-50 dark:bg-neutral-700/30 p-3">
                        {normalizedData.map((height, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-sm transition-all duration-300 ${
                              stat.trend === 'up' 
                                ? 'bg-gradient-to-t from-green-400 to-green-300 hover:from-green-500 hover:to-green-400' 
                                : 'bg-gradient-to-t from-red-400 to-red-300 hover:from-red-500 hover:to-red-400'
                            }`}
                            style={{ height: `${height}%`, minHeight: '2px' }}
                            title={`${stat.chartData[i]}`}
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Live update</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-16 sm:mb-20">
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
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 transition-all duration-200 border border-neutral-200 dark:border-neutral-700 hover:border-orange-400 dark:hover:border-orange-500 overflow-hidden text-left shadow-sm hover:shadow-md"
                    >
                      <div className="relative z-10 flex flex-col h-full">
                        {/* Icon Section */}
                        <div className="mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md`}>
                            <FontAwesomeIcon icon={action.icon} className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        {/* Content Section */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-lg font-black text-neutral-900 dark:text-white mb-2 leading-tight">
                              {action.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                              {action.description}
                            </p>
                          </div>
                          
                          {/* Arrow Indicator */}
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            <span className="uppercase tracking-wider">Access</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="mt-18 sm:mt-20 relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-3xl p-12 sm:p-14 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400 opacity-15 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400 opacity-10 blur-2xl"></div>
                <div className="relative flex flex-col sm:flex-row items-start gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg sm:text-xl font-black text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2 tracking-tight">
                      <span>💡 Quick Tip</span>
                    </h4>
                    <p className="text-base text-blue-800 dark:text-blue-400 leading-relaxed font-semibold">
                      Use the sidebar to navigate between different sections. Click on "Buy Item" to start processing customer orders. Remember to check sales regularly to track performance!
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

export default CashierPage;
