import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faBars, faCalendarDays, faWeightScale, faCalendarAlt, faReceipt, faMoneyBillWave, faChartLine, faSpinner, faSun, faCalendar } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import StaffSidebar from './StaffSidebar';

interface SalesRecord {
  id: number | string;
  receiptNumber: string; // derived string version of id
  username?: string;
  fullName?: string;
  email?: string;
  branchName?: string;
  branchLocation?: string;
  menuItemName?: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

interface StaffSalesProps {
  sales?: SalesRecord[];
}

type PeriodFilter = 'daily' | 'monthly' | 'yearly';

import { API_BASE_URL } from '../../config/api';

const StaffSales: React.FC<StaffSalesProps> = ({
  sales = [],
}) => {
  const [salesState, setSalesState] = useState<SalesRecord[]>(sales);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('daily');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState<PeriodFilter | null>(null);

  // Filter sales data - API already filters by period, so we only filter by search
  const filteredSales = useMemo(() => {
    // Remove date filtering - show all sales from API
    return salesState.filter(record => {
      const matchesSearch =
        (record.receiptNumber ?? '').toString().toLowerCase().includes(searchText.toLowerCase()) ||
        (record.status ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (record.menuItemName ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (record.username ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (record.fullName ?? '').toLowerCase().includes(searchText.toLowerCase()) ||
        (record.branchName ?? '').toLowerCase().includes(searchText.toLowerCase());

      return matchesSearch;
    });
  }, [salesState, searchText]);

  // Fetch sales data for current cashier and period
  useEffect(() => {
    const fetchSalesData = async (period: PeriodFilter) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setLoading(false);
          return;
        }

        // Decode JWT to get cashierId (similar to other pages)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        const cashierId = decoded.cashierId as string | undefined;

        if (!cashierId) {
          console.error('Cashier ID not found in token');
          setLoading(false);
          return;
        }

        console.log('Fetching sales for cashierId:', cashierId, 'period:', period);

        let endpoint = '';
        switch (period) {
          case 'daily':
            endpoint = 'CashierDailySales';
            break;
          case 'monthly':
            endpoint = 'CashierMonthlySales';
            break;
          case 'yearly':
            endpoint = 'CashierYearlySales';
            break;
          default:
            endpoint = 'CashierDailySales';
            break;
        }

        const url = `${API_BASE_URL}/CashierSalesReport/${endpoint}?cashierId=${cashierId}`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch sales: ${response.status}`);
        }

        const data = await response.json();
        console.log('Sales data received:', data);

        // Map the API DTO into our sales record shape
        const mapped: SalesRecord[] = data.map((item: any) => ({
          id: item.id ?? item.Id ?? '',
          receiptNumber: `${item.id ?? item.Id ?? ''}`,
          username: item.username ?? item.email ?? '',
          fullName: item.fullName ?? `${item.username ?? ''}`,
          email: item.email ?? '',
          branchName: item.branchName ?? '',
          branchLocation: item.branchLocation ?? '',
          menuItemName: item.menuItemName ?? item.menuItem ?? '',
          dateTime: item.dateTime ?? item.date ?? '',
          subtotal: item.subtotal ?? 0,
          tax: item.tax ?? 0,
          discount: item.discount ?? 0,
          total: item.total ?? 0,
          status: item.status ?? 'Pending',
        }));

        console.log('Mapped sales records:', mapped.length);
        setSalesState(mapped);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching sales';
        setError(errorMsg);
        console.error('Error fetching sales data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData(selectedPeriod);
  }, [selectedPeriod]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredSales.reduce(
      (acc, record) => ({
        subtotal: acc.subtotal + record.subtotal,
        tax: acc.tax + record.tax,
        discount: acc.discount + record.discount,
        total: acc.total + record.total,
      }),
      { subtotal: 0, tax: 0, discount: 0, total: 0 }
    );
  }, [filteredSales]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle report generation - connect to PDF endpoints
  const handleGenerateReport = async (period: PeriodFilter) => {
    setIsGenerating(period);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('You must be logged in to generate reports.');
        setIsGenerating(null);
        return;
      }

      // decode JWT to get cashierId similar to other components
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      const cashierId = decoded.cashierId as string | undefined;
      if (!cashierId) {
        setError('Unable to determine cashier id for report generation.');
        setIsGenerating(null);
        return;
      }

      // Map UI periods to API endpoints
      let endpoint = '';
      switch (period) {
        case 'daily':
          endpoint = 'CashierGenerateDailyPdfReports';
          break;
        case 'monthly':
          endpoint = 'CashierGenerateMonthlyPdfReports';
          break;
        case 'yearly':
          endpoint = 'CashierGenerateYearlyPdfReports';
          break;
      }

      const response = await fetch(`${API_BASE_URL}/CashierSalesReport/${endpoint}?cashierId=${cashierId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // server returned an error
        throw new Error(`Failed to generate report: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      // Try to get filename from content-disposition if present
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'report.pdf';
      if (contentDisposition) {
        const match = /filename="?([^";]+)"?/.exec(contentDisposition);
        if (match && match[1]) fileName = match[1];
      } else {
        // fallback to endpoint-based name
        if (endpoint.includes('Daily')) fileName = 'CashierDailySalesReport.pdf';
        if (endpoint.includes('Yearly')) fileName = 'CashierYearlySalesReport.pdf';
        if (endpoint.includes('Monthly')) fileName = 'CashierMonthlySalesReport.pdf';
      }

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error generating report';
      // Add actionable hint in case of connection/refused errors
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('NetworkError when attempting to fetch resource.')) {
        setError('Failed to connect to the backend API. Ensure the backend is running (dotnet run) and the base URL is correct.');
      } else {
        setError(msg);
      }
      console.error('Generate report error:', err);
    } finally {
      setIsGenerating(null);
    }
  };

  const periodFilters: { label: string; value: PeriodFilter; icon: any }[] = [
    { label: 'Daily', value: 'daily', icon: faCalendarDays },
    { label: 'Monthly', value: 'monthly', icon: faWeightScale },
    { label: 'Yearly', value: 'yearly', icon: faCalendarAlt },
  ];

  return (
    <div className={`flex h-screen flex-col bg-gradient-to-br from-neutral-50 via-white to-orange-50/20 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
      {/* Sidebar */}
      <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

      {/* Premium Top Bar with Glass Effect */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-stone-50/90 dark:bg-stone-900/95 border-b border-stone-200/50 dark:border-stone-700/50 shadow-lg shadow-black/5 transition-all duration-300">
        <div className="px-4 sm:px-6 md:px-8 py-4">
        {/* Mobile Top Section */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 active:scale-95 hover:scale-105"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
            <LogoutPanel />
          </div>

          {/* Mobile Search Bar */}
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              <FontAwesomeIcon
                icon={faSearch}
                className="h-5 w-5 text-neutral-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors"
              />
                <input
                type="text"
                placeholder="Search receipts, item, cashier, status..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
              />
              {searchText && (
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                  {filteredSales.length} found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Top Section */}
        <div className="hidden lg:flex items-center justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 border border-stone-300 dark:border-stone-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 hover:scale-105"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Sales Analytics</h1>
              <p className="text-xs font-medium text-neutral-600 dark:text-stone-400">Track and analyze revenue</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="h-5 w-5 text-neutral-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Search receipts, item, cashier, status..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
                />
                {searchText && (
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                    {filteredSales.length} found
                  </span>
                )}
              </div>
            </div>
          </div>

          <LogoutPanel />
        </div>

        {/* Period Filter with Premium Design */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-stone-100 to-stone-200 dark:from-neutral-800 dark:to-neutral-700 border border-stone-300 dark:border-stone-600">
              <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Period</span>
            </div>
            
            <div className="flex gap-2">
              {periodFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedPeriod(filter.value)}
                  className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 overflow-hidden ${
                    selectedPeriod === filter.value
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 scale-105'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-700 hover:scale-105 active:scale-95'
                  }`}
                >
                  {selectedPeriod === filter.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                  )}
                  <FontAwesomeIcon icon={filter.icon} className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Reports - Polished Compact (matches Admin) */}
          <div className="relative">
            {/* Top label (compact) */}
            <div className="absolute -top-3 left-5 z-10">
              <div className="px-3 py-1 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-semibold tracking-wide shadow-sm border-2 border-white/20 backdrop-blur-sm">
                Generate Report
              </div>
            </div>

            {/* Compact Gradient Card */}
            <div className="relative flex items-center gap-2 px-5 py-3 pt-6 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 shadow-md shadow-orange-300/20 ring-1 ring-orange-300/20 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/6 to-transparent opacity-60"></div>

              {[{ t: 'daily', icon: faSun, label: 'Daily' }, { t: 'monthly', icon: faWeightScale, label: 'Monthly' }, { t: 'yearly', icon: faCalendar, label: 'Yearly' }].map(({ t, icon, label }) => (
                <button
                  key={t}
                  onClick={() => handleGenerateReport(t as any)}
                  disabled={isGenerating !== null}
                  className={`group relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors duration-200 overflow-hidden
                    ${isGenerating === t
                      ? 'bg-stone-50 text-orange-600 shadow-sm scale-105 border border-orange-200'
                      : 'bg-stone-50/95 text-orange-700 hover:bg-stone-50 hover:shadow-sm'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FontAwesomeIcon icon={isGenerating === t ? faSpinner : icon} className={`h-4 w-4 relative z-10 ${isGenerating === t ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">{label}</span>
                  {isGenerating === t && <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden flex-col gap-6 px-4 sm:px-6 md:px-8 py-6">
        
        {/* Premium Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total Transactions Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faReceipt} className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-50 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Live</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Transactions</p>
                <p className="text-4xl font-black text-white">{filteredSales.length}</p>
                <p className="text-xs font-medium text-white/70">receipts processed</p>
              </div>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-6 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faChartLine} className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Revenue</p>
                <p className="text-4xl font-black text-white">₱{totals.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs font-medium text-white/70">gross income</p>
              </div>
            </div>
          </div>

          {/* Tax Collected Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faChartLine} className="h-7 w-7 text-white" />
                </div>
                <div className="text-xs font-bold text-white/80 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                  12% VAT
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Tax Collected</p>
                <p className="text-4xl font-black text-white">₱{totals.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs font-medium text-white/70">value added tax</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Sales Table */}
        <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-stone-700 transition-all duration-300">
          
          {/* Table Header with Gradient */}
          <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-white via-orange-50/30 to-white dark:from-neutral-800 dark:via-orange-950/20 dark:to-neutral-800">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
            
            <div className="px-6 sm:px-8 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                    <FontAwesomeIcon icon={faCoffee} className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Sales Records</h3>
                    <p className="text-sm font-medium text-neutral-600 dark:text-stone-400 mt-0.5">Complete transaction history</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-300 dark:border-orange-700/50">
                    <div className="h-2 w-2 rounded-full bg-orange-600 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">Active</span>
                  </div>
                  <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-600 border border-stone-300 dark:border-stone-600">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-stone-400">Records</span>
                      <span className="text-2xl font-black text-neutral-900 dark:text-white">{filteredSales.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center px-4 max-w-md">
                  <div className="relative mb-8 inline-block">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/40">
                      <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 text-white animate-spin" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">Loading sales...</h4>
                  <p className="text-base font-medium text-neutral-600 dark:text-stone-400 leading-relaxed mb-6">Please wait while we retrieve sales data.</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center px-4 max-w-md">
                  <div className="relative mb-8 inline-block">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-red-500/20 shadow-2xl shadow-red-500/20">
                      <FontAwesomeIcon icon={faSpinner} className="h-12 w-12 text-red-600" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">Error loading sales</h4>
                  <p className="text-base font-medium text-neutral-600 dark:text-stone-400 leading-relaxed mb-6">{error}</p>
                </div>
              </div>
            ) : filteredSales.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-stone-50 via-stone-100/80 to-stone-50 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 border-b-2 border-stone-300 dark:border-stone-700 backdrop-blur-sm">
                        <th className="px-6 py-4 text-left">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Receipt #</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Item</span>
                        </th>
                        <th className="px-6 py-4 text-left hidden sm:table-cell">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Cashier</span>
                        </th>
                        <th className="px-6 py-4 text-left hidden lg:table-cell">
                          <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Branch</span>
                        </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Date & Time</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Subtotal</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Tax</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Discount</span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Total</span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Status</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-neutral-700">
                  {filteredSales.map((record, index) => (
                    <tr
                      key={record.id ?? record.receiptNumber ?? index}
                      className="group relative bg-stone-50 dark:bg-stone-800 hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-orange-50/30 hover:to-transparent dark:hover:from-orange-950/20 dark:hover:via-orange-950/10 dark:hover:to-transparent transition-all duration-300 cursor-pointer"
                    >
                      <td className="px-6 py-5 relative">
                        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                          #{record.receiptNumber}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{record.menuItemName || '—'}</span>
                      </td>
                      <td className="px-6 py-5 text-left hidden sm:table-cell">
                        <span className="text-sm text-stone-700 dark:text-stone-300">{record.fullName ?? record.username ?? '—'}</span>
                      </td>
                      <td className="px-6 py-5 text-left hidden lg:table-cell">
                        <span className="text-sm text-stone-700 dark:text-stone-300">{record.branchName ?? '—'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{formatDate(record.dateTime)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
                          ₱{record.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                          ₱{record.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-pink-600 dark:text-pink-400 tabular-nums">
                          ₱{record.discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-base font-black text-green-600 dark:text-green-400 tabular-nums">
                          ₱{record.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all duration-300 group-hover:scale-105 ${
                          record.status === 'Completed'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                            : record.status === 'Pending'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30'
                            : 'bg-gradient-to-r from-stone-400 to-stone-500 text-white shadow-stone-500/30'
                        }`}>
                          <div className={`h-2 w-2 rounded-full ${
                            record.status === 'Completed'
                              ? 'bg-white'
                              : record.status === 'Pending'
                              ? 'bg-stone-50 animate-pulse'
                              : 'bg-stone-50/70'
                          }`}></div>
                          {record.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center px-4 max-w-md">
                  <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-28 w-28 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 animate-ping"></div>
                    </div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/40">
                      <FontAwesomeIcon icon={faSearch} className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-black text-neutral-900 dark:text-white mb-3">
                    No Sales Found
                  </h4>
                  <p className="text-base font-medium text-neutral-600 dark:text-stone-400 leading-relaxed mb-6">
                    We couldn't find any sales matching your current filters. Try adjusting your search criteria or date range.
                  </p>
                  
                  <div className="flex justify-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-30"></div>
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-30"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaffSales;
