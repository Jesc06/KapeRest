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
    <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-10 border-b border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 sm:px-5 md:px-6 py-3 sm:py-4 shadow-sm transition-all duration-300">
        {/* Top Section: Sidebar Toggle | Search Bar | Logout Panel */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3">
          {/* Left Section: Sidebar Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-all duration-200 shadow-sm"
            >
              <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
            </button>

            {/* Sidebar Toggle Button - Desktop Only */}
            <button
              onClick={onToggleSidebarExpand}
              className="hidden lg:flex flex-shrink-0 h-9 w-9 items-center justify-center rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
            </button>
          </div>

          {/* Center Section: Minimalist Search Bar */}
          <div className="flex-1 flex items-center gap-2 bg-stone-100 dark:bg-neutral-800 rounded-lg border border-stone-300 dark:border-neutral-700 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm transition-all duration-300 hover:shadow-md focus-within:shadow-md hover:border-stone-400 dark:hover:border-neutral-600">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="h-4 w-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search receipt number or status..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 shadow-none focus:outline-none"
            />
          </div>

          {/* Right Section: Logout Panel */}
          <LogoutPanel userRole="Cashier" />
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 items-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 px-2">Period:</p>
          <div className="flex gap-2 flex-wrap">
            {periodFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedPeriod(filter.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-all duration-200 border ${
                  selectedPeriod === filter.value
                    ? 'border-orange-600 bg-orange-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:border-orange-300 dark:hover:border-orange-700 hover:bg-stone-50 dark:hover:bg-neutral-800 active:scale-95 hover:scale-105'
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
        <div className="flex-1 flex flex-col rounded-lg border border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-6 py-4">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faCoffee} className="h-4 w-4 text-orange-600" />
              <span>Sales Records</span>
              <span className="font-semibold text-stone-600 dark:text-stone-400 text-sm">({filteredSales.length})</span>
            </h3>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {filteredSales.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-300 dark:border-neutral-700 bg-stone-100 dark:bg-neutral-900 sticky top-0">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Receipt #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Date & Time</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Subtotal</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Tax</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Discount</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((record, index) => (
                    <tr
                      key={index}
                      className="border-b border-stone-200 dark:border-neutral-800 hover:bg-stone-100 dark:hover:bg-neutral-700/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">
                        {record.receiptNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                        {formatDate(record.dateTime)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white text-right">
                        ₱{record.subtotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white text-right">
                        ₱{record.tax.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white text-right">
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
                            : 'bg-stone-200 text-stone-800 dark:bg-neutral-700 dark:text-neutral-200'
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
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 dark:bg-neutral-700">
                    <FontAwesomeIcon icon={faSearch} className="h-8 w-8 text-stone-500 dark:text-neutral-400" />
                  </div>
                  <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    No sales records found
                  </p>
                  <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                    Try adjusting your search or date filter
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Totals */}
          {filteredSales.length > 0 && (
            <div className="border-t border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-6 py-5">
              <div className="grid grid-cols-4 gap-6">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 mb-1">Total Subtotal</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    ₱{totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 mb-1">Total Tax</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    ₱{totals.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 mb-1">Total Discount</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                    ₱{totals.discount.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col border-l border-stone-300 dark:border-neutral-700 pl-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 mb-1">Total Revenue</span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
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
