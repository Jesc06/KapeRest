import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faSearch, 
  faBars,
  faCalendarAlt,
  faClock,
  faUser,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface AuditLog {
  id: number;
  username: string;
  role: string;
  action: string; // Add, Delete, Deliver
  description?: string; // Delivered 50 units of Latte
  date: string; // DateTime
}

const StaffAuditTrailPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const saved = localStorage.getItem('staffSidebar_expanded');
    return saved ? JSON.parse(saved) : true;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
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
        // Filter to show only Cashier role for staff view
        const cashierLogs = data.filter(log => log.role === 'Cashier');
        setAuditLogs(cashierLogs);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Filter logs based on search and filters
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;

    return matchesSearch && matchesAction;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getActionBadgeColor = (action: string) => {
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
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const toggleSidebar = () => {
    const newState = !isSidebarExpanded;
    setIsSidebarExpanded(newState);
    localStorage.setItem('staffSidebar_expanded', JSON.stringify(newState));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-stone-950">
      <div className="flex h-screen overflow-hidden">
        <StaffSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isExpanded={isSidebarExpanded} />

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${isSidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Premium Header */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-stone-200/50 dark:border-neutral-700/50 shadow-lg shadow-black/5">
            <div className="px-4 sm:px-6 md:px-8 py-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <button
                    onClick={toggleSidebar}
                    className="hidden lg:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 border border-stone-300 dark:border-neutral-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div className="hidden sm:flex items-center gap-3">
                    <div>
                      <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Audit Trail</h1>
                      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Activity logs</p>
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
                        placeholder="Search logs..."
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

                <LogoutPanel />
              </div>

              {/* Filter Section */}
              <div className="flex items-center gap-3 flex-wrap mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-stone-100 to-stone-200 dark:from-neutral-800 dark:to-neutral-700 border border-stone-300 dark:border-neutral-600">
                  <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Action</span>
                </div>
                
                <div className="flex gap-2">
                  {['all', 'Add', 'Delete', 'Deliver', 'Login', 'Logout'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedAction(filter)}
                      className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 overflow-hidden ${
                        selectedAction === filter
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105'
                          : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-700 hover:scale-105 active:scale-95'
                      }`}
                    >
                      {selectedAction === filter && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                      )}
                      <span className="relative z-10 capitalize">{filter}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 overflow-auto">

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
                          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Activity Logs</h3>
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">System audit trail</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-orange-200/60 dark:border-neutral-800 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-neutral-800/50 dark:via-neutral-700/50 dark:to-neutral-800/50">
                        <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100/50 dark:divide-neutral-800/50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-neutral-600 dark:text-neutral-400 font-medium">Loading audit logs...</p>
                          </td>
                        </tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <FontAwesomeIcon icon={faClipboardList} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                            <p className="text-neutral-600 dark:text-neutral-400 text-lg font-bold">No audit logs found</p>
                            <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Try adjusting your filters</p>
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => {
                          const { date, time } = formatDateTime(log.date);
                          return (
                            <tr 
                              key={log.id}
                              className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-amber-50/30 hover:to-orange-50/50 dark:hover:from-neutral-800/40 dark:hover:via-neutral-700/30 dark:hover:to-neutral-800/40 transition-all duration-300"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-orange-500" />
                                    {date}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                                    {time}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faUser} className="text-orange-500" />
                                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                    {log.username}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                  {log.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                  {log.description || '-'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAuditTrailPage;
