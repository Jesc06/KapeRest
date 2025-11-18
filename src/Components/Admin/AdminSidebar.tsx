import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faTimes, faUsers, faPercent, faBoxes, faBuilding, faHome } from '@fortawesome/free-solid-svg-icons';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true, onClose, isExpanded = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/admin';
  const isAccounts = location.pathname === '/admin/accounts';
  const isTaxDiscounts = location.pathname === '/admin/tax-discounts';
  const isInventory = location.pathname === '/admin/inventory';
  const isBranch = location.pathname === '/admin/branch';
  const isSales = location.pathname === '/admin/sales';

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
        <div className="sticky top-0 flex items-center justify-center border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-5 py-6 transition-all duration-300">
          {isExpanded ? (
            <div className="flex items-center gap-4 w-full">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <FontAwesomeIcon icon={faCoffee} className="text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">KapeRest</h2>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Admin Portal</p>
              </div>
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <FontAwesomeIcon icon={faCoffee} className="text-2xl" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          {/* Dashboard */}
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isDashboard
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Dashboard</span>
            )}
          </button>

          {/* Divider - Operations */}
          {isExpanded && (
            <div className="py-2.5">
              <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>
          )}

          {/* Branch */}
          <button
            onClick={() => navigate('/admin/branch')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isBranch
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faBuilding} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Branch</span>
            )}
          </button>

          {/* Accounts */}
          <button
            onClick={() => navigate('/admin/accounts')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isAccounts
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faUsers} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Accounts</span>
            )}
          </button>

          {/* Divider - Inventory & Products */}
          {isExpanded && (
            <div className="py-2.5">
              <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>
          )}

          {/* Inventory */}
          <button
            onClick={() => navigate('/admin/inventory')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isInventory
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faBoxes} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Inventory</span>
            )}
          </button>

          {/* Divider - Financial */}
          {isExpanded && (
            <div className="py-2.5">
              <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>
          )}

          {/* Sales */}
          <button
            onClick={() => navigate('/admin/sales')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isSales
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Sales</span>
            )}
          </button>

          {/* Tax & Discounts */}
          <button
            onClick={() => navigate('/admin/tax-discounts')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isTaxDiscounts
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faPercent} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Tax & Discounts</span>
            )}
          </button>
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

export default AdminSidebar;
