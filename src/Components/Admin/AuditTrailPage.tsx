import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faUser, faCalendarAlt, faClock, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from './AdminSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface AuditLog {
  id: number;
  username: string;
  role: string;
  action: string; // Add, Delete, Deliver
  description?: string; // Delivered 50 units of Latte
  date: string;
}

const AuditTrailPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionFilterOpen, setIsActionFilterOpen] = useState(false);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);

  // Fetch audit logs from API
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/Audit/GetALlAudit`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AuditLog[] = await response.json();
        setAuditLogs(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Get unique values for filters
  const roles = ['all', ...Array.from(new Set(auditLogs.map(log => log.role)))];

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.username.toLowerCase().includes(searchLower) ||
      (log.description?.toLowerCase().includes(searchLower) || false);
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesRole = filterRole === 'all' || log.role === filterRole;
    
    return matchesSearch && matchesAction && matchesRole;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Add':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Delete':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Deliver':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Login':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Logout':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getActionLabel = (action: string) => {
    return action === 'all' ? 'All Actions' : action;
  };

  const getRoleLabel = (role: string) => {
    return role === 'all' ? 'All Roles' : role;
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 dark:bg-stone-900">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-700/50 shadow-lg shadow-black/5">
            <div className="px-4 sm:px-6 md:px-8 py-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div className="hidden sm:flex items-center gap-3">
                    <div>
                      <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Audit Trail</h1>
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Activity log history</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search user or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          {filteredLogs.length} found
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LogoutPanel />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 overflow-auto">

              {/* Filter Dropdowns - Clean & Professional */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Action Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsActionFilterOpen(!isActionFilterOpen)}
                    className="group flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 shadow-md hover:shadow-lg min-w-[220px]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">Filter by Action</div>
                      <div className="text-sm font-bold text-stone-900 dark:text-white">
                        {getActionLabel(filterAction)}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isActionFilterOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Action Dropdown Menu */}
                  {isActionFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsActionFilterOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => { setFilterAction('all'); setIsActionFilterOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                              filterAction === 'all' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${filterAction === 'all' ? 'bg-white/20' : 'bg-stone-200 dark:bg-stone-700'}`}>
                              <svg className={`w-4 h-4 ${filterAction === 'all' ? 'text-white' : 'text-stone-600 dark:text-stone-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm">All Actions</div>
                              <div className={`text-xs ${filterAction === 'all' ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>Show all activities</div>
                            </div>
                            {filterAction === 'all' && (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <div className="my-2 border-t border-stone-200 dark:border-stone-700"></div>
                          {['Add', 'Delete', 'Deliver', 'Login', 'Logout'].map((action) => {
                            const colors = {
                              Add: { bg: 'emerald', icon: 'M12 4v16m8-8H4' },
                              Delete: { bg: 'red', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
                              Deliver: { bg: 'amber', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
                              Login: { bg: 'blue', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
                              Logout: { bg: 'purple', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' }
                            }[action];
                            return (
                              <button
                                key={action}
                                onClick={() => { setFilterAction(action); setIsActionFilterOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                  filterAction === action ? `bg-gradient-to-r from-${colors.bg}-500 to-${colors.bg}-600 text-white shadow-md` : `hover:bg-${colors.bg}-50 dark:hover:bg-${colors.bg}-950/30 text-stone-700 dark:text-stone-300`
                                }`}
                              >
                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${filterAction === action ? 'bg-white/20' : `bg-${colors.bg}-100 dark:bg-${colors.bg}-900/30`}`}>
                                  <svg className={`w-4 h-4 ${filterAction === action ? 'text-white' : `text-${colors.bg}-600 dark:text-${colors.bg}-400`}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={colors.icon} />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold text-sm">{action}</div>
                                  <div className={`text-xs ${filterAction === action ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>{action} actions</div>
                                </div>
                                {filterAction === action && (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Role Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                    className="group flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px]"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">Filter by Role</div>
                      <div className="text-sm font-bold text-stone-900 dark:text-white">
                        {getRoleLabel(filterRole)}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${isRoleFilterOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Role Dropdown Menu */}
                  {isRoleFilterOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsRoleFilterOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                        <div className="p-2 space-y-1">
                          {roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => { setFilterRole(role); setIsRoleFilterOpen(false); }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                filterRole === role ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : 'hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${filterRole === role ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                                <svg className={`w-4 h-4 ${filterRole === role ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={role === 'all' ? 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' : 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'} />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-sm capitalize">{role === 'all' ? 'All Roles' : role}</div>
                                <div className={`text-xs ${filterRole === role ? 'text-white/80' : 'text-stone-500 dark:text-stone-400'}`}>
                                  {role === 'all' ? 'Show all users' : `${role} users only`}
                                </div>
                              </div>
                              {filterRole === role && (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Results Counter */}
                {(filterAction !== 'all' || filterRole !== 'all') && (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                      <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                        {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                    <button
                      onClick={() => { setFilterAction('all'); setFilterRole('all'); }}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline underline-offset-2"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>

              {/* Table Section */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-800 dark:via-orange-950/20 dark:to-stone-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faClipboardList} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Audit History</h3>
                          <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mt-0.5">All activity records</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-stone-600 dark:text-stone-400">Loading audit logs...</p>
                      </div>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faClipboardList} className="h-16 w-16 text-stone-300 dark:text-stone-700 mb-4" />
                        <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">No audit logs found</p>
                        <p className="text-stone-500 dark:text-stone-500 text-sm mt-2">Try adjusting your search</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-stone-800">
                        {filteredLogs.map((log) => (
                          <tr 
                            key={log.id}
                            className="hover:bg-orange-50/50 dark:hover:bg-stone-800/30 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-stone-900 dark:text-white flex items-center gap-1.5">
                                  <FontAwesomeIcon icon={faCalendarAlt} className="h-3.5 w-3.5 text-orange-500" />
                                  {formatDate(log.date)}
                                </span>
                                <span className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-1">
                                  <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                                  {formatTime(log.date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-semibold text-stone-900 dark:text-white">{log.username}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                                {log.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                {log.action}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-stone-600 dark:text-stone-400">{log.description || '-'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
