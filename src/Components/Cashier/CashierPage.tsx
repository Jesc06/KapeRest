import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faShoppingCart, faChartLine, faCashRegister, faMoneyBillWave, faReceipt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar.tsx';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

const CashierPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayMetrics = async () => {
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

        const response = await fetch(`${API_BASE_URL}/CashierSalesReport/CashierDailySales?cashierId=${cashierId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Calculate totals
        const totalSales = data.reduce((sum: number, item: any) => sum + item.total, 0);
        const totalTransactions = data.length;

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
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
                        <div className="text-orange-50 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-300 flex-shrink-0"></div>
                          <span>Cashier Portal</span>
                        </div>
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

              {/* Today's Metrics */}
              <div className="mb-16 sm:mb-20">
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight mb-1">
                    Today's Performance
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                    Real-time sales metrics
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Total Sales Today */}
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 p-6 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                          <FontAwesomeIcon icon={faMoneyBillWave} className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                          <span className="text-xs font-bold text-white">Live</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Sales Today</p>
                        <p className="text-4xl font-black text-white">
                          {loading ? '...' : `₱${todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                        <p className="text-xs font-medium text-white/70">revenue generated</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Transactions Today */}
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                          <FontAwesomeIcon icon={faReceipt} className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm">
                          <FontAwesomeIcon icon={faChartLine} className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Transactions Today</p>
                        <p className="text-4xl font-black text-white">{loading ? '...' : todayTransactions}</p>
                        <p className="text-xs font-medium text-white/70">orders processed</p>
                      </div>
                    </div>
                  </div>
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
