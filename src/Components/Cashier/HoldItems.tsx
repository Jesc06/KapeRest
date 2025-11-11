import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faSearch, faFilter, faPause, faPlay, faCalendar, faCreditCard, faPercentage, faHashtag, faBoxOpen, faTrash } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar';
import LogoutPanel from './LogoutPanel';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
}

interface HoldItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  category: string;
  quantity: number;
  discountPercent: number;
  tax: number;
  paymentMethod: string;
  totalAmount: number;
  holdDate: string;
  cartItems: CartItem[];
}

const HoldItems: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Load hold items from localStorage
  const [holdItems, setHoldItems] = useState<HoldItem[]>(() => {
    const savedHoldItems = localStorage.getItem('holdItems');
    return savedHoldItems ? JSON.parse(savedHoldItems) : [];
  });

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(holdItems.map(p => p.category)))];

  // Filter hold items based on search and category
  const filteredHoldItems = holdItems.filter(item => {
    const matchesSearch = 
      item.menuItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString().includes(searchQuery) ||
      item.menuItemId.toString().includes(searchQuery);
    
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    
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

  // Handle resume item - Navigate back to POS with item data
  const handleResumeItem = (item: HoldItem) => {
    // Store item in sessionStorage to be picked up by BuyItem component
    sessionStorage.setItem('resumeItem', JSON.stringify(item));
    
    // Remove from hold items
    const updatedHoldItems = holdItems.filter(holdItem => holdItem.id !== item.id);
    localStorage.setItem('holdItems', JSON.stringify(updatedHoldItems));
    setHoldItems(updatedHoldItems);
    
    // Navigate to buy-item page
    window.location.href = '/cashier/buy-item';
  };

  // Handle delete item
  const handleDeleteItem = (id: number) => {
    if (window.confirm('Are you sure you want to remove this hold item?')) {
      const updatedHoldItems = holdItems.filter(item => item.id !== id);
      localStorage.setItem('holdItems', JSON.stringify(updatedHoldItems));
      setHoldItems(updatedHoldItems);
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Hold Items</h1>
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
                <div className="relative bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 dark:from-yellow-600 dark:via-yellow-700 dark:to-yellow-600 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] animate-pulse"></div>
                  </div>
                  
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                      <FontAwesomeIcon icon={faPause} className="text-3xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">
                        Hold Items
                      </h2>
                      <p className="text-yellow-100 text-sm font-medium">
                        Manage temporarily held orders - Resume or remove items
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
                    placeholder="Search by item name, hold ID, or menu item ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-stone-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-stone-100 placeholder-neutral-400 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500 transition-colors duration-200"
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
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-stone-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-stone-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500 transition-colors duration-200 appearance-none cursor-pointer"
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
                Showing <span className="font-bold text-yellow-600 dark:text-yellow-400">{filteredHoldItems.length}</span> of {holdItems.length} hold items
              </div>

              {/* Hold Items List */}
              <div className="space-y-4">
                {filteredHoldItems.length === 0 ? (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-12 text-center border-2 border-stone-200 dark:border-neutral-700">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faPause} className="text-4xl text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-stone-100 mb-2">No hold items found</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filteredHoldItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border-2 border-stone-100 dark:border-neutral-700 hover:border-yellow-200 dark:hover:border-yellow-900/50 transition-all duration-300 hover:shadow-xl"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Item Info */}
                        <div className="lg:col-span-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <FontAwesomeIcon icon={faBoxOpen} className="text-white text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-neutral-900 dark:text-stone-100 mb-1 truncate">
                                {item.menuItemName}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                                  Hold ID: {item.id}
                                </span>
                                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md text-xs font-semibold">
                                  {item.category}
                                </span>
                                {item.cartItems && item.cartItems.length > 0 && (
                                  <>
                                    <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-xs font-semibold">
                                      {item.cartItems.length} item(s) in cart
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                          {/* Quantity */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold">Quantity</p>
                            <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                              {item.quantity} {item.quantity > 1 ? 'items' : 'item'}
                            </p>
                          </div>

                          {/* Discount */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                              <FontAwesomeIcon icon={faPercentage} className="text-xs" />
                              Discount
                            </p>
                            <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                              {item.discountPercent}%
                            </p>
                          </div>

                          {/* Tax */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold">Tax</p>
                            <p className="text-base font-bold text-neutral-900 dark:text-stone-100">
                              {item.tax}%
                            </p>
                          </div>

                          {/* Payment Method */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                              <FontAwesomeIcon icon={faCreditCard} className="text-xs" />
                              Payment
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${getPaymentMethodColor(item.paymentMethod)}`}>
                              {item.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="lg:col-span-3 flex flex-col items-end justify-between">
                          <div className="text-right mb-4">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1 font-semibold">Total Amount</p>
                            <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                              ₱{item.totalAmount.toFixed(2)}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                              <FontAwesomeIcon icon={faCalendar} />
                              <span>{item.holdDate}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleResumeItem(item)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                            >
                              <FontAwesomeIcon icon={faPlay} />
                              <span>Resume</span>
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg active:scale-95"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info Bar */}
                      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                          <span>Menu Item ID: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.menuItemId}</span></span>
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

export default HoldItems;
