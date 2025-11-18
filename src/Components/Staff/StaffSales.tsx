import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faBars, faCalendarDays, faWeightScale, faCalendarAlt, faDownload, faReceipt, faMoneyBillWave, faPercentage, faChartLine, faSpinner } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import StaffSidebar from './StaffSidebar';

interface SalesRecord {
  receiptNumber: string;
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

type PeriodFilter = 'daily' | 'weekly' | 'monthly';

const StaffSales: React.FC<StaffSalesProps> = ({
  sales = [],
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('daily');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isGenerating, setIsGenerating] = useState<PeriodFilter | null>(null);

  // Helper function to get date range based on period
  const getDateRange = (period: PeriodFilter): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
    }

    return { start, end: new Date() };
  };

  // Filter sales data
  const filteredSales = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod);

    return sales.filter(record => {
      const recordDate = new Date(record.dateTime);
      const matchesDate = recordDate >= start && recordDate <= end;
      const matchesSearch =
        record.receiptNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        record.status.toLowerCase().includes(searchText.toLowerCase());

      return matchesDate && matchesSearch;
    });
  }, [sales, searchText, selectedPeriod]);

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

  // Handle report generation
  const handleGenerateReport = async (period: PeriodFilter) => {
    setIsGenerating(period);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would typically fetch or generate the report
    // For now, we'll just show a success message
    console.log(`${period.charAt(0).toUpperCase() + period.slice(1)} report generated`);
    
    setIsGenerating(null);
  };

  const periodFilters: { label: string; value: PeriodFilter; icon: any }[] = [
    { label: 'Daily', value: 'daily', icon: faCalendarDays },
    { label: 'Weekly', value: 'weekly', icon: faWeightScale },
    { label: 'Monthly', value: 'monthly', icon: faCalendarAlt },
  ];

  return (
    <div className={`flex h-screen flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
      {/* Sidebar */}
      <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-30 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-5 md:px-6 py-3 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
        {/* Mobile Top Section: Hamburger | Logout - ONLY on mobile */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
            >
              <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
            </button>

            {/* Mobile Logout Panel */}
            <LogoutPanel userRole="Staff" />
          </div>

          {/* Mobile Search Bar - Full Width Below */}
          <div className="flex items-center gap-3 pl-4 bg-white dark:bg-neutral-700 border border-stone-200 dark:border-neutral-600 rounded-lg p-2.5 shadow-sm focus-within:ring-2 focus-within:ring-orange-600/30 transition-all duration-300 mb-3">
            <FontAwesomeIcon
              icon={faSearch}
              className="h-4 w-4 text-neutral-500 dark:text-stone-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search receipt number..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-xs font-medium text-neutral-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 shadow-none focus:outline-none transition-all duration-300"
            />
          </div>
        </div>

        {/* Desktop Top Section: Sidebar Toggle | Search Bar | Logout - ONLY on desktop */}
        <div className="hidden lg:flex items-center justify-between gap-3 mb-3">
          {/* Left: Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </button>

          {/* Center: Desktop Search Bar */}
          <div className="flex-1 flex items-center gap-3 pl-4 sm:pl-5 bg-white dark:bg-neutral-700 border border-stone-200 dark:border-neutral-600 rounded-lg p-2.5 sm:p-3 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-orange-600/30 transition-all duration-300">
            <FontAwesomeIcon
              icon={faSearch}
              className="h-5 w-5 text-neutral-500 dark:text-stone-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search receipt number or status..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 shadow-none focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Right: Desktop Logout Panel */}
          <LogoutPanel userRole="Staff" />
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 items-center mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-stone-400 px-2">Period:</p>
          <div className="flex gap-2 flex-wrap">
            {periodFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedPeriod(filter.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-all duration-200 border ${
                  selectedPeriod === filter.value
                    ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 text-neutral-600 dark:text-stone-400 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
              >
                <FontAwesomeIcon icon={filter.icon} className="h-4 w-4" />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.label.slice(0, 1)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden flex-col gap-5 px-4 sm:px-6 md:px-8 py-5 bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Transactions Card */}
          <div className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-neutral-800 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-sm">
                <FontAwesomeIcon icon={faReceipt} className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600/70 dark:text-orange-400/70">Transactions</p>
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{filteredSales.length}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>

          {/* Total Revenue Card */}
          <div className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-neutral-800 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 shadow-sm">
                <FontAwesomeIcon icon={faMoneyBillWave} className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600/70 dark:text-green-400/70">Total Revenue</p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">₱{totals.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-green-500 to-green-600 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>

          {/* Total Tax Collected Card */}
          <div className="group relative overflow-hidden rounded-xl border border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-800 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm">
                <FontAwesomeIcon icon={faChartLine} className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">Tax Collected</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₱{totals.tax.toFixed(2)}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
          </div>
        </div>

        {/* Report Generation Section */}
        <div className="rounded-xl border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-1 rounded-full bg-orange-600"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-300">Generate Reports</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleGenerateReport('daily')}
              disabled={isGenerating !== null}
              className={`group relative flex items-center gap-2.5 rounded-lg px-5 py-3 text-sm font-bold transition-all duration-200 border overflow-hidden ${
                isGenerating === 'daily'
                  ? 'border-orange-600 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                  : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-stone-300 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95 shadow-sm hover:shadow-md'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <FontAwesomeIcon 
                icon={isGenerating === 'daily' ? faSpinner : faDownload} 
                className={`h-4 w-4 ${isGenerating === 'daily' ? 'animate-spin' : ''}`} 
              />
              <span>Daily Report</span>
              {isGenerating !== 'daily' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
            </button>

            <button
              onClick={() => handleGenerateReport('weekly')}
              disabled={isGenerating !== null}
              className={`group relative flex items-center gap-2.5 rounded-lg px-5 py-3 text-sm font-bold transition-all duration-200 border overflow-hidden ${
                isGenerating === 'weekly'
                  ? 'border-orange-600 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                  : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-stone-300 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95 shadow-sm hover:shadow-md'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <FontAwesomeIcon 
                icon={isGenerating === 'weekly' ? faSpinner : faDownload} 
                className={`h-4 w-4 ${isGenerating === 'weekly' ? 'animate-spin' : ''}`} 
              />
              <span>Weekly Report</span>
              {isGenerating !== 'weekly' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
            </button>

            <button
              onClick={() => handleGenerateReport('monthly')}
              disabled={isGenerating !== null}
              className={`group relative flex items-center gap-2.5 rounded-lg px-5 py-3 text-sm font-bold transition-all duration-200 border overflow-hidden ${
                isGenerating === 'monthly'
                  ? 'border-orange-600 bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                  : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-stone-300 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95 shadow-sm hover:shadow-md'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <FontAwesomeIcon 
                icon={isGenerating === 'monthly' ? faSpinner : faDownload} 
                className={`h-4 w-4 ${isGenerating === 'monthly' ? 'animate-spin' : ''}`} 
              />
              <span>Monthly Report</span>
              {isGenerating !== 'monthly' && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              )}
            </button>
          </div>
        </div>

        {/* Sales Table Container */}
        <div className="flex-1 flex flex-col rounded-xl border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="border-b border-stone-200 dark:border-neutral-700 bg-gradient-to-r from-orange-50/30 via-white to-orange-50/30 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-800 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 shadow-md">
                <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">Sales Records</h3>
                <p className="text-xs text-neutral-600 dark:text-stone-400 mt-0.5">View and analyze sales transactions</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Records</span>
                <span className="text-lg font-black text-orange-600 dark:text-orange-400">{filteredSales.length}</span>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {filteredSales.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-r from-stone-50 to-stone-100/50 dark:from-neutral-800/50 dark:to-neutral-800 sticky top-0 backdrop-blur-sm">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-orange-600"></div>
                        Receipt #
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">Date & Time</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">Subtotal</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">Tax</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">Discount</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">Total</th>
                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-stone-300 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((record, index) => (
                    <tr
                      key={index}
                      className="group border-b border-stone-200 dark:border-neutral-700 hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-transparent dark:hover:from-orange-950/10 dark:hover:to-transparent transition-all duration-200 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">
                        #{record.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-neutral-700 dark:text-stone-400">
                        {formatDate(record.dateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-stone-100 text-right tabular-nums">
                        ₱{record.subtotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-neutral-900 dark:text-stone-100 text-right tabular-nums">
                        ₱{record.tax.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-600 dark:text-purple-400 text-right tabular-nums">
                        ₱{record.discount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-base font-black text-green-600 dark:text-green-400 text-right tabular-nums">
                        ₱{record.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all duration-200 ${
                          record.status === 'Completed'
                            ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50'
                            : record.status === 'Pending'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                            : 'bg-stone-100 text-neutral-700 border border-stone-200 dark:bg-neutral-700/50 dark:text-stone-300 dark:border-neutral-600'
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            record.status === 'Completed'
                              ? 'bg-green-600 dark:bg-green-400'
                              : record.status === 'Pending'
                              ? 'bg-amber-600 dark:bg-amber-400 animate-pulse'
                              : 'bg-stone-600 dark:bg-stone-400'
                          }`}></div>
                          {record.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center py-20">
                <div className="text-center px-4 max-w-sm">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/40 dark:to-neutral-800 shadow-lg">
                    <FontAwesomeIcon icon={faSearch} className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="text-xl font-black text-neutral-900 dark:text-stone-100 mb-2">
                    No Sales Records Found
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-stone-400 leading-relaxed">
                    We couldn't find any sales matching your current filters. Try adjusting your search criteria or date range.
                  </p>
                  <div className="mt-6 flex justify-center gap-2">
                    <div className="h-1 w-12 rounded-full bg-orange-600/30"></div>
                    <div className="h-1 w-12 rounded-full bg-orange-600"></div>
                    <div className="h-1 w-12 rounded-full bg-orange-600/30"></div>
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
