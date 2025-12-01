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
    <div className="min-h-screen w-full relative overflow-hidden bg-stone-50 dark:bg-stone-900">
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

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Minimal Clean Header */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-stone-700 bg-stone-50/90 dark:bg-stone-800/90 backdrop-blur-sm">
            <div className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Controls & Title */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                  {/* Hamburger - Mobile Only */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                  </button>

                  {/* Sidebar Toggle - Desktop Only */}
                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  {/* Title */}
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">Admin Dashboard</h1>
                </div>

                {/* Right: Logout Panel */}
                <LogoutPanel />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-8 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 md:py-12 overflow-auto bg-stone-50 dark:bg-stone-900">
              {/* Floating Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3s' }}></div>
              <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-rose-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
              
              {/* Welcome Section */}
              <div className="mb-16 sm:mb-20 relative">
                <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 dark:from-amber-600 dark:via-orange-700 dark:to-rose-700 rounded-3xl p-12 sm:p-16 md:p-20 shadow-2xl overflow-hidden group border border-orange-400/30 min-h-[400px]">
                  {/* Animated Premium Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  {/* Enhanced Floating Particles Effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-stone-50/40 rounded-full animate-ping"></div>
                    <div className="absolute top-20 right-20 w-3 h-3 bg-stone-50/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-stone-50/40 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-yellow-300/50 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-stone-50/30 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/3 left-2/3 w-2 h-2 bg-orange-200/40 rounded-full animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
                  </div>
                  
                  <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-14 lg:gap-20">
                    <div className="flex-1">
                      <div className="flex items-start gap-8 mb-10">
                        <div className="w-28 h-28 bg-stone-50/25 backdrop-blur-md rounded-3xl flex items-center justify-center border-2 border-white/50 shadow-2xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-300 flex-shrink-0">
                          <FontAwesomeIcon icon={faShieldAlt} className="text-6xl text-white drop-shadow-lg" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-6xl sm:text-7xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-lg leading-tight">
                            {getGreeting()}!
                          </h2>
                          <div className="text-orange-50 text-base sm:text-lg font-bold uppercase tracking-widest flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 flex-shrink-0"></div>
                            <span>Administrator Portal</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-white/95 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-2xl font-medium">
                        Welcome to your comprehensive control center. Manage all aspects of your business operations with full administrative privileges.
                      </p>
                    </div>
                    <div className="w-full lg:w-auto bg-stone-50/20 backdrop-blur-lg rounded-2xl px-10 py-8 border-2 border-white/40 shadow-2xl group-hover:scale-110 group-hover:shadow-3xl transition-all duration-300">
                      <p className="text-white/90 text-sm font-black uppercase tracking-widest mb-5">📅 Today's Date</p>
                      <p className="text-white text-5xl font-black drop-shadow-lg leading-none mb-3">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-white/95 text-xl font-bold drop-shadow-lg">{new Date().toLocaleDateString('en-US', { year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics Section */}
              <section className="mb-16 sm:mb-20">
                <div className="mb-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mb-2">
                    Performance Metrics
                  </h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">
                    Real-time overview of your business performance
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {statsCards.map((stat, index) => (
                    <div
                      key={index}
                      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03]`}
                    >
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-700"></div>
                      </div>
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/25 backdrop-blur-md shadow-xl shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/30">
                            <FontAwesomeIcon icon={stat.icon} className="h-7 w-7 text-white drop-shadow-lg" />
                          </div>
                          <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-stone-50/30 backdrop-blur-md text-white flex items-center gap-1.5 shadow-lg border border-white/30">
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

              {/* Sales Overview section removed */}

              {/* Administrator Information */}
              <aside className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl p-6 lg:p-8 shadow-lg" role="complementary">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <FontAwesomeIcon icon={faShieldAlt} className="h-7 w-7 lg:h-8 lg:w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
                      <span>Administrator Privileges</span>
                    </h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                      You have full system access with comprehensive control over all administrative functions. Navigate through the system to manage user accounts, configure business settings, monitor inventory levels, and oversee multi-branch operations.
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
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
