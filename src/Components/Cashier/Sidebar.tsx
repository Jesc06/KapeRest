import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faShoppingCart, faTimes } from '@fortawesome/free-solid-svg-icons';

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
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 transition-[width] duration-300 ease-in-out z-40 ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-64' : 'w-16'}`}>
      
      {/* Header with Branding */}
      <div className="sticky top-0 flex items-center justify-center border-b border-neutral-200 dark:border-neutral-700 px-3 py-4 transition-all duration-300">
        {isExpanded ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
              <FontAwesomeIcon icon={faCoffee} className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">KapeRest</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Cashier</p>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white">
            <FontAwesomeIcon icon={faCoffee} className="text-sm" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {/* Sales Link */}
        <Link
          to="/cashier/sales"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isSalesPage
              ? "bg-orange-500 text-white"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <FontAwesomeIcon icon={faChartLine} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-medium truncate">Sales</span>
          )}
        </Link>

        {/* Buy Item Link */}
        <Link
          to="/cashier"
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isBuyItemPage
              ? "bg-orange-500 text-white"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="text-base flex-shrink-0" />
          {isExpanded && (
            <span className="flex-1 text-left text-sm font-medium truncate">Buy Item</span>
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
