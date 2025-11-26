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
  const actions = ['all', ...Array.from(new Set(auditLogs.map(log => log.action)))];
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

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-stone-200/50 dark:border-neutral-700/50 shadow-lg shadow-black/5">
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
                    className="hidden lg:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 border border-stone-300 dark:border-neutral-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div className="hidden sm:flex items-center gap-3">
                    <div>
                      <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Audit Trail</h1>
                      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Activity log history</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-stone-200 dark:border-neutral-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search user or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
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

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Action Filters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterAction('all')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterAction === 'all'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500'
                    }`}
                  >
                    All Actions
                  </button>
                  <button
                    onClick={() => setFilterAction('Add')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterAction === 'Add'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-emerald-500 dark:hover:border-emerald-500'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setFilterAction('Delete')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterAction === 'Delete'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-red-500 dark:hover:border-red-500'
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setFilterAction('Deliver')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterAction === 'Deliver'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500'
                    }`}
                  >
                    Deliver
                  </button>
                  <button
                    onClick={() => setFilterAction('Login')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterAction === 'Login'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setFilterAction('Logout')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterAction === 'Logout'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-purple-500 dark:hover:border-purple-500'
                    }`}
                  >
                    Logout
                  </button>
                </div>

                {/* Role Filters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterRole('all')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      filterRole === 'all'
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                    }`}
                  >
                    All Roles
                  </button>
                  {roles.filter(role => role !== 'all').map(role => (
                    <button
                      key={role}
                      onClick={() => setFilterRole(role)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                        filterRole === role
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Section */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-neutral-700">
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-white via-orange-50/30 to-white dark:from-neutral-800 dark:via-orange-950/20 dark:to-neutral-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faClipboardList} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Audit History</h3>
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">All activity records</p>
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
                        <p className="text-neutral-600 dark:text-neutral-400">Loading audit logs...</p>
                      </div>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faClipboardList} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">No audit logs found</p>
                        <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Try adjusting your search</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-neutral-800 bg-orange-50/50 dark:bg-neutral-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Username</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                        {filteredLogs.map((log) => (
                          <tr 
                            key={log.id}
                            className="hover:bg-orange-50/50 dark:hover:bg-neutral-800/30 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
                                  <FontAwesomeIcon icon={faCalendarAlt} className="h-3.5 w-3.5 text-orange-500" />
                                  {formatDate(log.date)}
                                </span>
                                <span className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 mt-1">
                                  <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                                  {formatTime(log.date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">{log.username}</span>
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
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">{log.description || '-'}</div>
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
