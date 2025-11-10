import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faSearch, faPlus, faMinus, faTrash, faCheck, faPause, faCreditCard, faBars, faShoppingCart, faChevronLeft, faChevronRight, faChevronDown, faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';

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
  onLogout,
  userRole = 'Cashier',
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  return (
    <div className={`flex h-screen w-full flex-col bg-stone-50 dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
      {/* Top Bar - Search & Filters */}
      <div className="sticky top-0 z-10 border-b border-neutral-300/80 bg-white/95 dark:border-neutral-700/80 dark:bg-neutral-900/50 px-4 sm:px-5 md:px-6 py-3 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
        {/* Top Section: Sidebar Toggle | Search Bar | Logout Panel */}
        <div className="flex items-center justify-between gap-3 sm:gap-4 mb-3">
          {/* Left Section: Sidebar Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-900/30 bg-white hover:bg-neutral-100 text-neutral-700 transition-all duration-200 shadow-sm dark:border-neutral-700/50 dark:bg-neutral-900/50 dark:hover:bg-neutral-900/70 dark:text-neutral-100"
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

          {/* Center Section: Amazon-Style Search Bar - Full Width */}
          <div className="flex-1 flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-2 sm:p-2.5 shadow-lg">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="h-5 w-5 text-white ml-2 sm:ml-3 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchText}
              onChange={e => onSearchChange(e.target.value)}
              className="flex-1 bg-white rounded-md px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-neutral-900 placeholder:text-neutral-500 shadow-none focus:outline-none transition-all duration-300"
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-md transition-all duration-200 flex-shrink-0 text-xs sm:text-sm">
              Search
            </button>
          </div>

          {/* Right Section: User Dropdown Menu - Absolute Position */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 rounded-lg bg-white/70 dark:bg-neutral-900/50 border border-neutral-300/70 dark:border-neutral-700/70 shadow-sm backdrop-blur-sm flex-shrink-0">
            {/* Divider */}
            <div className="h-7 w-px bg-neutral-200/50 dark:bg-neutral-700/50" />
            
            {/* Terminal Info */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 opacity-75">Terminal</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">Main Counter</span>
            </div>
            
            {/* Divider */}
            <div className="h-7 w-px bg-neutral-200/50 dark:bg-neutral-700/50" />
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute h-2 w-2 rounded-full bg-orange-400 animate-pulse dark:bg-orange-300" />
                <div className="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400" />
              </div>
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Online</span>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-neutral-200/60 dark:bg-neutral-700/60" />

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                title="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                </div>
                <FontAwesomeIcon icon={faChevronDown} className={`h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold transition-all duration-200 border ${
                  selectedCategory === category
                    ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-md hover:shadow-lg hover:scale-105 dark:border-orange-400/60 dark:bg-orange-500/15 dark:text-orange-300'
                    : 'border-neutral-300/80 bg-neutral-50/80 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-100 hover:shadow-sm dark:border-neutral-700/60 dark:bg-neutral-900/40 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dropdown Menu Portal - Rendered outside sticky context */}
      {showUserMenu && (
        <>
          {/* Click-outside overlay */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowUserMenu(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="fixed top-[calc(4.5rem+0.5rem)] right-4 sm:right-5 md:right-6 w-56 rounded-lg border border-neutral-300/80 bg-white shadow-2xl dark:border-neutral-700/70 dark:bg-neutral-900/95 backdrop-blur-sm z-[1000]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-300/60 dark:border-neutral-700/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Cashier</p>
              <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50 mt-1">Main Counter</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Settings */}
              <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors duration-150 flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Profile Settings</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-neutral-200/0 via-neutral-200/50 to-neutral-200/0 dark:via-neutral-700/30" />

            {/* Logout */}
            <div className="py-2">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout?.();
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 flex items-center gap-3 group"
              >
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                  <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                </div>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden gap-4 sm:gap-5 p-4 sm:p-5 md:p-6">
        {/* Products Section (Scrollable) */}
        <div className="flex-1 flex flex-col rounded-2xl border border-neutral-300/80 dark:border-neutral-700/80 bg-gradient-to-br from-white via-stone-50/50 to-white/90 shadow-lg dark:from-neutral-900/50 dark:via-neutral-900/40 dark:to-neutral-900/50 overflow-hidden">
          {/* Header */}
          <div className="border-b border-neutral-300/60 dark:border-neutral-700/60 bg-white/95 dark:bg-neutral-900/50 px-6 py-4">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
              <FontAwesomeIcon icon={faCoffee} className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span>Available Items</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400 text-sm ml-1">({filteredProducts.length})</span>
            </h3>
          </div>

          {/* Products Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4 scroll-smooth">
            <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-max">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => onAddToCart(product)}
                    className="group cursor-pointer rounded border border-neutral-400/70 bg-white transition-all duration-300 hover:border-neutral-500 hover:-translate-y-1 active:scale-95 dark:bg-neutral-900/50 dark:border-neutral-600/70 dark:hover:border-neutral-500 overflow-hidden flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900/50">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20">
                          <FontAwesomeIcon icon={faCoffee} className="h-8 w-8 text-orange-400 dark:text-orange-600" />
                        </div>
                      )}
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
                    </div>

                    {/* Content - Bottom Section */}
                    <div className="flex-1 flex flex-col p-2.5 sm:p-3">
                      <div className="flex-1 min-w-0 mb-2">
                        <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm leading-tight dark:text-neutral-100 line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="mt-1 text-[10px] sm:text-xs text-neutral-500 font-medium dark:text-neutral-400 line-clamp-1">
                          {product.category}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/40">
                        <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">
                          ₱{product.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className="inline-flex items-center justify-center rounded-md bg-orange-500 hover:bg-orange-600 p-1.5 sm:p-2 text-xs font-bold text-white transition-all duration-200 hover:shadow-md active:scale-95 dark:bg-orange-600 dark:hover:bg-orange-700 shadow-sm"
                        >
                          <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900/50">
                      <FontAwesomeIcon icon={faSearch} className="h-6 w-6 text-neutral-400 dark:text-neutral-600" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                      No items found
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                      Try adjusting your filters or search query
                    </p>
                    <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                      Try adjusting your filters
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full sm:w-96 md:w-[28rem] lg:w-[32rem] flex flex-col rounded-2xl border border-neutral-300/80 dark:border-neutral-700/80 bg-gradient-to-br from-white via-stone-50/50 to-white/90 shadow-lg dark:from-neutral-900/50 dark:via-neutral-900/40 dark:to-neutral-900/50 overflow-hidden flex-shrink-0">
          {/* Cart Header */}
          <div className="border-b border-neutral-300/60 bg-white/95 dark:border-neutral-700/60 dark:bg-neutral-900/50 px-6 py-4">
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
                  className="group flex items-center gap-3 rounded-lg border border-neutral-300/70 bg-white/80 p-3 shadow-sm transition-all duration-300 hover:border-orange-400/60 hover:shadow-md hover:bg-white dark:border-neutral-700/70 dark:bg-neutral-900/40 dark:hover:border-orange-400/40 dark:hover:shadow-orange-500/10"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white font-bold transition-all duration-300 flex-shrink-0 shadow-sm dark:bg-orange-600">
                    <FontAwesomeIcon icon={faCoffee} size="sm" />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-neutral-900 dark:text-neutral-100 leading-tight line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-neutral-600 mt-0.5 dark:text-neutral-300 font-semibold">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-neutral-200 to-neutral-100 hover:from-neutral-300 hover:to-neutral-200 text-neutral-700 font-bold text-xs transition-all duration-200 active:scale-90 dark:from-neutral-700/60 dark:to-neutral-700/40 dark:hover:from-neutral-600/80 dark:hover:to-neutral-600/60 dark:text-neutral-100 shadow-md hover:shadow-lg"
                    >
                      <FontAwesomeIcon icon={faMinus} className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs text-neutral-900 dark:text-neutral-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-neutral-200 to-neutral-100 hover:from-neutral-300 hover:to-neutral-200 text-neutral-700 font-bold text-xs transition-all duration-200 active:scale-90 dark:from-neutral-700/60 dark:to-neutral-700/40 dark:hover:from-neutral-600/80 dark:hover:to-neutral-600/60 dark:text-neutral-100 shadow-md hover:shadow-lg"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-red-200 to-red-100 hover:from-red-300 hover:to-red-200 text-red-700 font-bold text-xs transition-all duration-200 active:scale-90 dark:from-red-500/40 dark:to-red-500/30 dark:hover:from-red-500/50 dark:hover:to-red-500/40 dark:text-red-300 shadow-md hover:shadow-lg flex-shrink-0"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>

                  {/* Line Total Tooltip */}
                  <div className="text-right text-[10px] font-black text-orange-600 dark:text-orange-300 whitespace-nowrap">
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
          <div className="border-t border-neutral-300/60 bg-gradient-to-b from-white/90 to-stone-50/90 px-4 py-5 dark:border-neutral-700/60 dark:from-neutral-900/60 dark:to-neutral-900/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-300/60 dark:border-neutral-700/60">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Amount</span>
                <span className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent dark:from-orange-400 dark:to-orange-500">
                  ₱{total.toFixed(2)}
                </span>
              </div>
              {cart.length > 0 && (
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-3 w-3" />
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'} in cart
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Flat Minimalist Design */}
          <div className="border-t border-neutral-300/70 space-y-2.5 bg-white/80 px-3 py-3 sm:px-4 sm:py-4 dark:border-neutral-700/70 dark:bg-neutral-900/50 backdrop-blur-sm">
            {/* Primary Action - Buy */}
            <button
              onClick={onBuy}
              disabled={isLoading || cart.length === 0}
              className="group w-full flex items-center justify-center gap-2.5 rounded-md bg-orange-600 hover:bg-orange-700 px-3 py-2.5 text-xs font-bold text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600 dark:focus:ring-orange-500 dark:focus:ring-offset-neutral-900 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
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
                className="group flex items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 px-3 py-2.5 text-xs font-semibold text-neutral-700 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-50 dark:border-neutral-600/50 dark:bg-neutral-800/50 dark:hover:bg-neutral-700/60 dark:text-neutral-300 dark:focus:ring-neutral-500 dark:focus:ring-offset-neutral-900 shadow-sm"
              >
                <FontAwesomeIcon icon={faPause} className="h-3 w-3" />
                <span>Hold</span>
              </button>

              {/* GCash Payment Button */}
              <button
                onClick={onGCashPayment}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 text-xs font-semibold text-blue-700 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50 dark:border-blue-600/50 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:focus:ring-blue-500 dark:focus:ring-offset-neutral-900 shadow-sm"
              >
                <FontAwesomeIcon icon={faCreditCard} className="h-3 w-3" />
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
