import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faSearch, faFilter, faReceipt, faCalendar, faCreditCard, faPercentage, faHashtag, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar';
import LogoutPanel from './LogoutPanel';

interface Purchase {
  id: number;
  menuItemId: number;
  menuItemName: string;
  category: string;
  quantity: number;
  discountPercent: number;
  tax: number;
  paymentMethod: string;
  totalAmount: number;
  purchaseDate: string;
}

const Purchases: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Sample data - Replace with actual API call
  const [purchases] = useState<Purchase[]>([
    {
      id: 1,
      menuItemId: 101,
      menuItemName: 'Cappuccino',
      category: 'Coffee',
      quantity: 2,
      discountPercent: 10,
      tax: 12,
      paymentMethod: 'Cash',
      totalAmount: 250.00,
      purchaseDate: '2025-11-11 10:30 AM'
    },
    {
      id: 2,
      menuItemId: 102,
      menuItemName: 'Latte',
      category: 'Coffee',
      quantity: 1,
      discountPercent: 0,
      tax: 12,
      paymentMethod: 'GCash',
      totalAmount: 150.00,
      purchaseDate: '2025-11-11 11:15 AM'
    },
    {
      id: 3,
      menuItemId: 103,
      menuItemName: 'Blueberry Cheesecake',
      category: 'Desserts',
      quantity: 3,
      discountPercent: 5,
      tax: 12,
      paymentMethod: 'Credit Card',
      totalAmount: 450.00,
      purchaseDate: '2025-11-11 12:00 PM'
    },
    {
      id: 4,
      menuItemId: 104,
      menuItemName: 'Iced Americano',
      category: 'Coffee',
      quantity: 1,
      discountPercent: 0,
      tax: 12,
      paymentMethod: 'Cash',
      totalAmount: 120.00,
      purchaseDate: '2025-11-11 01:45 PM'
    },
    {
      id: 5,
      menuItemId: 105,
      menuItemName: 'Chicken Sandwich',
      category: 'Food',
      quantity: 2,
      discountPercent: 15,
      tax: 12,
      paymentMethod: 'GCash',
      totalAmount: 340.00,
      purchaseDate: '2025-11-11 02:30 PM'
    }
  ]);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(purchases.map(p => p.category)))];

  // Filter purchases based on search and category
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.id.toString().includes(searchQuery) ||
      purchase.menuItemId.toString().includes(searchQuery);
    
    const matchesCategory = categoryFilter === 'All' || purchase.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get payment method badge color
  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'gcash':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'credit card':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
          {/* Top Bar */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Purchases</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
              {/* Header Section */}
              <div className="mb-6">
                <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 dark:from-orange-600 dark:via-orange-700 dark:to-orange-600 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                      <FontAwesomeIcon icon={faReceipt} className="text-3xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">
                        Purchase History
                      </h2>
                      <p className="text-orange-100 text-sm font-medium">
                        View all purchase transactions and details
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by item name, purchase ID, or menu item ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-stone-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-stone-100 placeholder-neutral-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faFilter} className="text-neutral-400" />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-stone-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200 appearance-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'All' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Showing <span className="font-bold text-orange-600 dark:text-orange-400">{filteredPurchases.length}</span> of {purchases.length} purchases
              </div>

              {/* Purchases List */}
              <div className="space-y-4">
                {filteredPurchases.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center border-2 border-stone-200 dark:border-neutral-700">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faReceipt} className="text-4xl text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-stone-100 mb-2">No purchases found</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border-2 border-stone-100 dark:border-neutral-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Purchase Info */}
                        <div className="lg:col-span-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <FontAwesomeIcon icon={faBoxOpen} className="text-white text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-neutral-900 dark:text-stone-100 mb-1 truncate">
                                {purchase.menuItemName}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                                  Purchase ID: {purchase.id}
                                </span>
                                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-md text-xs font-semibold">
                                  {purchase.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                          {/* Quantity */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold">Quantity</p>
                            <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                              {purchase.quantity} {purchase.quantity > 1 ? 'items' : 'item'}
                            </p>
                          </div>

                          {/* Discount */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                              <FontAwesomeIcon icon={faPercentage} className="text-xs" />
                              Discount
                            </p>
                            <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                              {purchase.discountPercent}%
                            </p>
                          </div>

                          {/* Tax */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold">Tax</p>
                            <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                              {purchase.tax}%
                            </p>
                          </div>

                          {/* Payment Method */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                              <FontAwesomeIcon icon={faCreditCard} className="text-xs" />
                              Payment
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${getPaymentMethodColor(purchase.paymentMethod)}`}>
                              {purchase.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Right: Amount & Date */}
                        <div className="lg:col-span-2 flex flex-col items-end justify-between text-right">
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold">Total Amount</p>
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                              ₱{purchase.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <FontAwesomeIcon icon={faCalendar} />
                            <span>{purchase.purchaseDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info Bar */}
                      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                          <span>Menu Item ID: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{purchase.menuItemId}</span></span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
