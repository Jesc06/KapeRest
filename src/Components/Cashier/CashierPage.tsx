import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChartLine, faCashRegister, faMoneyBillWave, faReceipt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar.tsx';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

const CashierPage: React.FC = () => {
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-rose-400/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Top Bar - Premium Glass Header */}
          <div className="sticky top-0 z-20 border-b border-white/20 dark:border-white/10 bg-white/70 dark:bg-stone-900/70 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 transition-all duration-300 backdrop-blur-xl shadow-lg shadow-stone-900/5">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl border border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900 dark:hover:to-amber-900 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-12 w-12 items-center justify-center rounded-xl border border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900 dark:hover:to-amber-900 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Title with Icon */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
                    <FontAwesomeIcon icon={faCashRegister} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 tracking-tight">
                      Cashier Dashboard
                    </h1>
                    <p className="hidden sm:block text-xs font-semibold text-stone-500 dark:text-stone-400">Point of Sale System</p>
                  </div>
                </div>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-10 md:py-12 max-w-[1600px] mx-auto">
              {/* Welcome Section - Ultra Premium Hero */}
              <div className="mb-12 sm:mb-16 relative">
                <div className="relative bg-gradient-to-br from-orange-500 via-amber-600 to-rose-600 dark:from-orange-600 dark:via-amber-700 dark:to-rose-700 rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-2xl overflow-hidden group border-2 border-orange-300/30 dark:border-orange-400/20 min-h-[280px] sm:min-h-[320px]">
                  {/* Mesh Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-pink-600/20 opacity-60"></div>
                  
                  {/* Animated Grid Pattern */}
                  <div className="absolute inset-0 opacity-[0.15]">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  {/* Premium Floating Particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-[10%] left-[8%] w-2 h-2 bg-white/50 rounded-full animate-ping"></div>
                    <div className="absolute top-[25%] right-[15%] w-3 h-3 bg-yellow-200/60 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-[15%] left-[30%] w-2.5 h-2.5 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-[50%] right-[20%] w-2 h-2 bg-orange-200/50 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute bottom-[30%] left-[20%] w-3 h-3 bg-white/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                  </div>
                  
                  <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-12">
                    <div className="flex-1">
                      <div className="flex items-start gap-5 sm:gap-6 mb-6 sm:mb-8">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl flex items-center justify-center border-2 border-white/40 shadow-2xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-500 flex-shrink-0">
                          <FontAwesomeIcon icon={faCashRegister} className="text-4xl sm:text-5xl text-white drop-shadow-2xl" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 sm:mb-3 tracking-tighter drop-shadow-2xl leading-tight">
                            {getGreeting()}!
                          </h2>
                          <div className="text-orange-50 text-sm sm:text-base font-bold uppercase tracking-widest flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0"></div>
                            <span>Cashier Portal Active</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/95 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-medium drop-shadow-lg">
                        Your workspace is ready. Start processing transactions, manage sales, and deliver excellent customer service.
                      </p>
                    </div>
                    <div className="w-full lg:w-auto bg-white/15 backdrop-blur-2xl rounded-2xl px-8 py-6 border-2 border-white/30 shadow-2xl group-hover:scale-105 group-hover:shadow-3xl transition-all duration-500 hover:bg-white/20">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-white/90 text-xs font-black uppercase tracking-widest">Today's Date</p>
                      </div>
                      <p className="text-white text-4xl sm:text-5xl font-black drop-shadow-xl leading-none mb-2">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/95 text-lg font-bold drop-shadow-lg">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Metrics - Premium Stats Cards */}
              <div className="mb-12 sm:mb-16">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                    <h3 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                      Today's Performance
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-semibold ml-7">
                    Real-time sales analytics and transaction insights
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* Total Sales Today - Premium Design */}
                  <div className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 dark:from-emerald-600 dark:via-green-700 dark:to-teal-800 p-8 shadow-2xl shadow-emerald-500/25 hover:shadow-3xl hover:shadow-emerald-500/40 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] border border-emerald-400/20">
                    {/* Glass Morphism Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5"></div>
                    
                    {/* Animated Orbs */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-1000"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl transform -translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl border border-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <FontAwesomeIcon icon={faMoneyBillWave} className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                          <div className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse shadow-lg shadow-emerald-300/50"></div>
                          <span className="text-xs font-black text-white uppercase tracking-wider">Live</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-100/90 flex items-center gap-2">
                          <span>💰</span>
                          <span>Total Sales Today</span>
                        </p>
                        <p className="text-5xl font-black text-white drop-shadow-2xl leading-none group-hover:scale-105 transition-transform duration-300">
                          {loading ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            `₱${todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          )}
                        </p>
                        <p className="text-sm font-bold text-emerald-100/80 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                          </svg>
                          Revenue generated
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Total Transactions Today - Premium Design */}
                  <div className="group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800 p-8 shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] border border-blue-400/20">
                    {/* Glass Morphism Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5"></div>
                    
                    {/* Animated Orbs */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-1000"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl transform -translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl border border-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <FontAwesomeIcon icon={faReceipt} className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <FontAwesomeIcon icon={faChartLine} className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-blue-100/90 flex items-center gap-2">
                          <span>📊</span>
                          <span>Total Transactions</span>
                        </p>
                        <p className="text-5xl font-black text-white drop-shadow-2xl leading-none group-hover:scale-105 transition-transform duration-300">
                          {loading ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            todayTransactions
                          )}
                        </p>
                        <p className="text-sm font-bold text-blue-100/80 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          Orders processed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helpful Tips - Premium Info Card */}
              <div className="relative overflow-hidden bg-white/80 dark:bg-stone-800/80 backdrop-blur-xl border-2 border-orange-200 dark:border-orange-800/50 rounded-[1.75rem] p-8 sm:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
                {/* Gradient Orbs */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-rose-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                
                <div className="relative flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-500/30 hover:scale-110 hover:rotate-6 transition-all duration-500 border-2 border-white/50">
                    <svg className="w-9 h-9 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 mb-3 sm:mb-4 flex items-center gap-2.5 tracking-tight">
                      <span>💡</span>
                      <span>Quick Tips & Navigation</span>
                    </h4>
                    <div className="space-y-3">
                      <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 leading-relaxed font-semibold">
                        Use the sidebar to navigate between different sections. Click on <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-lg font-black">"Buy Item"</span> to start processing customer orders.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/50 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-bold border border-orange-200 dark:border-orange-800">📊 Track Performance</span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-bold border border-blue-200 dark:border-blue-800">🛒 Process Orders</span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 rounded-lg text-sm font-bold border border-green-200 dark:border-green-800">💰 Monitor Sales</span>
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
