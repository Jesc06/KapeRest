import React, { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faBars, faCalendarDays, faCalendarAlt, faReceipt, faMoneyBillWave, faChartLine } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';

interface SalesRecord {
  id: number;
  menuItemName: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

interface SalesProps {
  sales: SalesRecord[];
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
  onToggleSidebarExpand?: () => void;
  selectedPeriod?: PeriodFilter;
  onPeriodChange?: (period: PeriodFilter) => void;
}

type PeriodFilter = 'daily' | 'monthly' | 'yearly';

const Sales: React.FC<SalesProps> = ({
  sales,
  onToggleSidebar,
  sidebarExpanded = true,
  onToggleSidebarExpand,
  selectedPeriod: propSelectedPeriod,
  onPeriodChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>(propSelectedPeriod || 'daily');

  // Sync with prop
  useEffect(() => {
    if (propSelectedPeriod) {
      setSelectedPeriod(propSelectedPeriod);
    }
  }, [propSelectedPeriod]);

  // Filter sales data (only by search, since API already filters by period)
  const filteredSales = useMemo(() => {
    return sales.filter(record => {
      const matchesSearch =
        record.id.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        record.menuItemName.toLowerCase().includes(searchText.toLowerCase()) ||
        record.status.toLowerCase().includes(searchText.toLowerCase());

      return matchesSearch;
    });
  }, [sales, searchText]);

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

  const periodFilters: { label: string; value: PeriodFilter; icon: any }[] = [
    { label: 'Daily', value: 'daily', icon: faCalendarDays },
    { label: 'Monthly', value: 'monthly', icon: faCalendarAlt },
    { label: 'Yearly', value: 'yearly', icon: faCalendarAlt },
  ];

  return (
    <>
      {/* Main Content */}
      <div className={`flex h-screen flex-1 flex-col bg-gradient-to-br from-neutral-50 via-white to-orange-50/20 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
        
        {/* Premium Top Bar with Glass Effect */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/95 dark:bg-neutral-900/95 border-b border-orange-200/30 dark:border-orange-900/30 shadow-xl shadow-orange-500/5 transition-all duration-300">
          <div className="px-4 sm:px-6 md:px-8 py-5">
            {/* Top Section */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-4">
              {/* Left Section */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu */}
                <button
                  onClick={onToggleSidebar}
                  className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 active:scale-95 hover:scale-105"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Desktop Sidebar Toggle */}
                <button
                  onClick={onToggleSidebarExpand}
                  className="hidden lg:flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-neutral-700 hover:bg-orange-50 dark:hover:bg-neutral-600 text-stone-700 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 border-2 border-orange-200/50 dark:border-neutral-600 hover:border-orange-400 dark:hover:border-orange-500 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 active:scale-95 hover:scale-105"
                  title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Page Title with Icon */}
                <div className="hidden sm:flex items-center gap-3">
                  <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent tracking-tight">Sales Analytics</h1>
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 mt-0.5">Track and analyze revenue performance</p>
                  </div>
                </div>
              </div>

              {/* Premium Search Bar */}
              <div className="flex-1 max-w-xl">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-orange-200/50 dark:border-orange-900/50 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:shadow-xl focus-within:shadow-orange-500/20 px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Search receipts, status..."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none"
                    />
                    {searchText && (
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                        {filteredSales.length} found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logout Panel */}
              <LogoutPanel />
            </div>

            {/* Period Filter with Premium Design */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 via-orange-400/10 to-orange-500/10 border-2 border-orange-300/50 dark:border-orange-700/50 shadow-md">
                <div className="h-2.5 w-2.5 rounded-full bg-orange-600 dark:bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
                <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Period</span>
              </div>
              
              <div className="flex gap-2.5">
                {periodFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      if (onPeriodChange) {
                        onPeriodChange(filter.value);
                      } else {
                        setSelectedPeriod(filter.value);
                      }
                    }}
                    className={`group relative flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 overflow-hidden ${
                      selectedPeriod === filter.value
                        ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-xl shadow-orange-500/50 scale-105 border-2 border-orange-400'
                        : 'bg-white dark:bg-neutral-800 text-stone-700 dark:text-stone-300 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {selectedPeriod === filter.value && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent animate-pulse"></div>
                    )}
                    <FontAwesomeIcon icon={filter.icon} className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden flex-col gap-6 px-4 sm:px-6 md:px-8 py-6">
        
        {/* Premium Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Total Transactions Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 shadow-2xl shadow-orange-500/30 hover:shadow-3xl hover:shadow-orange-500/40 transition-all duration-500 hover:-translate-y-3 border border-orange-400/30">
            {/* Animated Background Pattern */}
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
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-8 shadow-2xl shadow-green-500/30 hover:shadow-3xl hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-3 border border-emerald-400/30">
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
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-8 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-3 border border-blue-400/30">
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
        <div className="flex-1 min-h-0 flex flex-col rounded-3xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border-2 border-orange-200/30 dark:border-orange-900/30 transition-all duration-300">
          
          {/* Table Header with Gradient */}
          <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/30 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/50 dark:from-orange-950/20 dark:via-neutral-800 dark:to-orange-950/20">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700"></div>
            
            <div className="px-8 sm:px-10 py-7">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-xl shadow-orange-500/40">
                    <FontAwesomeIcon icon={faCoffee} className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent tracking-tight">Sales Records</h3>
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 mt-1">Complete transaction history</p>
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
                      <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">{filteredSales.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {filteredSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-stone-50 via-stone-100/80 to-stone-50 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 border-b-2 border-stone-300 dark:border-stone-700 backdrop-blur-sm">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">ID</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Items</span>
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
                      key={index}
                      className="group relative bg-white dark:bg-neutral-800 hover:bg-gradient-to-r hover:from-orange-50/70 hover:via-orange-50/40 hover:to-transparent dark:hover:from-orange-950/30 dark:hover:via-orange-950/15 dark:hover:to-transparent transition-all duration-300 cursor-pointer border-b border-orange-100/50 dark:border-orange-900/30"
                    >
                      {/* Hover Border Effect */}
                      <td className="px-6 py-5 relative">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                          #{record.id}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                          {record.menuItemName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                          {formatDate(record.dateTime)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">
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
              </div>
            ) : (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center px-4 max-w-md">
                  <div className="relative mb-8 inline-block">
                    {/* Animated Circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-28 w-28 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 animate-ping"></div>
                    </div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/40">
                      <FontAwesomeIcon icon={faSearch} className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-black text-stone-900 dark:text-white mb-3">
                    No Sales Found
                  </h4>
                  <p className="text-base font-medium text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
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
    </>
  );
};

export default Sales;
