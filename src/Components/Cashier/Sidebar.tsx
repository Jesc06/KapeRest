import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faShoppingCart, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, isExpanded = true }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-neutral-900/20 bg-gradient-to-b from-white/95 to-stone-50/90 backdrop-blur-xl transition-[width] duration-500 ease-in-out dark:border-neutral-800/60 dark:from-neutral-900/90 dark:to-neutral-900/80 overflow-y-auto shadow-lg z-30 ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-64' : 'w-20'}`}>
      {/* Header with Branding */}
      <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-neutral-900/15 bg-white/90 backdrop-blur-lg px-4 py-5 dark:border-neutral-800/60 dark:bg-neutral-900/90 transition-[padding,justify-content] duration-500 ease-in-out">
        {isExpanded && (
          <>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
              <FontAwesomeIcon icon={faCoffee} className="text-base" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100">KapeRest</h2>
              <p className="text-xs text-neutral-500 font-medium dark:text-neutral-400">POS Cashier</p>
            </div>
          </>
        )}
        {!isExpanded && (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md">
            <FontAwesomeIcon icon={faCoffee} className="text-base" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={`flex-1 space-y-2 ${isExpanded ? 'px-4' : 'px-2'} py-8 transition-[padding] duration-500 ease-in-out overflow-y-auto scroll-smooth`}>
        {/* Sales Link */}
        <Link
          to="#sales"
          className={`group flex items-center gap-3 rounded-lg border border-transparent text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-900/30 hover:bg-gradient-to-r hover:from-neutral-100 hover:to-neutral-50 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:border-neutral-700 dark:hover:text-neutral-100 dark:focus:ring-amber-300 dark:focus:ring-offset-neutral-900 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
          title={!isExpanded ? 'Sales' : ''}
        >
          <FontAwesomeIcon icon={faChartLine} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 text-amber-600 dark:text-amber-400" />
          {isExpanded && (
            <>
              <span className="font-semibold">Sales</span>
              <span className="ml-auto text-xs bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full text-[10px] font-bold dark:bg-neutral-800 dark:text-neutral-400">Soon</span>
            </>
          )}
        </Link>

        {/* Buy Item Link (Active) */}
        <Link
          to="#buy-item"
          className={`group flex items-center gap-3 rounded-lg border border-neutral-900/30 bg-gradient-to-r from-neutral-100/80 to-neutral-50/60 text-sm font-bold text-neutral-900 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-amber-400/50 dark:from-amber-500/25 dark:via-amber-400/15 dark:to-amber-400/10 dark:text-amber-200 dark:shadow-amber-400/20 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
          title={!isExpanded ? 'Buy Item' : ''}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-3 text-amber-600 dark:text-amber-400" />
          {isExpanded && (
            <>
              <span>Buy Item</span>
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-white dark:bg-green-500/40 dark:text-green-200">
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
              </span>
            </>
          )}
        </Link>
      </nav>

      </aside>

      {/* Close button for mobile - shown when sidebar is open */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-100 hover:from-neutral-300 hover:to-neutral-200 text-neutral-700 transition-all duration-200 shadow-lg"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
