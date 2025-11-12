import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faPlus, faMinus, faTrash, faCheck, faPause, faCreditCard, faBars, faShoppingCart, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface MainPanelProps {
  filteredProducts: Product[];
  categories: string[];
  searchText: string;
  selectedCategory: string;
  onSearchChange: (text: string) => void;
  onCategoryChange: (category: string) => void;
  onAddToCart: (product: Product) => void;
  cart: CartItem[];
  onRemoveFromCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  total: number;
  onBuy: () => void;
  onHold: () => void;
  onGCashPayment: () => void;
  isLoading: boolean;
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
  onToggleSidebarExpand?: () => void;
  onLogout?: () => void;
  userRole?: string;
}

const MainPanel: React.FC<MainPanelProps> = ({
  filteredProducts,
  categories,
  searchText,
  selectedCategory,
  onSearchChange,
  onCategoryChange,
  onAddToCart,
  cart,
  onRemoveFromCart,
  onUpdateQuantity,
  total,
  onBuy,
  onHold,
  onGCashPayment,
  isLoading,
  onToggleSidebar,
  sidebarExpanded = true,
  onToggleSidebarExpand,
  userRole = 'Cashier',
}) => {
  const [showTaxDiscount, setShowTaxDiscount] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<number | string>('');

  // Sample discount data from database - you can replace this with API call
  const discountOptions = [
    { id: 1, label: 'No Discount', value: 0 },
    { id: 2, label: 'Senior Citizen (5%)', value: 5 },
    { id: 3, label: 'PWD Discount (10%)', value: 10 },
    { id: 4, label: 'Student Discount (15%)', value: 15 },
    { id: 5, label: 'Member Promo (20%)', value: 20 },
    { id: 6, label: 'Staff Discount (25%)', value: 25 },
  ];
  
  // Calculate discounted total (percentage only)
  const discountValue = typeof selectedDiscount === 'number' ? selectedDiscount : (selectedDiscount ? parseFloat(selectedDiscount as string) : 0);
  const discountAmount = (total * discountValue) / 100;
  const finalTotal = Math.max(0, total - discountAmount);
  
  return (
    <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-10 border-b border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-6 sm:px-8 md:px-10 py-5 shadow-sm transition-all duration-300">
        {/* Top Section: Sidebar Toggle | Search Bar | Logout Panel */}
        <div className="flex items-center justify-between gap-5 sm:gap-6">
          {/* Left & Center Section: Sidebar Toggle + Search Bar (ends where cart starts) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
            
            {/* Sidebar Toggle Button - Desktop Only */}
            <button
              onClick={onToggleSidebarExpand}
              className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
            </button>
          </div>

          {/* Center Section: Minimalist Search Bar - ends where cart begins */}
          <div className="flex-1 flex items-center gap-3 bg-stone-100 dark:bg-neutral-800 rounded-lg border border-stone-300 dark:border-neutral-700 px-4 py-3 shadow-sm transition-all duration-300 hover:shadow-md focus-within:shadow-md hover:border-stone-400 dark:hover:border-neutral-600">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="h-5 w-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={e => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 shadow-none focus:outline-none"
            />
          </div>

          {/* Right Section: Logout Panel - match cart width */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <LogoutPanel userRole={userRole} />
          </div>
        </div>
      </div>

      {/* Main Content Area - Proper padding and alignment */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-6 px-6 sm:px-8 md:px-10 py-6 bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
        {/* Left Section: Products & Filters - Main content area */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 overflow-hidden">
          {/* Category Filter */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-stone-200 dark:border-neutral-800 px-6 py-5 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-xs font-semibold tracking-widest text-neutral-700 dark:text-neutral-300 mb-4 uppercase">Categories</p>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-3 items-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 border whitespace-nowrap ${
                    selectedCategory === category
                      ? 'border-orange-600 bg-orange-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                      : 'border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 hover:bg-stone-50 dark:hover:bg-neutral-800 active:scale-95 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Section (Scrollable) */}
          <div className="flex-1 flex flex-col rounded-xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-stone-200 dark:border-neutral-800 bg-gradient-to-r from-stone-50 to-white dark:from-neutral-800 dark:to-neutral-900 px-6 py-5">
              <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                <span>Available Items</span>
                <span className="ml-auto font-semibold text-stone-600 dark:text-stone-400 text-sm bg-stone-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-stone-200 dark:border-neutral-700">({filteredProducts.length})</span>
              </h3>
            </div>

            {/* Products Grid (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-5 scroll-smooth">
              <div className="grid gap-5 auto-rows-max" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))' }}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => onAddToCart(product)}
                      className="product-card-motion group cursor-pointer rounded-xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 transition-all duration-300 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 active:scale-95 hover:-translate-y-1 overflow-hidden flex flex-col"
                    >
                      {/* Product Image */}
                      <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-800">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-50 dark:bg-neutral-700 group-hover:bg-stone-100 dark:group-hover:bg-neutral-600 transition-all duration-300">
                            <FontAwesomeIcon icon={faCoffee} className="h-8 w-8 text-stone-300 dark:text-neutral-500" />
                          </div>
                        )}
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>

                      {/* Content - Bottom Section */}
                      <div className="flex-1 flex flex-col p-4">
                        <div className="flex-1 min-w-0 mb-3">
                          <h4 className="font-semibold text-base leading-tight text-neutral-900 dark:text-white line-clamp-2">
                            {product.name}
                          </h4>
                          <p className="mt-1.5 text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                            {product.category}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-200 dark:border-neutral-700">
                          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            ₱{product.price}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            className="inline-flex items-center justify-center rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 p-2 text-white transition-all duration-200 hover:shadow-md active:scale-90 shadow-sm"
                          >
                            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 dark:bg-neutral-700">
                        <FontAwesomeIcon icon={faSearch} className="h-7 w-7 text-stone-500 dark:text-neutral-400" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        No items found
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full lg:w-80 lg:min-w-[320px] xl:w-96 xl:min-w-[384px] flex flex-col rounded-xl border border-stone-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden flex-shrink-0 max-h-full">
          {/* Cart Header */}
          <div className="border-b border-stone-200 dark:border-neutral-800 bg-gradient-to-r from-stone-50 to-white dark:from-neutral-800 dark:to-neutral-900 px-4 py-3.5 flex-shrink-0">
            <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-orange-600 dark:text-orange-500" />
              <span>Shopping Cart</span>
              <span className="ml-auto font-semibold text-stone-600 dark:text-stone-400 text-xs bg-stone-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-stone-200 dark:border-neutral-700">({cart.length})</span>
            </h3>
          </div>

          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scroll-smooth min-h-0">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div
                  key={item.id}
                  className="cart-item-motion group flex items-center gap-2 rounded-lg border border-stone-200 dark:border-neutral-800 bg-stone-50 dark:bg-neutral-800 p-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500 min-w-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Icon */}
                  <div className="flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg bg-orange-600 text-white font-semibold transition-all duration-300 flex-shrink-0 shadow-sm">
                    <FontAwesomeIcon icon={faCoffee} className="h-4 w-4" />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0 max-w-[120px]">
                    <p className="font-semibold text-xs text-neutral-900 dark:text-white leading-tight line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-stone-600 dark:text-stone-400 mt-0.5">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="flex h-6 w-6 min-w-[24px] items-center justify-center rounded border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold text-xs transition-all duration-200 active:scale-90 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:border-orange-400"
                    >
                      <FontAwesomeIcon icon={faMinus} className="h-2.5 w-2.5" />
                    </button>
                    <span className="w-5 min-w-[20px] text-center font-semibold text-[10px] text-neutral-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 min-w-[24px] items-center justify-center rounded border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-semibold text-xs transition-all duration-200 active:scale-90 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:border-orange-400"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="flex h-6 w-6 min-w-[24px] items-center justify-center rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all duration-200 active:scale-90 flex-shrink-0 shadow-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
                  </button>

                  {/* Line Total */}
                  <div className="text-right text-[10px] font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap min-w-[50px] flex-shrink-0">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-neutral-700">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6 text-stone-500 dark:text-neutral-400" />
                  </div>
                  <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                    Cart is empty
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer with Total - Scrollable when needed */}
          <div className="flex-shrink-0 border-t border-stone-200 dark:border-neutral-800 bg-gradient-to-r from-stone-50 to-white dark:from-neutral-800 dark:to-neutral-900 max-h-[60vh] overflow-y-auto">
            <div className="px-4 lg:px-6 py-4 lg:py-6 space-y-4 lg:space-y-5">
              {/* Final Total Amount Section */}
              <div className="flex flex-col gap-2">
                <span className="text-xs lg:text-sm font-bold tracking-widest text-stone-700 dark:text-stone-300 uppercase">Total Amount</span>
                <span className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-500 dark:to-orange-400 bg-clip-text text-transparent">
                  ₱{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Discount & Tax Dropdown */}
              <button
                onClick={() => setShowTaxDiscount(!showTaxDiscount)}
                className="w-full flex items-center justify-between px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-stone-50 dark:hover:bg-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200 text-xs lg:text-sm"
              >
                <span className="font-semibold text-neutral-900 dark:text-white">Breakdown</span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-3 lg:h-4 w-3 lg:w-4 text-neutral-900 dark:text-white transition-transform duration-300 ${showTaxDiscount ? 'rotate-180' : ''}`} />
              </button>

              {/* Tax, Discount Details */}
              {showTaxDiscount && (
                <div className="space-y-2.5 lg:space-y-3 pt-3 lg:pt-4 border-t border-stone-300 dark:border-neutral-700">
                  {/* Base Calculations */}
                  <div className="space-y-2 lg:space-y-2.5 text-xs lg:text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Subtotal:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">₱{total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600 dark:text-stone-400">Tax (12%):</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">₱{(total * 0.12).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Custom Discount Section */}
                  <div className="border-t border-stone-300 dark:border-neutral-700 pt-2.5 lg:pt-3">
                    <label className="text-xs lg:text-sm font-semibold text-neutral-900 dark:text-white block mb-2">Discount:</label>
                    <select
                      value={selectedDiscount}
                      onChange={(e) => setSelectedDiscount(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-2.5 lg:px-3 py-2 lg:py-2.5 text-xs lg:text-sm bg-white dark:bg-neutral-900 border border-stone-300 dark:border-neutral-700 rounded-lg font-semibold text-neutral-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-600"
                    >
                      <option value="">None</option>
                      {discountOptions.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Discount Amount Display */}
                  {discountValue > 0 && (
                    <div className="flex items-center justify-between text-xs lg:text-sm border-t border-stone-300 dark:border-neutral-700 pt-2.5 lg:pt-3">
                      <span className="text-red-600 dark:text-red-400 font-semibold">Discount:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Items Count */}
                  <div className="flex items-center justify-between text-xs lg:text-sm border-t border-stone-300 dark:border-neutral-700 pt-2.5 lg:pt-3">
                    <span className="text-neutral-900 dark:text-white font-semibold">Items:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Always visible at bottom */}
          <div className="flex-shrink-0 border-t border-stone-200 dark:border-neutral-800 space-y-2.5 lg:space-y-3 bg-stone-50 dark:bg-neutral-800 px-4 lg:px-5 py-4 lg:py-5">
            {/* Primary Action - Buy */}
            <button
              onClick={onBuy}
              disabled={isLoading || cart.length === 0}
              className="group w-full flex items-center justify-center gap-2 lg:gap-3 rounded-lg bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-4 lg:px-5 py-3 lg:py-4 text-sm lg:text-base font-bold text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 dark:disabled:hover:bg-orange-500 shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 lg:h-5 w-4 lg:w-5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="h-4 lg:h-5 w-4 lg:w-5" />
                  <span>Complete Purchase</span>
                </>
              )}
            </button>

            {/* Secondary Actions - Grid Layout */}
            <div className="grid grid-cols-2 gap-2.5 lg:gap-3">
              {/* Hold Button */}
              <button
                onClick={onHold}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 lg:gap-2 rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-semibold text-neutral-900 dark:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon icon={faPause} className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
                <span>Hold</span>
              </button>

              {/* GCash Payment Button */}
              <button
                onClick={onGCashPayment}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 lg:gap-2 rounded-lg border border-blue-600 bg-blue-600 hover:bg-blue-700 px-3 lg:px-4 py-2.5 lg:py-3 text-xs lg:text-sm font-semibold text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon icon={faCreditCard} className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
                <span>GCash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
