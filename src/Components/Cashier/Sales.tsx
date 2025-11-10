import React, { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faBars, faChevronLeft, faChevronRight, faCalendarDays, faWeightScale, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from './LogoutPanel';

interface SalesRecord {
  receiptNumber: string;
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
}

type PeriodFilter = 'daily' | 'weekly' | 'monthly';

const Sales: React.FC<SalesProps> = ({
  sales,
  onToggleSidebar,
  sidebarExpanded = true,
  onToggleSidebarExpand,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('daily');

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

  const periodFilters: { label: string; value: PeriodFilter; icon: any }[] = [
    { label: 'Daily', value: 'daily', icon: faCalendarDays },
    { label: 'Weekly', value: 'weekly', icon: faWeightScale },
    { label: 'Monthly', value: 'monthly', icon: faCalendarAlt },
  ];

  return (
    <div className={`flex h-screen w-full flex-col bg-stone-100 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-10 border-b border-orange-300/50 bg-stone-100/95 dark:border-orange-700/30 dark:bg-stone-800/90 px-4 sm:px-5 md:px-6 py-3 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
        {/* Top Section: Sidebar Toggle | Search Bar | Logout Panel */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3">
          {/* Left Section: Sidebar Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-orange-400/60 bg-orange-50 hover:bg-orange-100 text-orange-700 transition-all duration-200 shadow-sm dark:border-orange-600/40 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300"
            >
              <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
            </button>

            {/* Sidebar Toggle Button - Desktop Only */}
            <button
              onClick={onToggleSidebarExpand}
              className="hidden lg:flex flex-shrink-0 h-9 w-9 items-center justify-center rounded-lg border border-orange-400/50 bg-gradient-to-br from-orange-50 to-orange-100/80 hover:from-orange-100 hover:to-orange-200 text-orange-600 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md dark:border-orange-600/40 dark:from-orange-900/30 dark:to-orange-900/20 dark:hover:from-orange-900/50 dark:hover:to-orange-900/40 dark:text-orange-400 dark:hover:text-orange-300"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
            </button>
          </div>

          {/* Center Section: Premium Search Bar - Full Width */}
          <div className="flex-1 flex items-center gap-3 pl-4 sm:pl-5 bg-gradient-to-r from-orange-500 via-orange-550 to-orange-600 rounded-lg p-2.5 sm:p-3 shadow-2xl ring-2 ring-orange-400/40 hover:ring-orange-400/60 focus-within:ring-orange-300/80 transition-all duration-300">
            <FontAwesomeIcon
              icon={faSearch}
              className="h-5 w-5 text-white flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search receipt number or status..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-white placeholder:text-white/70 shadow-none focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Right Section: Logout Panel */}
          <LogoutPanel userRole="Cashier" />
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 px-2">Period:</p>
          <div className="flex gap-2 flex-wrap">
            {periodFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedPeriod(filter.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all duration-200 border ${
                  selectedPeriod === filter.value
                    ? 'border-orange-500/80 bg-orange-100 text-orange-800 shadow-md dark:border-orange-400/70 dark:bg-orange-500/20 dark:text-orange-200'
                    : 'border-orange-300/60 bg-stone-100/70 dark:bg-stone-800/50 text-orange-700 dark:text-orange-300 hover:border-orange-400/80 hover:bg-orange-50/60 dark:hover:bg-stone-800/70'
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
      <div className="flex flex-1 overflow-hidden gap-4 sm:gap-5 p-4 sm:p-5 md:p-6">
        {/* Sales Table Container */}
        <div className="flex-1 flex flex-col rounded-xl border border-orange-300/50 dark:border-orange-700/30 bg-stone-100/80 dark:bg-stone-800/60 shadow-md dark:shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-orange-300/40 dark:border-orange-700/30 bg-stone-100/60 dark:bg-stone-800/50 px-6 py-4">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span>Sales Records</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm ml-1">({filteredSales.length})</span>
            </h3>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {filteredSales.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-orange-300/40 dark:border-orange-700/30 bg-stone-100/40 dark:bg-stone-800/30 sticky top-0">
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Date & Time</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Subtotal</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Tax</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Discount</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-orange-300/30 dark:border-orange-700/20 hover:bg-orange-50/40 dark:hover:bg-orange-900/10 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-orange-900 dark:text-orange-100">
                        {record.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {formatDate(record.dateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                        ₱{record.subtotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                        ₱{record.tax.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100 text-right">
                        ₱{record.discount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600 dark:text-orange-400 text-right">
                        ₱{record.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex px-2.5 py-1 rounded-md font-semibold text-xs ${
                          record.status === 'Completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : record.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300'
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
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <FontAwesomeIcon icon={faSearch} className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                  </div>
                  <p className="text-base font-bold text-orange-900 dark:text-orange-100">
                    No sales records found
                  </p>
                  <p className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                    Try adjusting your search or date filter
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Totals */}
          {filteredSales.length > 0 && (
            <div className="border-t border-orange-300/40 dark:border-orange-700/30 bg-stone-100/70 dark:bg-stone-800/60 px-6 py-5">
              <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 mb-1">Total Subtotal</span>
                  <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    ₱{totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 mb-1">Total Tax</span>
                  <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    ₱{totals.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 mb-1">Total Discount</span>
                  <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    ₱{totals.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-orange-300/50 dark:border-orange-700/30 pl-6">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 mb-1">Total Revenue</span>
                  <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent dark:from-orange-400 dark:to-orange-500">
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

export default Sales;
