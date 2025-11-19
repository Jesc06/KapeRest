import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUsers, faBuilding, faSearch, faCheck, faTimes, faEye, faUserCircle, faEnvelope, faCalendar, faUserTag, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';
import MessageBox from '../Shared/MessageBox';
import ConfirmationDialog from '../Shared/ConfirmationDialog';

interface Branch {
  id?: number;
  branchName: string;
  location: string;
}

interface PendingAccount {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  branchId?: number | null;
  branch?: Branch | null;
  cashierId?: string | null;
}

const AccountsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageBox, setMessageBox] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const [rejectionDialog, setRejectionDialog] = useState<{ isOpen: boolean; accountId: number | null }>({
    isOpen: false,
    accountId: null,
  });

  // Fetch pending accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/RegisterPendingAccount/GetAllPendingAccounts`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch accounts: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Pending accounts received:', data);
        setAccounts(data || []);
        
        // Extract unique branches from accounts
        const uniqueBranches = Array.from(
          new Map(
            data
              .filter((acc: PendingAccount) => acc.branch)
              .map((acc: PendingAccount) => [acc.branch!.id, acc.branch!])
          ).values()
        ) as Branch[];
        
        setBranches(uniqueBranches);
      } catch (err) {
        console.error('Error fetching pending accounts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const roles = ['all', 'Admin', 'Cashier', 'Staff'];

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || account.role === filterRole;
    const matchesBranch = filterBranch === 'all' || account.branch?.branchName === filterBranch;
    
    return matchesSearch && matchesRole && matchesBranch;
  });

  // Handle approve/reject
  const handleApprove = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/RegisterPendingAccount/ApprovePendingAccount/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to approve account: ${response.status}`);
      }

      setAccounts(accounts.map(acc => 
        acc.id === id ? { ...acc, status: 'Approved' as const } : acc
      ));
      setMessageBox({
        isOpen: true,
        title: 'Account Approved',
        message: 'The user account has been successfully approved.',
        type: 'success',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve account';
      console.error('Error approving account:', err);
      setError(errorMessage);
      setMessageBox({
        isOpen: true,
        title: 'Approval Failed',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const openRejectDialog = (id: number) => {
    setRejectionDialog({ isOpen: true, accountId: id });
  };

  const confirmReject = () => {
    if (rejectionDialog.accountId) {
      handleReject(rejectionDialog.accountId);
    }
    setRejectionDialog({ isOpen: false, accountId: null });
  };

  const handleReject = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/RegisterPendingAccount/RejectPendingAccount/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reject account: ${response.status}`);
      }

      setAccounts(accounts.map(acc => 
        acc.id === id ? { ...acc, status: 'Rejected' as const } : acc
      ));
      setMessageBox({
        isOpen: true,
        title: 'Account Rejected',
        message: 'The user account has been successfully rejected.',
        type: 'success',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject account';
      console.error('Error rejecting account:', err);
      setError(errorMessage);
      setMessageBox({
        isOpen: true,
        title: 'Rejection Failed',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFullName = (account: PendingAccount) => {
    return `${account.firstName} ${account.middleName} ${account.lastName}`.trim();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-stone-50 to-orange-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />
      
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all duration-200 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hidden lg:flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-white">Account Management</h1>
            </div>
            <LogoutPanel />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-5 md:px-6 py-5 sm:py-6">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <FontAwesomeIcon icon={faUsers} className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
                      Pending Accounts
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                      Review and manage user account registration requests
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-md" role="alert">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}

              {/* Filters and Search */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border-2 border-stone-200 dark:border-neutral-700 p-6 mb-6 shadow-lg">
                <div className="flex flex-col gap-6">
                  {/* Search Bar */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                      <label className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Search Accounts
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                      <label className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Filter Options
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Role Filter */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                          Role
                        </label>
                        <div className="relative">
                          <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full appearance-none pl-12 pr-12 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>
                                {role === 'all' ? 'All Roles' : role}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faUserTag} className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Branch Filter */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                          Branch
                        </label>
                        <div className="relative">
                          <select
                            value={filterBranch}
                            onChange={(e) => setFilterBranch(e.target.value)}
                            className="w-full appearance-none pl-12 pr-12 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <option value="all">All Branches</option>
                            {branches.map(branch => (
                              <option key={branch.branchName} value={branch.branchName}>
                                {branch.branchName}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Counter */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                        Showing <span className="text-orange-600 dark:text-orange-400 font-black">{filteredAccounts.length}</span> of <span className="font-black">{accounts.length}</span> accounts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accounts Table */}
              <div className="overflow-x-auto bg-white dark:bg-neutral-800 rounded-2xl border-2 border-stone-200 dark:border-neutral-700 shadow-lg">
                <table className="w-full text-sm text-left text-neutral-600 dark:text-neutral-300">
                  <thead className="text-xs text-neutral-700 dark:text-neutral-200 uppercase bg-stone-50 dark:bg-neutral-700/50 border-b-2 border-stone-200 dark:border-neutral-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Email
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Branch
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Registered
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-neutral-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Loading accounts...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <FontAwesomeIcon icon={faTimes} className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Failed to load accounts</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">{error}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAccounts.length > 0 ? (
                      filteredAccounts.map((account) => (
                        <tr key={account.id} className="group hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors duration-200">
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                                <FontAwesomeIcon icon={faUserCircle} className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-neutral-900 dark:text-white">{getFullName(account)}</p>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">ID: {account.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5 text-orange-500" />
                              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{account.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle text-center">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                              account.role === 'Admin'
                                ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                                : account.role === 'Cashier'
                                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                                : 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                            }`}>
                              {account.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {account.branch ? (
                              <div>
                                <div className="flex items-center gap-2">
                                  <FontAwesomeIcon icon={faBuilding} className="h-3.5 w-3.5 text-orange-500" />
                                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{account.branch.branchName}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3 w-3 text-neutral-400" />
                                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{account.branch.location}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500">No branch</span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faCalendar} className="h-3.5 w-3.5 text-orange-500" />
                              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{formatDate(account.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <div className="flex items-center justify-center gap-2">
                              {account.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleApprove(account.id)}
                                    className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors duration-200 flex items-center justify-center group/btn"
                                    title="Approve"
                                  >
                                    <FontAwesomeIcon icon={faCheck} className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                  </button>
                                  <button 
                                    onClick={() => openRejectDialog(account.id)}
                                    className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-200 flex items-center justify-center group/btn"
                                    title="Reject"
                                  >
                                    <FontAwesomeIcon icon={faTimes} className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                  </button>
                                </>
                              )}
                              <button className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors duration-200 flex items-center justify-center group/btn"
                                title="View Details"
                              >
                                <FontAwesomeIcon icon={faEye} className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <FontAwesomeIcon icon={faUsers} className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
                              <p className="text-lg font-bold text-neutral-500 dark:text-neutral-400">No accounts found</p>
                              <p className="text-sm text-neutral-400 dark:text-neutral-500">Try adjusting your filters or search query</p>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
      <MessageBox
        isOpen={messageBox.isOpen}
        onClose={() => setMessageBox({ ...messageBox, isOpen: false })}
        title={messageBox.title}
        message={messageBox.message}
        type={messageBox.type}
      />
      <ConfirmationDialog
        isOpen={rejectionDialog.isOpen}
        onClose={() => setRejectionDialog({ isOpen: false, accountId: null })}
        onConfirm={confirmReject}
        title="Confirm Rejection"
        message="Are you sure you want to reject this account? This action cannot be undone."
      />
    </div>
  );
};

export default AccountsPage;
