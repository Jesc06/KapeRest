import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faChartLine, faCalendar, faBuilding, faMoneyBill, faClock, faSpinner, faSun, faCalendarWeek, faReceipt } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from './AdminSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface Sale {
  id: number;
  cashierName: string;
  branchName: string;
  branchLocation: string;
  email: string;
  menuItemName: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

const SalesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<'daily' | 'weekly' | 'monthly' | null>(null);

  // Fetch sales from API based on period filter
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        // Determine endpoint based on period filter
        let endpoint = '';
        if (filterPeriod === 'daily') {
          endpoint = `${API_BASE_URL}/AdminSalesReports/AdminDailyReports`;
        } else if (filterPeriod === 'monthly') {
          endpoint = `${API_BASE_URL}/AdminSalesReports/AdminMonthlyReports`;
        } else if (filterPeriod === 'yearly') {
          endpoint = `${API_BASE_URL}/AdminSalesReports/AdminYearlyReports`;
        }

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Sale[] = await response.json();
        setSales(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching sales:', err);
        setIsLoading(false);
      }
    };

    fetchSales();
  }, [filterPeriod]);

  // Get unique branches for filter
  const branches = ['all', ...Array.from(new Set(sales.map(s => s.branchName)))];

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      sale.id.toString().includes(searchLower) ||
      sale.menuItemName.toLowerCase().includes(searchLower) ||
      sale.cashierName.toLowerCase().includes(searchLower) ||
      sale.branchName.toLowerCase().includes(searchLower);
    
    const matchesBranch = filterBranch === 'all' || sale.branchName === filterBranch;
    
    return matchesSearch && matchesBranch;
  });

  // Calculate stats
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGenerateReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    setIsGenerating(type);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        alert('Please login first');
        setIsGenerating(null);
        return;
      }

      // Map type to correct endpoint
      let endpoint = '';
      if (type === 'daily') {
        endpoint = `${API_BASE_URL}/AdminSalesReports/AdminGenerateDailyPdfReports`;
      } else if (type === 'monthly') {
        endpoint = `${API_BASE_URL}/AdminSalesReports/AdminGenerateMonthlyPdfReports`;
      } else if (type === 'weekly') {
        endpoint = `${API_BASE_URL}/AdminSalesReports/AdminGenerateYearlyPdfReports`;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_sales_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
      setIsGenerating(null);
    } catch (err) {
      console.error(`Error generating ${type} report:`, err);
      alert(`Failed to generate ${type} report. Please try again.`);
      setIsGenerating(null);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FEF7EB' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-200/10 dark:bg-orange-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header with Glass Morphism */}
          <div className="sticky top-0 z-20 border-b border-orange-200/30 dark:border-neutral-700/50 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl shadow-lg shadow-orange-500/5">
            <div className="px-5 sm:px-7 md:px-9 py-5">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden flex-shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/30"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-xl shadow-orange-500/30"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                  </button>

                  <div>
                    <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Sales Analytics</h1>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Track and analyze revenue</p>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-stone-200 dark:border-neutral-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-orange-500 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Search by transaction ID, product, or cashier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          {filteredSales.length} found
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <LogoutPanel />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-6 px-5 sm:px-7 md:px-9 py-6 overflow-auto">
              
              {/* Filters and Generate Reports Section - Above Cards */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                {/* Left Side - Period Filters and Branch */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Period Label Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-stone-100 to-stone-200 dark:from-neutral-800 dark:to-neutral-700 border border-stone-300 dark:border-neutral-600">
                    <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></div>
                    <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Period</span>
                  </div>

                  {/* Period Filter Pills */}
                  <div className="flex gap-2">
                    {(['daily', 'monthly', 'yearly'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setFilterPeriod(period)}
                        className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 overflow-hidden ${
                          filterPeriod === period
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105'
                            : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-300 dark:hover:border-orange-700 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {filterPeriod === period && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                        )}
                        <span className="relative z-10">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Premium Branch Filter */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-stone-50 to-stone-100 dark:from-neutral-800 dark:to-neutral-700 border-2 border-stone-200 dark:border-neutral-600 hover:border-orange-300 dark:hover:border-orange-600 transition-all shadow-md hover:shadow-lg">
                      <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                      <select
                        value={filterBranch}
                        onChange={(e) => setFilterBranch(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-stone-700 dark:text-stone-300 focus:outline-none appearance-none cursor-pointer pr-8"
                      >
                        {branches.map(branch => (
                          <option key={branch} value={branch}>
                            {branch === 'all' ? 'All Branches' : branch}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500 dark:text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right Side - Generate Reports - Compact with Label on Top */}
                <div className="relative">
                  {/* Label Badge on Top Edge - Polished & Subtle */}
                  <div className="absolute -top-3 left-6 z-10">
                    <div className="px-3 py-1 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold tracking-wide shadow-sm border-2 border-white/25 backdrop-blur-sm">
                      Generate Report
                    </div>
                  </div>

                  {/* Cleaned Compact Card */}
                  <div className="relative flex items-center gap-2 px-4 py-3 pt-6 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 shadow-lg shadow-orange-300/20 ring-1 ring-orange-300/20 backdrop-blur-sm overflow-hidden">
                    {/* Subtle shimmer layer (reduced) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent opacity-60"></div>

                    {[
                      { type: 'daily', label: 'Daily', icon: faSun },
                      { type: 'monthly', label: 'Monthly', icon: faCalendar },
                      { type: 'weekly', label: 'Yearly', icon: faCalendarWeek }
                    ].map(({ type, label, icon }) => (
                      <button
                        key={type}
                        onClick={() => handleGenerateReport(type as any)}
                        disabled={isGenerating !== null}
                        className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-200 overflow-hidden
                          ${isGenerating === type
                            ? 'bg-white text-orange-600 shadow-sm scale-105 border border-orange-200'
                            : 'bg-white/95 text-orange-700 hover:bg-white hover:shadow-sm'}
                          disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <FontAwesomeIcon icon={icon} className={`h-3.5 w-3.5 relative z-10 ${isGenerating === type ? '' : 'text-orange-500'}`} />
                        <span className="relative z-10">{label}</span>
                        {isGenerating === type && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Premium Stats Cards with Vibrant Gradients */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                {/* Total Sales Card - Orange Gradient */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-6 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <FontAwesomeIcon icon={faReceipt} className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-orange-100 mb-1">Total Sales</p>
                      <p className="text-3xl font-bold text-white mb-1">₱{totalSales.toLocaleString()}</p>
                      <p className="text-xs text-orange-100/80">Revenue generated</p>
                    </div>
                  </div>
                </div>

                {/* Total Transactions Card - Green Gradient */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-6 shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-emerald-100 mb-1">Transactions</p>
                      <p className="text-3xl font-bold text-white mb-1">{totalTransactions}</p>
                      <p className="text-xs text-emerald-100/80">Total count</p>
                    </div>
                  </div>
                </div>

                {/* Average Sale Card - Blue Gradient */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-6 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <FontAwesomeIcon icon={faMoneyBill} className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-blue-100 mb-1">Average Sale</p>
                      <p className="text-3xl font-bold text-white mb-1">₱{averageSale.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-blue-100/80">Per transaction</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Table */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-neutral-700 transition-all duration-300">
                
                {/* Table Header with Gradient */}
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-white via-orange-50/30 to-white dark:from-neutral-800 dark:via-orange-950/20 dark:to-neutral-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-7 sm:px-9 py-7">
                    <div className="flex items-center justify-between flex-wrap gap-5">
                      <div className="flex items-center gap-5">
                        <div className="flex h-15 w-15 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faReceipt} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Sales Records</h3>
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">Complete transaction history</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-300 dark:border-orange-700/50">
                          <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></div>
                          <span className="text-sm font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">Active</span>
                        </div>
                        <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-600 border border-stone-300 dark:border-neutral-600">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Records</span>
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">{filteredSales.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <FontAwesomeIcon icon={faSpinner} className="h-8 w-8 text-orange-500 animate-spin" />
                        <p className="text-stone-600 dark:text-stone-400 font-medium">Loading sales data...</p>
                      </div>
                    </div>
                  ) : filteredSales.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          <FontAwesomeIcon icon={faReceipt} className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 font-medium">No sales found</p>
                        <p className="text-sm text-stone-500 dark:text-stone-500">Try adjusting your filters</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gradient-to-r from-stone-50 via-stone-100/80 to-stone-50 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 border-b-2 border-stone-300 dark:border-neutral-700 backdrop-blur-sm">
                          <th className="px-7 py-4 text-left">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                              <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">ID</span>
                            </div>
                          </th>
                          <th className="px-7 py-4 text-left">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Menu Item</span>
                          </th>
                          <th className="px-7 py-4 text-left">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Cashier</span>
                          </th>
                          <th className="px-7 py-4 text-left">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Branch</span>
                          </th>
                          <th className="px-7 py-4 text-right">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Subtotal</span>
                          </th>
                          <th className="px-7 py-4 text-right">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Tax</span>
                          </th>
                          <th className="px-7 py-4 text-right">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Discount</span>
                          </th>
                          <th className="px-7 py-4 text-right">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Total</span>
                          </th>
                          <th className="px-7 py-4 text-center">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Status</span>
                          </th>
                          <th className="px-7 py-4 text-left">
                            <span className="text-sm font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">Date & Time</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 dark:divide-neutral-700">
                        {filteredSales.map((sale) => (
                          <tr
                            key={sale.id}
                            className="group relative bg-white dark:bg-neutral-800 hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-orange-50/30 hover:to-transparent dark:hover:from-orange-950/20 dark:hover:via-orange-950/10 dark:hover:to-transparent transition-all duration-300 cursor-pointer"
                          >
                            <td className="px-7 py-5 relative">
                              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="text-sm font-black text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                                #{sale.id}
                              </span>
                            </td>
                            <td className="px-7 py-5">
                              <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                {sale.menuItemName}
                              </span>
                            </td>
                            <td className="px-7 py-5">
                              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                {sale.cashierName}
                              </span>
                            </td>
                            <td className="px-7 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                  {sale.branchName}
                                </span>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {sale.branchLocation}
                                </span>
                              </div>
                            </td>
                            <td className="px-7 py-5 text-right">
                              <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
                                ₱{sale.subtotal.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-7 py-5 text-right">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                                ₱{sale.tax.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-7 py-5 text-right">
                              <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                                ₱{sale.discount.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-7 py-5 text-right">
                              <span className="text-base font-black text-green-600 dark:text-green-400 tabular-nums">
                                ₱{sale.total.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-7 py-5 text-center">
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 group-hover:scale-105 ${
                                sale.status === 'Completed' 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                                  : sale.status === 'Pending'
                                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-yellow-500/30'
                                  : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/30'
                              }`}>
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                                {sale.status}
                              </span>
                            </td>
                            <td className="px-7 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {formatDate(sale.dateTime).split(',')[0]}
                                </span>
                                <span className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                                  <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                                  {formatTime(sale.dateTime)}
                                </span>
                              </div>
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

export default SalesPage;
