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
            <div className="flex items-center gap-3 flex-1">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="h-4 w-4 text-neutral-600 dark:text-neutral-400 flex-shrink-0"
              />
              <input
                type="text"
                placeholder="Search items..."
                value={searchText}
                onChange={e => onSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 shadow-none focus:outline-none"
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
          <div className="bg-stone-100 dark:bg-neutral-800 rounded-lg border border-stone-300 dark:border-neutral-700 px-3 py-2.5 shadow-sm">
            <p className="text-xs font-semibold tracking-widest text-neutral-600 dark:text-neutral-400 mb-2 uppercase">Categories</p>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold transition-all duration-300 border ${
                    selectedCategory === category
                      ? 'border-orange-600 bg-orange-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                      : 'border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white hover:border-orange-300 dark:hover:border-orange-700 hover:bg-stone-50 dark:hover:bg-neutral-800 active:scale-95 hover:scale-105'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

        {/* Products Section (Scrollable) */}
        <div className="flex-1 flex flex-col rounded-lg border border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-4 py-3">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faCoffee} className="h-4 w-4 text-orange-600" />
              <span>Available Items</span>
              <span className="font-semibold text-stone-600 dark:text-stone-400 text-sm">({filteredProducts.length})</span>
            </h3>
          </div>

          {/* Products Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-3 scroll-smooth">
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 auto-rows-max">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => onAddToCart(product)}
                    className="product-card-motion group cursor-pointer rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 transition-all duration-300 hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500 active:scale-95 hover:-translate-y-1 overflow-hidden flex flex-col"
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 dark:from-neutral-700 dark:to-neutral-800">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-neutral-800 group-hover:bg-stone-200 dark:group-hover:bg-neutral-700 transition-all duration-300">
                          <FontAwesomeIcon icon={faCoffee} className="h-6 w-6 text-stone-400 dark:text-stone-500" />
                        </div>
                      )}
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                    </div>

                    {/* Content - Bottom Section */}
                    <div className="flex-1 flex flex-col p-2.5">
                      <div className="flex-1 min-w-0 mb-2">
                        <h4 className="font-semibold text-xs sm:text-sm leading-tight text-neutral-900 dark:text-white line-clamp-2">
                          {product.name}
                        </h4>
                        <p className="mt-0.5 text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                          {product.category}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-neutral-800">
                        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          ₱{product.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className="inline-flex items-center justify-center rounded-md bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 p-1.5 text-white transition-all duration-200 hover:shadow-md active:scale-95 shadow-sm"
                        >
                          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center px-4">
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 dark:bg-neutral-700">
                      <FontAwesomeIcon icon={faSearch} className="h-6 w-6 text-stone-500 dark:text-neutral-400" />
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
        <div className="w-full sm:w-72 md:w-[22rem] lg:w-[24rem] h-full flex flex-col rounded-lg border border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 shadow-sm overflow-hidden flex-shrink-0">
          {/* Cart Header */}
          <div className="border-b border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-4 py-3">
            <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingCart} className="h-4 w-4 text-orange-600" />
              <span>Shopping Cart</span>
              <span className="font-semibold text-stone-600 dark:text-stone-400 text-sm ml-auto bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-full border border-stone-200 dark:border-neutral-700">({cart.length})</span>
            </h3>
          </div>

          {/* Cart Items (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scroll-smooth">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div
                  key={item.id}
                  className="cart-item-motion group flex items-start gap-3 rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-600 text-white font-semibold transition-all duration-300 flex-shrink-0 shadow-sm text-xs">
                    <FontAwesomeIcon icon={faCoffee} size="xs" />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-neutral-900 dark:text-white leading-tight line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      ₱{item.price} × {item.quantity}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold text-xs transition-all duration-200 active:scale-90 hover:bg-stone-50 dark:hover:bg-neutral-700"
                    >
                      <FontAwesomeIcon icon={faMinus} className="h-2.5 w-2.5" />
                    </button>
                    <span className="w-5 text-center font-semibold text-xs text-neutral-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold text-xs transition-all duration-200 active:scale-90 hover:bg-stone-50 dark:hover:bg-neutral-700"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all duration-200 active:scale-90 flex-shrink-0 shadow-sm"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-2.5 w-2.5" />
                  </button>

                  {/* Line Total */}
                  <div className="text-right text-xs font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap ml-1">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center py-10">
                <div className="text-center">
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 dark:bg-neutral-700">
                    <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 text-stone-500 dark:text-neutral-400" />
                  </div>
                  <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                    Cart is empty
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Footer with Total */}
          <div className="border-t border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-3 py-3">
            <div className="space-y-2">
              {/* Final Total Amount Section */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-widest text-stone-600 dark:text-stone-400 uppercase">Total</span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₱{finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Discount & Tax Dropdown */}
              <button
                onClick={() => setShowTaxDiscount(!showTaxDiscount)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-stone-50 dark:hover:bg-neutral-800 transition-all duration-200 text-xs"
              >
                <span className="font-semibold text-neutral-900 dark:text-white">Breakdown</span>
                <FontAwesomeIcon icon={faChevronDown} className={`h-3 w-3 text-neutral-900 dark:text-white transition-transform duration-300 ${showTaxDiscount ? 'rotate-180' : ''}`} />
              </button>

              {/* Tax, Discount Details */}
              {showTaxDiscount && (
                <div className="space-y-2 pt-2 border-t border-stone-300 dark:border-neutral-700">
                  {/* Base Calculations */}
                  <div className="space-y-1.5 text-xs">
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
                  <div className="border-t border-stone-300 dark:border-neutral-700 pt-2">
                    <label className="text-xs font-semibold text-neutral-900 dark:text-white block mb-1">Discount:</label>
                    <select
                      value={selectedDiscount}
                      onChange={(e) => setSelectedDiscount(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-stone-300 dark:border-neutral-700 rounded font-semibold text-neutral-900 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 transition-all focus:outline-none focus:ring-1 focus:ring-orange-600"
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
                    <div className="flex items-center justify-between text-xs border-t border-stone-300 dark:border-neutral-700 pt-1.5">
                      <span className="text-red-600 dark:text-red-400 font-semibold">Discount:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">-₱{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Items Count */}
                  <div className="flex items-center justify-between text-xs border-t border-stone-300 dark:border-neutral-700 pt-1.5">
                    <span className="text-neutral-900 dark:text-white font-semibold">Items:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-stone-300 dark:border-neutral-700 space-y-2 bg-stone-50 dark:bg-neutral-800 px-3 py-3">
            {/* Primary Action - Buy */}
            <button
              onClick={onBuy}
              disabled={isLoading || cart.length === 0}
              className="group w-full flex items-center justify-center gap-2 rounded-md bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-3 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 dark:disabled:hover:bg-orange-500 shadow-sm hover:shadow-md hover:scale-105 disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                  <span>Complete</span>
                </>
              )}
            </button>

            {/* Secondary Actions - Grid Layout */}
            <div className="grid grid-cols-2 gap-2">
              {/* Hold Button */}
              <button
                onClick={onHold}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 rounded-md border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:border-orange-400 dark:hover:border-orange-500 px-3 py-2 text-xs font-semibold text-neutral-900 dark:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <FontAwesomeIcon icon={faPause} className="h-3 w-3" />
                <span>Hold</span>
              </button>

              {/* GCash Payment Button */}
              <button
                onClick={onGCashPayment}
                disabled={isLoading || cart.length === 0}
                className="group flex items-center justify-center gap-1.5 rounded-md border border-blue-600 bg-blue-600 hover:bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-sm hover:shadow-md"
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
