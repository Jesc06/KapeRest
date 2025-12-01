import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { getTotalUsers } from '../../services/accountService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faBuilding, faChartLine, faShieldAlt, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';

const AdminPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Sales Chart State (removed)

  // Branch data and account selection removed

  // Sales data and chart removed - placeholder for future API hookup

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [isLoadingTotalUsers, setIsLoadingTotalUsers] = useState(false);

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        setIsLoadingTotalUsers(true);
        const token = localStorage.getItem('accessToken') ?? undefined;
        const total = await getTotalUsers(token);
        setTotalUsers(total);
      } catch (err) {
        console.error('Error fetching total users:', err);
        setTotalUsers(null);
      } finally {
        setIsLoadingTotalUsers(false);
      }
    };

    fetchTotal();
  }, []);

  // Stats Cards
  const statsCards = [
    {
    title: 'Total Users',
    value: isLoadingTotalUsers ? '—' : (totalUsers !== null ? totalUsers.toString() : '—'),
      change: '+12.5%',
      isIncrease: true,
      icon: faUsers,
      color: 'from-violet-500 via-purple-600 to-fuchsia-600'
    },
    {
      title: 'Active Branches',
      value: '2',
      change: '+2',
      isIncrease: true,
      icon: faBuilding,
      color: 'from-blue-500 via-indigo-600 to-blue-600'
    },
    {
      title: 'Total Revenue',
      value: '₱127,850',
      change: '+18.7%',
      isIncrease: true,
      icon: faChartLine,
      color: 'from-emerald-500 via-teal-600 to-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-rose-400/10 dark:bg-rose-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

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
                    <FontAwesomeIcon icon={faShieldAlt} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 tracking-tight">
                      Admin Dashboard
                    </h1>
                    <p className="hidden sm:block text-xs font-semibold text-stone-500 dark:text-stone-400">Full System Control</p>
                  </div>
                </div>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-8 px-6 sm:px-8 lg:px-12 py-8 sm:py-10 md:py-12 overflow-auto max-w-[1600px] mx-auto w-full">
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
                          <FontAwesomeIcon icon={faShieldAlt} className="text-4xl sm:text-5xl text-white drop-shadow-2xl" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-2 sm:mb-3 tracking-tighter drop-shadow-2xl leading-tight">
                            {getGreeting()}!
                          </h2>
                          <div className="text-orange-50 text-sm sm:text-base font-bold uppercase tracking-widest flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse flex-shrink-0"></div>
                            <span>Administrator Portal</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/95 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl font-medium drop-shadow-lg">
                        Your comprehensive control center for managing all business operations with full administrative privileges.
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

              {/* Performance Metrics Section - Premium Design */}
              <section className="mb-12 sm:mb-16">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                    <h3 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight">
                      Performance Metrics
                    </h3>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-semibold ml-7">
                    Real-time business performance analytics
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {statsCards.map((stat, index) => (
                    <div
                      key={index}
                      className={`group relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${stat.color} p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] border border-white/20`}
                    >
                      {/* Glass Morphism Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5"></div>
                      
                      {/* Animated Orbs */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl transform translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl transform -translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-1000"></div>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl shadow-xl border border-white/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <FontAwesomeIcon icon={stat.icon} className="h-8 w-8 text-white drop-shadow-lg" />
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                            <FontAwesomeIcon
                              icon={stat.isIncrease ? faArrowUp : faArrowDown}
                              className="h-3.5 w-3.5 text-white"
                            />
                            <span className="text-xs font-black text-white">{stat.change}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-black uppercase tracking-widest text-white/90 flex items-center gap-2">
                            {index === 0 && <span>👥</span>}
                            {index === 1 && <span>🏢</span>}
                            {index === 2 && <span>💰</span>}
                            <span>{stat.title}</span>
                          </p>
                          <p className="text-5xl font-black text-white drop-shadow-2xl leading-none group-hover:scale-105 transition-transform duration-300">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Sales Overview section removed */}


            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
