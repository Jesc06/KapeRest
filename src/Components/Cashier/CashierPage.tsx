import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart, faChartLine, faCashRegister, faReceipt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar.tsx';
import LogoutPanel from '../Shared/LogoutPanel';

const CashierPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

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
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Transactions',
      value: '0',
      icon: faReceipt,
      color: 'from-purple-500 to-purple-600'
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
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-10">
              {/* Welcome Section */}
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
                          <FontAwesomeIcon icon={faCashRegister} className="text-4xl text-white" />
                        </div>
                        <div>
                          <h2 className="text-4xl sm:text-5xl font-black text-white mb-1 tracking-tight drop-shadow-lg">
                            {getGreeting()}!
                          </h2>
                          <p className="text-orange-100 text-base font-bold flex items-center gap-2">
                            <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-yellow-300" />
                            <span>Cashier Portal</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-white text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
                        Welcome to your dashboard. Ready to serve customers and process transactions efficiently.
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

              {/* Quick Stats */}
              <div className="mb-12">
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <FontAwesomeIcon icon={faChartLine} className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                        Today's Overview
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 ml-11">
                    Real-time performance metrics
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {statsCards.map((stat, index) => (
                    <div
                      key={index}
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-6 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-400 dark:hover:border-orange-600 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                    >
                      {/* Gradient Background Accent */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-300`}></div>
                      
                      <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                              <FontAwesomeIcon icon={stat.icon} className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-xs font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                              {stat.title}
                            </p>
                          </div>
                          <p className="text-3xl font-black text-neutral-900 dark:text-stone-100 mb-2">
                            {stat.value}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">Live update</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-12">
                <div className="mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm flex-shrink-0">
                      <FontAwesomeIcon icon={faShoppingCart} className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-black text-neutral-900 dark:text-white">
                        Quick Actions
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 ml-11">
                    Fast access to key functions
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                            <span className="uppercase tracking-wider">Access</span>
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

              {/* Helpful Tips */}
              <div className="mt-7 relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl p-6 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-10 blur-3xl"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <span>💡 Quick Tip</span>
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed font-medium">
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
