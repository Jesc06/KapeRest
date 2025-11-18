import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faClipboardList, faUser, faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from './AdminSidebar';
import LogoutPanel from '../Shared/LogoutPanel';

interface AuditLog {
  id: number;
  user: string;
  role: string;
  category: string; // Supplier, Product, Login
  action: string; // Add, Delete, Deliver
  affectedEntity: string; // SupplierName or ProductName
  description?: string; // Delivered 50 units of Latte
  date: string;
}

const AuditTrailPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData: AuditLog[] = [
          {
            id: 1,
            user: "Juan Dela Cruz",
            role: "Staff",
            category: "Product",
            action: "Add",
            affectedEntity: "Cappuccino",
            description: "Added new product Cappuccino to menu",
            date: "2025-11-18T08:30:00"
          },
          {
            id: 2,
            user: "Maria Santos",
            role: "Admin",
            category: "Supplier",
            action: "Add",
            affectedEntity: "Coffee Beans Co.",
            description: "Added new supplier Coffee Beans Co.",
            date: "2025-11-18T09:15:00"
          },
          {
            id: 3,
            user: "Pedro Reyes",
            role: "Staff",
            category: "Product",
            action: "Deliver",
            affectedEntity: "Latte",
            description: "Delivered 50 units of Latte",
            date: "2025-11-18T10:00:00"
          },
          {
            id: 4,
            user: "Ana Garcia",
            role: "Cashier",
            category: "Login",
            action: "Login",
            affectedEntity: "System",
            description: "User logged into the system",
            date: "2025-11-18T11:30:00"
          },
          {
            id: 5,
            user: "Juan Dela Cruz",
            role: "Staff",
            category: "Product",
            action: "Delete",
            affectedEntity: "Old Coffee Blend",
            description: "Deleted discontinued product Old Coffee Blend",
            date: "2025-11-18T12:45:00"
          },
          {
            id: 6,
            user: "Maria Santos",
            role: "Admin",
            category: "Supplier",
            action: "Delete",
            affectedEntity: "Discontinued Supplier Inc.",
            description: "Removed supplier Discontinued Supplier Inc.",
            date: "2025-11-18T13:20:00"
          },
          {
            id: 7,
            user: "Pedro Reyes",
            role: "Staff",
            category: "Product",
            action: "Deliver",
            affectedEntity: "Espresso",
            description: "Delivered 100 units of Espresso",
            date: "2025-11-18T14:15:00"
          },
        ];
        setAuditLogs(mockData);
        setIsLoading(false);
      }, 500);
    };

    fetchAuditLogs();
  }, []);

  // Get unique values for filters
  const categories = ['all', ...Array.from(new Set(auditLogs.map(log => log.category)))];
  const actions = ['all', ...Array.from(new Set(auditLogs.map(log => log.action)))];
  const roles = ['all', ...Array.from(new Set(auditLogs.map(log => log.role)))];

  // Filter audit logs
  const filteredLogs = auditLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.user.toLowerCase().includes(searchLower) ||
      log.affectedEntity.toLowerCase().includes(searchLower) ||
      (log.description?.toLowerCase().includes(searchLower) || false);
    
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesRole = filterRole === 'all' || log.role === filterRole;
    
    return matchesSearch && matchesCategory && matchesAction && matchesRole;
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Product':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Supplier':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Login':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
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
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Audit Trail</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {/* Filters */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 border border-neutral-100 dark:border-neutral-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search user or entity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Filter */}
                <div className="relative">
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {actions.map(action => (
                      <option key={action} value={action}>
                        {action === 'all' ? 'All Actions' : action}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role === 'all' ? 'All Roles' : role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden border border-neutral-100 dark:border-neutral-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Affected Entity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          Loading audit logs...
                        </td>
                      </tr>
                    ) : filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          No audit logs found
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-orange-50 dark:hover:bg-neutral-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faCalendar} className="h-3 w-3 text-neutral-500" />
                                {formatDate(log.date)}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1.5 mt-1">
                                <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                                {formatTime(log.date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{log.user}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                              {log.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(log.category)}`}>
                              {log.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-orange-600 dark:text-orange-400">{log.affectedEntity}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{log.description || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
