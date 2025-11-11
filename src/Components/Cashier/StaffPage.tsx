import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faTruck, faBoxOpen, faChartLine, faPlus, faList, faWarehouse } from '@fortawesome/free-solid-svg-icons';
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
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Staff Portal</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
              {/* Welcome Section */}
              <div className="mb-8 sm:mb-10">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl p-6 sm:p-8 shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {getGreeting()}, Staff! 👋
                      </h2>
                      <p className="text-orange-50 text-sm sm:text-base">
                        Welcome to your workspace. Ready to manage suppliers, items, and inventory?
                      </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/30">
                      <p className="text-white text-xs font-medium uppercase tracking-wide">Staff Member</p>
                      <p className="text-white text-lg font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-stone-100 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(action.path)}
                      className="group relative bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-stone-200 dark:border-neutral-700 overflow-hidden"
                    >
                      {/* Gradient Background on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                      
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <FontAwesomeIcon icon={action.icon} className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-stone-100 mb-1">
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
                <h3 className="text-lg font-bold text-neutral-900 dark:text-stone-100 mb-4">Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {managementCards.map((card, index) => (
                    <button
                      key={index}
                      onClick={() => navigate(card.path)}
                      className="group bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-stone-200 dark:border-neutral-700 text-left hover:border-orange-300 dark:hover:border-orange-600"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-neutral-700 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors duration-300">
                          <FontAwesomeIcon icon={card.icon} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-neutral-900 dark:text-stone-100 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                            {card.title}
                          </h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {card.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Helpful Tips */}
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Quick Tip</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      Use the sidebar to navigate between different sections. Click on quick actions above for faster access to commonly used features.
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
