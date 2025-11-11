import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faBox, faUser, faChartLine, faTimes, faCheck, faWarehouse } from '@fortawesome/free-solid-svg-icons';

interface StaffSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isOpen = true, onClose, isExpanded = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAddSupplier = location.pathname === '/staff/add-supplier';
  const isAddItem = location.pathname === '/staff/add-item';
  const isSales = location.pathname === '/staff/sales';
  const isAddStocks = location.pathname === '/staff/add-stocks';

  const navItems = [
    { label: 'Add Supplier', icon: faUser, path: '/staff/add-supplier', isActive: isAddSupplier },
    { label: 'Add MenuItem', icon: faBox, path: '/staff/add-item', isActive: isAddItem },
    { label: 'Add Stocks', icon: faWarehouse, path: '/staff/add-stocks', isActive: isAddStocks },
    { label: 'Sales', icon: faChartLine, path: '/staff/sales', isActive: isSales },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-stone-300 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 transition-[width] duration-500 ease-in-out shadow-sm z-40 ${
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
                <p className="text-xs text-stone-600 font-medium dark:text-stone-400">POS Staff</p>
              </div>
            </>
          )}
          {!isExpanded && (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 dark:bg-orange-500 text-white shadow-md">
              <FontAwesomeIcon icon={faCoffee} className="text-base" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border shadow-sm ${
                item.isActive
                  ? "border-orange-600 dark:border-orange-500 bg-orange-600 dark:bg-orange-500 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  : "border-stone-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-orange-600 hover:shadow-md"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left text-sm font-medium truncate">{item.label}</span>
                  {item.isActive && (
                    <FontAwesomeIcon icon={faCheck} className="text-sm flex-shrink-0" />
                  )}
                </>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Close button for mobile - shown when sidebar is open */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-neutral-900 hover:bg-stone-100 dark:hover:bg-neutral-800 text-orange-600 dark:text-orange-400 transition-all duration-200 shadow-md hover:shadow-lg border border-stone-300 dark:border-neutral-700"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default StaffSidebar;
