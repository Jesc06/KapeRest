import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faShoppingCart, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, isExpanded = true }) => {
  const location = useLocation();
  const isSalesPage = location.pathname === '/cashier/sales';
  const isBuyItemPage = location.pathname === '/cashier';
  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-orange-300/50 bg-gradient-to-b from-stone-100/95 to-stone-50/90 backdrop-blur-xl transition-[width] duration-500 ease-in-out dark:border-orange-700/30 dark:from-stone-900/90 dark:to-stone-950/85 shadow-lg z-30 ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-64' : 'w-20'}`}>
      {/* Header with Branding */}
      <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-orange-300/40 bg-stone-100/90 backdrop-blur-lg px-4 py-5 dark:border-orange-700/30 dark:bg-stone-900/90 transition-[padding,justify-content] duration-500 ease-in-out">
        {isExpanded && (
          <>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
              <FontAwesomeIcon icon={faCoffee} className="text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold tracking-tight text-orange-900 dark:text-orange-100">KapeRest</h2>
              <p className="text-xs text-orange-700 font-medium dark:text-orange-300">POS Cashier</p>
            </div>
          </>
        )}
        {!isExpanded && (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
            <FontAwesomeIcon icon={faCoffee} className="text-base" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 space-y-2 ${isExpanded ? 'px-4' : 'px-2'} py-8 transition-[padding] duration-500 ease-in-out overflow-y-auto scroll-smooth`}>
        {/* Sales Link */}
        <Link
          to="/cashier/sales"
          className={`group flex items-center gap-3 rounded-sm border transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSalesPage
              ? 'border-orange-300/70 bg-gradient-to-r from-orange-100/80 to-orange-50/60 text-orange-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 dark:border-orange-400/50 dark:from-orange-500/20 dark:via-orange-400/12 dark:to-orange-400/8 dark:text-orange-200 dark:shadow-orange-500/15'
              : 'border-transparent text-orange-700 hover:border-orange-300/60 hover:bg-gradient-to-r hover:from-orange-100/60 hover:to-orange-50/50 hover:text-orange-900 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:hover:border-orange-700/60 dark:hover:text-orange-200'
          } focus:ring-orange-400 dark:focus:ring-orange-400 dark:focus:ring-offset-stone-900 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
          title={!isExpanded ? 'Sales' : ''}
        >
          <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 text-orange-600 dark:text-orange-400" />
          {isExpanded && (
            <>
              <span className="font-semibold">Sales</span>
            </>
          )}
        </Link>

        {/* Buy Item Link */}
        <Link
          to="/cashier"
          className={`group flex items-center gap-3 rounded-sm border transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isBuyItemPage
              ? 'border-orange-300/70 bg-gradient-to-r from-orange-100/80 to-orange-50/60 text-orange-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 dark:border-orange-400/50 dark:from-orange-500/20 dark:via-orange-400/12 dark:to-orange-400/8 dark:text-orange-200 dark:shadow-orange-500/15'
              : 'border-transparent text-orange-700 hover:border-orange-300/60 hover:bg-gradient-to-r hover:from-orange-100/60 hover:to-orange-50/50 hover:text-orange-900 dark:text-orange-300 dark:hover:bg-orange-900/30 dark:hover:border-orange-700/60 dark:hover:text-orange-200'
          } focus:ring-orange-400 dark:focus:ring-orange-400 dark:focus:ring-offset-stone-900 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
          title={!isExpanded ? 'Buy Item' : ''}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 text-orange-600 dark:text-orange-400" />
          {isExpanded && (
            <>
              <span>Buy Item</span>
              {isBuyItemPage && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-orange-300 text-white dark:bg-orange-500/60 dark:text-orange-100">
                  <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
                </span>
              )}
            </>
          )}
        </Link>
      </nav>

      </aside>

      {/* Close button for mobile - shown when sidebar is open */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 text-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl dark:from-orange-900/40 dark:to-orange-900/30 dark:hover:from-orange-900/60 dark:hover:to-orange-900/50 dark:text-orange-400"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
