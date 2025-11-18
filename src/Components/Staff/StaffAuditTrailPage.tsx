import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClipboardList, 
  faSearch, 
  faBars,
  faCalendarAlt,
  faClock,
  faUser,
  faUserTag,
  faBolt
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from '../Shared/LogoutPanel';

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
  const [selectedRole, setSelectedRole] = useState('all');

  // Mock audit log data
  const auditLogs: AuditLog[] = [
    {
      id: 1,
      username: 'Maria Santos',
      role: 'Staff',
      action: 'Add',
      description: 'Added new product to menu: Caramel Macchiato with price ₱150',
      date: '2025-11-18T14:30:00'
    },
    {
      id: 2,
      username: 'Juan Dela Cruz',
      role: 'Staff',
      action: 'Add',
      description: 'Registered new supplier: Coffee Beans Co.',
      date: '2025-11-18T13:15:00'
    },
    {
      id: 3,
      username: 'Pedro Reyes',
      role: 'Staff',
      action: 'Deliver',
      description: 'Delivered 50 units of Latte',
      date: '2025-11-18T12:45:00'
    },
    {
      id: 4,
      username: 'Ana Garcia',
      role: 'Staff',
      action: 'Delete',
      description: 'Removed discontinued product from menu: Vanilla Frappe',
      date: '2025-11-18T11:20:00'
    },
    {
      id: 5,
      username: 'Carlos Lopez',
      role: 'Staff',
      action: 'Delete',
      description: 'Removed inactive supplier from system: Old Milk Supplier',
      date: '2025-11-18T10:00:00'
    },
    {
      id: 6,
      username: 'Rosa Martinez',
      role: 'Admin',
      action: 'Add',
      description: 'Created new branch: Main Street Branch',
      date: '2025-11-18T09:30:00'
    },
    {
      id: 7,
      username: 'Miguel Torres',
      role: 'Staff',
      action: 'Deliver',
      description: 'Delivered 100 units of Espresso',
      date: '2025-11-18T08:15:00'
    }
  ];

  // Filter logs based on search and filters
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.description && log.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesRole = selectedRole === 'all' || log.role === selectedRole;

    return matchesSearch && matchesAction && matchesRole;
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-orange-200/20 to-transparent dark:from-orange-900/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-amber-200/20 to-transparent dark:from-amber-900/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <StaffSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isExpanded={isSidebarExpanded}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <FontAwesomeIcon icon={faBars} className="text-neutral-600 dark:text-neutral-400" />
                </button>
                <button
                  onClick={toggleSidebar}
                  className="hidden lg:block p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <FontAwesomeIcon icon={faBars} className="text-neutral-600 dark:text-neutral-400" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Audit Trail
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                    System Activity Monitor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <LogoutPanel userRole="Staff" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 relative z-0">
          {/* Filters */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-6 mb-8 border border-orange-100 dark:border-orange-900/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faSearch} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="text"
                  placeholder="Search username or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Action Filter */}
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faBolt} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Actions</option>
                  <option value="Add">Add</option>
                  <option value="Delete">Delete</option>
                  <option value="Deliver">Deliver</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faUserTag} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden border border-orange-100 dark:border-orange-900/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-b border-neutral-200 dark:border-neutral-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                        <FontAwesomeIcon icon={faClipboardList} className="text-4xl mb-3 opacity-50" />
                        <p className="text-lg font-medium">No audit logs found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const { date, time } = formatDateTime(log.date);
                      return (
                        <tr 
                          key={log.id}
                          className="hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-colors"
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
        </main>
      </div>
    </div>
  );
};

export default StaffAuditTrailPage;
