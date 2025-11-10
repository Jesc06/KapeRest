import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faPlus, faMinus, faTrash, faCheck, faPause, faCreditCard, faBars, faShoppingCart, faChevronLeft, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from './LogoutPanel';

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
          <div className="flex-1 flex items-center gap-2 bg-gradient-to-r from-orange-500 via-orange-550 to-orange-600 rounded-lg p-2.5 sm:p-3 shadow-2xl ring-2 ring-orange-400/40 hover:ring-orange-400/60 focus-within:ring-orange-300/80 transition-all duration-300">
            <div className="flex items-center gap-3 pl-4 sm:pl-5 flex-1">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="h-5 w-5 text-white flex-shrink-0"
              />
              <input
                type="text"
                placeholder="Search items or categories..."
                value={searchText}
                onChange={e => onSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-white placeholder:text-white/70 shadow-none focus:outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Right Section: Logout Panel */}
          <LogoutPanel userRole={userRole} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden gap-4 sm:gap-5 p-4 sm:p-5 md:p-6">
        {/* Left Section: Products & Filters */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Category Filter - Same width as products */}
          <div className="bg-gradient-to-r from-orange-50/40 to-orange-100/30 dark:from-orange-900/15 dark:to-orange-950/10 rounded-md border border-orange-300/50 dark:border-orange-700/30 px-3 py-2.5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300 mb-2">Categories</p>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold transition-all duration-300 border ${
                    selectedCategory === category
                      ? 'border-orange-500/80 bg-orange-100 text-orange-800 shadow-md hover:shadow-lg hover:scale-105 dark:border-orange-400/70 dark:bg-orange-500/20 dark:text-orange-200 active:scale-95'
                      : 'border-orange-300/60 bg-stone-100/70 dark:bg-stone-800/50 text-orange-700 dark:text-orange-300 hover:border-orange-400/80 hover:bg-orange-50/60 dark:hover:bg-stone-800/70 hover:shadow-sm dark:hover:border-orange-400/60 active:scale-95'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

        {/* Products Section (Scrollable) */}
        <div className="flex-1 flex flex-col rounded-xl border border-orange-300/50 dark:border-orange-700/30 bg-stone-100/80 dark:bg-stone-800/60 shadow-md dark:shadow-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-orange-300/40 dark:border-orange-700/30 bg-stone-100/60 dark:bg-stone-800/50 px-6 py-4">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span>Available Items</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm ml-1">({filteredProducts.length})</span>
            </h3>
          </div>

          {/* Products Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 scroll-smooth">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-max">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => onAddToCart(product)}
                    className="group cursor-pointer rounded-xl border-2 border-orange-300/60 dark:border-orange-700/40 bg-stone-100/80 dark:bg-stone-800/50 transition-all duration-300 hover:border-orange-400/80 hover:shadow-lg hover:-translate-y-1.5 active:scale-95 dark:hover:border-orange-400/60 dark:hover:shadow-orange-500/20 overflow-hidden flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-stone-200 to-stone-100 dark:from-stone-800 dark:to-stone-900">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-950/30 group-hover:from-orange-200 group-hover:to-orange-100 dark:group-hover:from-orange-900/30 dark:group-hover:to-orange-950/40 transition-all duration-300">
                          <FontAwesomeIcon icon={faCoffee} className="h-8 w-8 text-orange-400 dark:text-orange-600 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </div>

                    {/* Content - Bottom Section */}
                    <div className="flex-1 flex flex-col p-3.5 sm:p-4">
                      <div className="flex-1 min-w-0 mb-3">
                        <h4 className="font-bold text-sm sm:text-base leading-tight text-orange-900 dark:text-orange-100 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="mt-1.5 text-xs text-orange-700 font-semibold dark:text-orange-300 line-clamp-1">
                          {product.category}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-orange-200/60 dark:border-orange-700/40">
                        <span className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
                          ₱{product.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 p-2 sm:p-2.5 text-xs font-bold text-white transition-all duration-200 hover:shadow-lg active:scale-95 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 shadow-md"
                        >
                          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-20">
                  <div className="text-center px-4">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <FontAwesomeIcon icon={faSearch} className="h-8 w-8 text-orange-500 dark:text-orange-400" />
                    </div>
                    <p className="text-base font-bold text-orange-900 dark:text-orange-100">
                      No items found
                    </p>
                    <p className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        {/* Cart Section */}
        <div className="w-full sm:w-72 md:w-[22rem] lg:w-[24rem] h-full flex flex-col rounded-xl border border-orange-300/50 dark:border-orange-700/30 bg-stone-100/80 dark:bg-stone-800/60 shadow-md dark:shadow-lg overflow-hidden flex-shrink-0">
          {/* Cart Header */}
          <div className="border-b border-orange-300/40 dark:border-orange-700/30 bg-stone-100/60 dark:bg-stone-800/50 px-6 py-4">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
              <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span>Shopping Cart</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm ml-auto bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">({cart.length})</span>
            </h3>
          </div>

          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 space-y-2.5 scroll-smooth">
            {cart.length > 0 ? (
              cart.map(item => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 rounded-lg border border-orange-300/50 dark:border-orange-700/30 bg-stone-100/70 dark:bg-stone-800/50 p-3.5 shadow-sm transition-all duration-300 hover:border-orange-400/70 hover:shadow-md hover:bg-stone-100 dark:hover:border-orange-400/50 dark:hover:shadow-orange-500/15 dark:hover:bg-stone-800/70"
                >
                  {/* Icon */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500 text-white font-bold transition-all duration-300 flex-shrink-0 shadow-sm dark:bg-orange-600">
                    <FontAwesomeIcon icon={faCoffee} size="sm" />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-orange-900 dark:text-orange-100 leading-tight line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-orange-700 mt-0.5 dark:text-orange-300 font-semibold">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-200 to-orange-100 hover:from-orange-300 hover:to-orange-200 text-orange-700 font-bold text-xs transition-all duration-200 active:scale-90 dark:from-orange-700/50 dark:to-orange-700/40 dark:hover:from-orange-600/70 dark:hover:to-orange-600/60 dark:text-orange-200 shadow-sm hover:shadow-md"
                    >
                      <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-orange-900 dark:text-orange-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-200 to-orange-100 hover:from-orange-300 hover:to-orange-200 text-orange-700 font-bold text-xs transition-all duration-200 active:scale-90 dark:from-orange-700/50 dark:to-orange-700/40 dark:hover:from-orange-600/70 dark:hover:to-orange-600/60 dark:text-orange-200 shadow-sm hover:shadow-md"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-red-200 to-red-100 hover:from-red-300 hover:to-red-200 text-red-700 font-bold text-xs transition-all duration-200 active:scale-90 dark:from-red-500/40 dark:to-red-500/30 dark:hover:from-red-500/50 dark:hover:to-red-500/40 dark:text-red-300 shadow-sm hover:shadow-md flex-shrink-0"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>

                  {/* Line Total Tooltip */}
                  <div className="text-right text-xs font-black text-orange-600 dark:text-orange-300 whitespace-nowrap">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900/50">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6 text-neutral-400 dark:text-neutral-600" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    Cart is empty
                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Click items to start shopping
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer with Total - Minimalist */}
          <div className="border-t border-orange-300/40 dark:border-orange-700/30 bg-stone-100/70 dark:bg-stone-800/60 px-4 sm:px-5 py-4 sm:py-5">
            <div className="space-y-3">
              {/* Final Total Amount Section */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Total Amount</span>
                <span className="text-3xl font-black bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent dark:from-orange-400 dark:to-orange-500">
                  ₱{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Discount & Tax Dropdown */}
              <button
                onClick={() => setShowTaxDiscount(!showTaxDiscount)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-orange-300/40 dark:border-orange-700/30 hover:bg-orange-50/40 dark:hover:bg-orange-900/10 transition-all duration-200"
              >
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">Breakdown & Discount</span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 text-orange-600 dark:text-orange-400 transition-transform duration-300 ${showTaxDiscount ? 'rotate-180' : ''}`} />
              </button>

              {/* Tax, Discount & Custom Discount Details */}
              {showTaxDiscount && (
                <div className="space-y-2.5 pt-2 border-t border-orange-300/30 dark:border-orange-700/20">
                  {/* Base Calculations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-700 dark:text-orange-300 font-medium">Subtotal:</span>
                      <span className="font-semibold text-orange-900 dark:text-orange-100">₱{total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-700 dark:text-orange-300 font-medium">Tax (12%):</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">₱{(total * 0.12).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Custom Discount Section */}
                  <div className="border-t border-orange-300/30 dark:border-orange-700/20 pt-2.5">
                    <label className="text-xs font-bold text-orange-700 dark:text-orange-300 block mb-2">Apply Discount:</label>
                    <select
                      value={selectedDiscount}
                      onChange={(e) => setSelectedDiscount(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-2.5 py-2 text-xs sm:text-sm font-semibold bg-stone-100 dark:bg-stone-800 border border-orange-300/50 dark:border-orange-700/30 rounded focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 cursor-pointer hover:border-orange-400/70 dark:hover:border-orange-600/50 transition-all"
                    >
                      <option value="">Select discount...</option>
                      {discountOptions.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Discount Amount Display */}
                  {discountValue > 0 && (
                    <div className="flex items-center justify-between text-xs border-t border-orange-300/30 dark:border-orange-700/20 pt-2">
                      <span className="text-red-600 dark:text-red-400 font-medium">Discount ({discountValue}%):</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Items Count */}
                  <div className="flex items-center justify-between text-xs border-t border-orange-300/30 dark:border-orange-700/20 pt-2">
                    <span className="text-orange-700 dark:text-orange-300 font-medium">Items:</span>
                    <span className="font-semibold text-orange-900 dark:text-orange-100">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                </div>
              )}

              {cart.length > 0 && !showTaxDiscount && (
                <div className="flex items-center justify-between text-xs text-orange-700 dark:text-orange-300 font-semibold">
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Flat Minimalist Design */}
          <div className="border-t border-orange-300/40 dark:border-orange-700/30 space-y-2.5 bg-stone-100/60 dark:bg-stone-800/50 px-3 py-3 sm:px-4 sm:py-4">
            {/* Primary Action - Buy */}
            <button
              onClick={onBuy}
              disabled={isLoading || cart.length === 0}
              className="group w-full flex items-center justify-center gap-2.5 rounded-md bg-orange-600 hover:bg-orange-700 px-3 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600 dark:focus:ring-orange-500 dark:focus:ring-offset-stone-900 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
                  <span>Complete Payment</span>
                </>
              )}
            </button>

            {/* Secondary Actions - Grid Layout */}
            <div className="grid grid-cols-2 gap-2">
              {/* Hold Button */}
              <button
                onClick={onHold}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 rounded-md border border-orange-300/50 bg-stone-100 hover:bg-stone-200 px-3 py-2.5 text-xs font-semibold text-orange-700 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-stone-100 dark:border-orange-600/40 dark:bg-stone-800/60 dark:hover:bg-stone-800/80 dark:text-orange-300 dark:focus:ring-orange-500 dark:focus:ring-offset-stone-900 shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon icon={faPause} className="h-3 w-3" />
                <span>Hold</span>
              </button>

              {/* GCash Payment Button */}
              <button
                onClick={onGCashPayment}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 rounded-md border border-blue-500/60 bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 dark:border-blue-500/50 dark:focus:ring-blue-400 dark:focus:ring-offset-stone-900 shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon icon={faCreditCard} className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Pay with GCash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
