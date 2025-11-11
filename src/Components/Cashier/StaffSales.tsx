import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faBars, faCalendarDays, faWeightScale, faCalendarAlt, faDownload, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from './LogoutPanel';
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
    <div className={`flex h-screen flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
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
            className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
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
        {/* Report Generation Buttons */}
        <div className="flex flex-wrap gap-3 rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
          <p className="w-full text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-stone-400 mb-1">Generate Reports:</p>
          
          <button
            onClick={() => handleGenerateReport('daily')}
            disabled={isGenerating !== null}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 border ${
              isGenerating === 'daily'
                ? 'border-orange-600 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-stone-400 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95'
            } disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
          >
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            <span>Daily Report</span>
          </button>

          <button
            onClick={() => handleGenerateReport('weekly')}
            disabled={isGenerating !== null}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 border ${
              isGenerating === 'weekly'
                ? 'border-orange-600 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-stone-400 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95'
            } disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
          >
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            <span>Weekly Report</span>
          </button>

          <button
            onClick={() => handleGenerateReport('monthly')}
            disabled={isGenerating !== null}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 border ${
              isGenerating === 'monthly'
                ? 'border-orange-600 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400'
                : 'border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-stone-400 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 active:scale-95'
            } disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md`}
          >
            <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            <span>Monthly Report</span>
          </button>
        </div>

        {/* Sales Table Container */}
        <div className="flex-1 flex flex-col rounded-xl border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-stone-200 dark:border-neutral-800 bg-gradient-to-r from-stone-50 to-white dark:from-neutral-800 dark:to-neutral-900 px-6 py-5">
            <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
              <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              <span>Sales Records</span>
              <span className="ml-auto font-semibold text-stone-600 dark:text-stone-400 text-sm bg-stone-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-stone-200 dark:border-neutral-700">({filteredSales.length})</span>
            </h3>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {filteredSales.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-neutral-700 bg-stone-50/50 dark:bg-neutral-800/30 sticky top-0">
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Date & Time</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Subtotal</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Tax</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Discount</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-stone-200 dark:border-neutral-700 hover:bg-stone-50 dark:hover:bg-neutral-700/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {record.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-stone-400">
                        {formatDate(record.dateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-stone-100 text-right">
                        ₱{record.subtotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-stone-100 text-right">
                        ₱{record.tax.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-stone-100 text-right">
                        ₱{record.discount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600 dark:text-orange-400 text-right">
                        ₱{record.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2.5 py-1 rounded-md font-semibold text-xs ${
                          record.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                            : record.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400'
                            : 'bg-stone-100 text-neutral-800 dark:bg-neutral-700/50 dark:text-stone-300'
                        }`}>
                          {record.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex h-full items-center justify-center py-20">
                <div className="text-center px-4">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-neutral-700">
                    <FontAwesomeIcon icon={faSearch} className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                    No sales records found
                  </p>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-stone-400">
                    Try adjusting your search or date filter
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Totals */}
          {filteredSales.length > 0 && (
            <div className="border-t border-stone-200 dark:border-neutral-700 bg-stone-50/50 dark:bg-neutral-800/50 px-6 py-5">
              <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 mb-1">Total Subtotal</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-stone-100">
                    ₱{totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 mb-1">Total Tax</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-stone-100">
                    ₱{totals.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 mb-1">Total Discount</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-stone-100">
                    ₱{totals.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-stone-200 dark:border-neutral-700 pl-6">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-600 dark:text-stone-400 mb-1">Total Revenue</span>
                  <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                    ₱{totals.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSales;
