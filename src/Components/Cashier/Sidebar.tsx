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
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 transition-[width] duration-500 ease-in-out shadow-sm z-30 ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-64' : 'w-20'}`}>
      {/* Header with Branding */}
      <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-5 transition-[padding,justify-content] duration-500 ease-in-out">
        {isExpanded && (
          <>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 dark:bg-orange-500 text-white shadow-md">
              <FontAwesomeIcon icon={faCoffee} className="text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">KapeRest</h2>
              <p className="text-xs text-stone-600 font-medium dark:text-stone-400">POS Cashier</p>
            </div>
          </>
        )}
        {!isExpanded && (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 dark:bg-orange-500 text-white shadow-md">
            <FontAwesomeIcon icon={faCoffee} className="text-base" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 space-y-2 ${isExpanded ? 'px-4' : 'px-2'} py-8 transition-[padding] duration-500 ease-in-out overflow-y-auto scroll-smooth`}>
        {/* Sales Link */}
        <Link
          to="/cashier/sales"
          className={`group flex items-center gap-3 rounded-lg border transition-all duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSalesPage
              ? 'border-orange-600 dark:border-orange-500 bg-orange-600 dark:bg-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
              : 'border-stone-300 dark:border-neutral-700 text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:shadow-md'
          } focus:ring-orange-600 dark:focus:ring-orange-500 dark:focus:ring-offset-neutral-800 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
          title={!isExpanded ? 'Sales' : ''}
        >
          <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" />
          {isExpanded && (
            <>
              <span>Sales</span>
            </>
          )}
        </Link>

        {/* Buy Item Link */}
        <Link
          to="/cashier"
          className={`group flex items-center gap-3 rounded-lg border transition-all duration-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isBuyItemPage
              ? 'border-orange-600 dark:border-orange-500 bg-orange-600 dark:bg-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
              : 'border-stone-300 dark:border-neutral-700 text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-stone-100 dark:hover:bg-neutral-800 hover:shadow-md'
          } focus:ring-orange-600 dark:focus:ring-orange-500 dark:focus:ring-offset-neutral-800 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
          title={!isExpanded ? 'Buy Item' : ''}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3" />
          {isExpanded && (
            <>
              <span>Buy Item</span>
              {isBuyItemPage && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400">
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
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-stone-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
