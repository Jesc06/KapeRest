import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTruck, faBoxOpen, faChartLine, faPlus, faList, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';

const StaffPage: React.FC = () => {
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
      title: 'Add Supplier',
      description: 'Register new suppliers',
      icon: faTruck,
      color: 'from-orange-500 to-orange-600',
      path: '/staff/add-supplier'
    },
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
    },
    {
      title: 'View Sales',
      description: 'Check sales records',
      icon: faChartLine,
      color: 'from-purple-500 to-purple-600',
      path: '/staff/sales'
    }
  ];

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
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
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
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-5 md:px-6 py-5 sm:py-6">
              {/* Welcome Section */}
              <div className="mb-6 sm:mb-7">
                <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 dark:from-orange-600 dark:via-orange-700 dark:to-orange-600 rounded-2xl p-7 sm:p-8 shadow-2xl overflow-hidden group">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                          <span className="text-3xl">👋</span>
                        </div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">
                            {getGreeting()}!
                          </h2>
                          <p className="text-orange-100 text-sm font-medium">Staff Portal</p>
                        </div>
                      </div>
                      <p className="text-orange-50 text-base sm:text-lg leading-relaxed max-w-2xl">
                        Welcome to your workspace. Ready to manage suppliers, items, and inventory efficiently?
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border-2 border-white/20 shadow-xl group-hover:scale-105 transition-transform duration-300">
                      <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Today</p>
                      <p className="text-white text-2xl font-black">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/90 text-sm font-semibold">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-stone-100">Quick Actions</h3>
                  <div className="h-0.5 flex-1 ml-3 bg-gradient-to-r from-orange-200 to-transparent dark:from-orange-900/30 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="group relative bg-white dark:bg-neutral-800 rounded-2xl p-5 transition-all duration-300 border-2 border-stone-100 dark:border-neutral-700 hover:border-orange-200 dark:hover:border-orange-900/50 overflow-hidden transform hover:-translate-y-1"
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                      
                      {/* Decorative Corner */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100/50 to-transparent dark:from-orange-900/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <FontAwesomeIcon icon={action.icon} className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-stone-100 mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                          {action.title}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Management Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-neutral-900 dark:text-stone-100">Management</h3>
                  <div className="h-0.5 flex-1 ml-3 bg-gradient-to-r from-orange-200 to-transparent dark:from-orange-900/30 rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {managementCards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(card.path)}
                      className="group bg-white dark:bg-neutral-800 rounded-2xl p-5 transition-all duration-300 border-2 border-stone-100 dark:border-neutral-700 text-left hover:border-orange-200 dark:hover:border-orange-900/50 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center group-hover:from-orange-100 group-hover:to-orange-200 dark:group-hover:from-orange-900/40 dark:group-hover:to-orange-800/40 transition-all duration-300">
                          <FontAwesomeIcon icon={card.icon} className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-neutral-900 dark:text-stone-100 mb-1.5 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                            {card.title}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
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
