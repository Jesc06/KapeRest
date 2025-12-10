import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faSearch, faCheckCircle, faCalendarXmark, faTimesCircle, faClock, faExclamationTriangle, faFireFlameCurved, faRefresh, faFilter, faBars } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar.tsx';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';
import TintedBackdrop from '../TintedBackdrop';

interface Voucher {
  id: number;
  code: string;
  discountPercent: number;
  maxUses: number;
  currentUses: number;
  expiryDate: string | null;
  isActive: boolean;
  createdDate: string;
  createdBy: string;
  description: string;
  customerId: number | null;
  isCustomerSpecific: boolean;
}

const VouchersPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'depleted' | 'inactive'>('all');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Voucher/GetActive`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch vouchers' }));
        throw new Error(errorData.error || 'Failed to fetch vouchers');
      }
      
      const data: Voucher[] = await response.json();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const getVoucherStatus = (voucher: Voucher): 'active' | 'expired' | 'depleted' | 'inactive' => {
    if (!voucher.isActive) return 'inactive';
    
    if (voucher.expiryDate) {
      const expirationDate = new Date(voucher.expiryDate);
      const now = new Date();
      
      if (expirationDate < now) return 'expired';
    }
    
    if (voucher.currentUses >= voucher.maxUses) return 'depleted';
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold border border-green-200 dark:border-green-800">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-800">
            <FontAwesomeIcon icon={faCalendarXmark} className="h-3 w-3" />
            Expired
          </span>
        );
      case 'depleted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800">
            <FontAwesomeIcon icon={faFireFlameCurved} className="h-3 w-3" />
            Used Up
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 text-xs font-bold border border-gray-200 dark:border-gray-800">
            <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3" />
            Inactive
          </span>
        );
      default:
        return null;
    }
  };

  const getDaysUntilExpiration = (expirationDate: string | null): number => {
    if (!expirationDate) return -1;
    const expDate = new Date(expirationDate);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (voucher.description && voucher.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const status = getVoucherStatus(voucher);
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && status === filterStatus;
  });

  const statusFilters = [
    { label: 'All', value: 'all' as const, icon: faFilter },
    { label: 'Active', value: 'active' as const, icon: faCheckCircle },
    { label: 'Expired', value: 'expired' as const, icon: faCalendarXmark },
    { label: 'Used Up', value: 'depleted' as const, icon: faFireFlameCurved },
    { label: 'Inactive', value: 'inactive' as const, icon: faTimesCircle },
  ];

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => getVoucherStatus(v) === 'active').length,
    expired: vouchers.filter(v => getVoucherStatus(v) === 'expired').length,
    depleted: vouchers.filter(v => getVoucherStatus(v) === 'depleted').length,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <TintedBackdrop />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

      <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
        
        {/* Premium Top Bar - Matching Sales.tsx */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-neutral-900/95 border-b-2 border-orange-200/30 dark:border-orange-900/30 shadow-xl shadow-orange-500/5 transition-all duration-300">
          <div className="px-4 sm:px-6 md:px-8 py-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              
              {/* Left Side: Sidebar Toggle & Search */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-300 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white shadow-lg transition-all active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Premium Search Bar - Matching Sales.tsx */}
                <div className="relative flex-1 max-w-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-400/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500 dark:text-orange-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-300">
                      <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search vouchers by code or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-5 py-3.5 rounded-2xl border-2 border-orange-200/50 dark:border-orange-900/50 bg-white dark:bg-neutral-800 text-stone-700 dark:text-stone-300 placeholder-stone-400 dark:placeholder-stone-500 text-sm font-semibold focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 hover:border-orange-300 dark:hover:border-orange-800 shadow-md hover:shadow-lg transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side: Logout Panel */}
              <LogoutPanel />
            </div>

            {/* Filter Buttons - Matching Sales.tsx */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
              {statusFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`relative overflow-hidden flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 ${
                    filterStatus === filter.value
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50'
                      : 'bg-white dark:bg-neutral-800 text-stone-600 dark:text-stone-400 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-700 hover:text-orange-600 dark:hover:text-orange-400 shadow-md hover:shadow-lg'
                  }`}
                >
                  {filterStatus === filter.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent animate-pulse"></div>
                  )}
                  <FontAwesomeIcon icon={filter.icon} className="h-4 w-4 relative z-10 mr-2" />
                  <span className="relative z-10">{filter.label}</span>
                </button>
              ))}

              {/* Refresh Button */}
              <button
                onClick={fetchVouchers}
                disabled={loading}
                className="ml-auto flex-shrink-0 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-300/50 dark:border-orange-700/50 text-orange-600 dark:text-orange-400 text-sm font-bold hover:bg-orange-100 dark:hover:bg-orange-900/30 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faRefresh} className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden flex-col gap-6 px-4 sm:px-6 md:px-8 py-6">
          
          {/* Premium Summary Cards - Matching Sales.tsx */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Vouchers Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 shadow-2xl shadow-orange-500/30 hover:shadow-3xl hover:shadow-orange-500/40 transition-all duration-500 hover:-translate-y-3 border border-orange-400/30">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                    <FontAwesomeIcon icon={faTicket} className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-stone-50 animate-pulse"></div>
                    <span className="text-xs font-bold text-white">Live</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Vouchers</p>
                  <p className="text-4xl font-black text-white">{stats.total}</p>
                  <p className="text-xs font-medium text-white/70">all vouchers</p>
                </div>
              </div>
            </div>

            {/* Active Vouchers Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-8 shadow-2xl shadow-green-500/30 hover:shadow-3xl hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-3 border border-emerald-400/30">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-7 w-7 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Active Vouchers</p>
                  <p className="text-4xl font-black text-white">{stats.active}</p>
                  <p className="text-xs font-medium text-white/70">ready to use</p>
                </div>
              </div>
            </div>

            {/* Expired Vouchers Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-8 shadow-2xl shadow-red-500/30 hover:shadow-3xl hover:shadow-red-500/40 transition-all duration-500 hover:-translate-y-3 border border-red-400/30">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                    <FontAwesomeIcon icon={faCalendarXmark} className="h-7 w-7 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Expired</p>
                  <p className="text-4xl font-black text-white">{stats.expired}</p>
                  <p className="text-xs font-medium text-white/70">no longer valid</p>
                </div>
              </div>
            </div>

            {/* Used Up Vouchers Card */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-8 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-3 border border-blue-400/30">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                    <FontAwesomeIcon icon={faFireFlameCurved} className="h-7 w-7 text-white" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/80">Used Up</p>
                  <p className="text-4xl font-black text-white">{stats.depleted}</p>
                  <p className="text-xs font-medium text-white/70">all claims used</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Vouchers Table */}
          <div className="flex-1 min-h-0 flex flex-col rounded-3xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border-2 border-orange-200/30 dark:border-orange-900/30 transition-all duration-300">
            
            {/* Table Header with Gradient */}
            <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/30 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/50 dark:from-orange-950/20 dark:via-neutral-800 dark:to-orange-950/20">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700"></div>
              
              <div className="px-8 sm:px-10 py-7">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-5">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-xl shadow-orange-500/40">
                      <FontAwesomeIcon icon={faTicket} className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent tracking-tight">Voucher Records</h3>
                      <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 mt-1">Complete voucher inventory</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-orange-600/15 border-2 border-orange-400/50 dark:border-orange-600/50 shadow-md">
                      <div className="h-2.5 w-2.5 rounded-full bg-orange-600 dark:bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
                      <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Active</span>
                    </div>
                    <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-300/50 dark:border-orange-700/50 shadow-md">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Records</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">{filteredVouchers.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-3 text-orange-600 dark:text-orange-400">
                      <div className="animate-spin h-8 w-8 border-4 border-orange-600 dark:border-orange-400 border-t-transparent rounded-full"></div>
                      <span className="text-lg font-bold">Loading vouchers...</span>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="inline-flex items-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6 text-red-600 dark:text-red-400" />
                      <span className="text-red-600 dark:text-red-400 font-bold">{error}</span>
                    </div>
                  </div>
                </div>
              ) : filteredVouchers.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FontAwesomeIcon icon={faTicket} className="h-16 w-16 text-stone-300 dark:text-stone-700 mb-4" />
                    <p className="text-stone-600 dark:text-stone-400 font-bold text-lg">No vouchers found</p>
                    <p className="text-stone-500 dark:text-stone-500 text-sm mt-2">Try adjusting your search or filter</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-stone-50 via-stone-100/80 to-stone-50 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 border-b-2 border-stone-300 dark:border-stone-700 backdrop-blur-sm">
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Code</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Description</span>
                        </th>
                        <th className="px-6 py-4 text-right">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Discount</span>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Usage</span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Expiration</span>
                        </th>
                        <th className="px-6 py-4 text-center">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Status</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVouchers.map((voucher, index) => {
                        const status = getVoucherStatus(voucher);
                        const daysUntilExpiration = getDaysUntilExpiration(voucher.expiryDate);
                        const isExpiringSoon = daysUntilExpiration <= 7 && daysUntilExpiration > 0;
                        
                        return (
                          <tr 
                            key={voucher.id} 
                            className={`group border-b border-stone-100 dark:border-stone-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white dark:bg-neutral-800' : 'bg-stone-50/30 dark:bg-neutral-800/50'
                            }`}
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                  <FontAwesomeIcon icon={faTicket} className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-black text-stone-900 dark:text-white text-sm tracking-wide">{voucher.code}</div>
                                  {voucher.isCustomerSpecific && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs font-bold">
                                      Customer Only
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-stone-700 dark:text-stone-300 font-medium text-sm">
                                {voucher.description || 'General voucher'}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-lg font-black shadow-md shadow-green-500/30">
                                {voucher.discountPercent}% OFF
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col items-center gap-2">
                                <span className="text-stone-900 dark:text-white font-bold text-sm">
                                  {voucher.currentUses} / {voucher.maxUses}
                                </span>
                                <div className="w-full max-w-[120px] bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      voucher.currentUses >= voucher.maxUses 
                                        ? 'bg-red-500' 
                                        : voucher.currentUses / voucher.maxUses > 0.8
                                        ? 'bg-orange-500'
                                        : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min((voucher.currentUses / voucher.maxUses) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-stone-900 dark:text-white font-semibold text-sm">
                                  {voucher.expiryDate 
                                    ? new Date(voucher.expiryDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric' 
                                      })
                                    : 'No expiry'
                                  }
                                </span>
                                {status === 'active' && voucher.expiryDate && (
                                  <div className="flex items-center gap-1.5">
                                    <FontAwesomeIcon icon={faClock} className={`h-3 w-3 ${isExpiringSoon ? 'text-orange-500' : 'text-green-500'}`} />
                                    <span className={`text-xs font-semibold ${isExpiringSoon ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                                      {daysUntilExpiration > 0 
                                        ? `${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''} left`
                                        : 'Expires today'
                                      }
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                              {getStatusBadge(status)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VouchersPage;
