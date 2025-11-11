import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faShoppingCart, faTimes, faHome, faReceipt, faPause } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, isExpanded = true }) => {
  const location = useLocation();
  const isSalesPage = location.pathname === '/cashier/sales';
  const isBuyItemPage = location.pathname === '/cashier/buy-item';
  const isPurchasesPage = location.pathname === '/cashier/purchases';
  const isHoldItemsPage = location.pathname === '/cashier/hold-items';
  const isHomePage = location.pathname === '/cashier';
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-900 transition-[width] duration-300 ease-in-out z-40 shadow-xl ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-64' : 'w-16'}`}>
      
      {/* Header with Branding */}
      <div className="sticky top-0 flex items-center justify-center border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-3 py-4 transition-all duration-300">
        {isExpanded ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <FontAwesomeIcon icon={faCoffee} className="text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">KapeRest</h2>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Cashier</p>
            </div>
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faCoffee} className="text-base" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Home Link */}
        <Link
          to="/cashier"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isHomePage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faHome} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-semibold truncate">Home</span>
          )}
        </Link>

        {/* Divider */}
        {isExpanded && (
          <div className="py-2">
            <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
          </div>
        )}

        {/* Buy Item Link */}
        <Link
          to="/cashier/buy-item"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isBuyItemPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-semibold truncate">Buy Item</span>
          )}
        </Link>

        {/* Hold Items Link */}
        <Link
          to="/cashier/hold-items"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isHoldItemsPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faPause} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-semibold truncate">Hold Items</span>
          )}
        </Link>

        {/* Purchases Link */}
        <Link
          to="/cashier/purchases"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isPurchasesPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faReceipt} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-semibold truncate">Purchases</span>
          )}
        </Link>

        {/* Sales Link */}
        <Link
          to="/cashier/sales"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            isSalesPage
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
          }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-semibold truncate">Sales</span>
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
