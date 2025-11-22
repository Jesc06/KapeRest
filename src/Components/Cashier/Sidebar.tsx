import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faShoppingCart, faTimes, faHome, faPause, faReceipt } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, isExpanded = true }) => {
  const location = useLocation();
  const isSalesPage = location.pathname === '/cashier/sales';
  const isBuyItemPage = location.pathname === '/cashier/buy-item';
  const isHomePage = location.pathname === '/cashier';
  const isHoldItemsPage = location.pathname === '/cashier/hold-items';
  const isPurchasesPage = location.pathname === '/cashier/purchases';
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-900 transition-[width] duration-300 ease-in-out z-40 shadow-xl ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-72' : 'w-24'}`}>
      
      {/* Header with Branding */}
      <div className="sticky top-0 flex items-center justify-center border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-5 transition-all duration-300">
        {isExpanded ? (
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <FontAwesomeIcon icon={faCoffee} className="text-xl" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">KapeRest</h2>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide leading-none">Cashier</p>
            </div>
          </div>
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faCoffee} className="text-xl" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {/* Home Link */}
        <Link
          to="/cashier"
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isHomePage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faHome} className="text-lg flex-shrink-0 w-5 h-5" />
          {isExpanded && (
            <span className="flex-1 text-left font-medium truncate">Home</span>
          )}
        </Link>

        {/* Divider */}
        {isExpanded && (
          <div className="my-3 pt-1">
            <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
          </div>
        )}

        {/* Buy Item Link */}
        <Link
          to="/cashier/buy-item"
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isBuyItemPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="text-lg flex-shrink-0 w-5 h-5" />
          {isExpanded && (
            <span className="flex-1 text-left font-medium truncate">Buy Item</span>
          )}
        </Link>

        {/* Sales Link */}
        <Link
          to="/cashier/sales"
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isSalesPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="text-lg flex-shrink-0 w-5 h-5" />
          {isExpanded && (
            <span className="flex-1 text-left font-medium truncate">Sales</span>
          )}
        </Link>

        {/* Hold Items Link */}
        <Link
          to="/cashier/hold-items"
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isHoldItemsPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faPause} className="text-lg flex-shrink-0 w-5 h-5" />
          {isExpanded && (
            <span className="flex-1 text-left font-medium truncate">Hold Items</span>
          )}
        </Link>

        {/* Purchases Link */}
        <Link
          to="/cashier/purchases"
          className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
            isPurchasesPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faReceipt} className="text-lg flex-shrink-0 w-5 h-5" />
          {isExpanded && (
            <span className="flex-1 text-left font-medium truncate">Purchases</span>
          )}
        </Link>
      </nav>

      </aside>

      {/* Close button for mobile */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 transition-all duration-200 shadow-lg border border-neutral-200 dark:border-neutral-700"
        >
          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
