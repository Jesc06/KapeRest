import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faBox, faUser, faChartLine, faTimes } from '@fortawesome/free-solid-svg-icons';

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

  const navItems = [
    { label: 'Add Supplier', icon: faUser, path: '/staff/add-supplier', isActive: isAddSupplier },
    { label: 'Add MenuItem', icon: faBox, path: '/staff/add-item', isActive: isAddItem },
    { label: 'Sales', icon: faChartLine, path: '/staff/sales', isActive: isSales },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 transition-[width] duration-500 ease-in-out shadow-sm z-40 ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-64' : 'w-20'}`}>
        {/* Header with Branding */}
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-800 px-4 py-5 transition-[padding,justify-content] duration-500 ease-in-out">
          {isExpanded && (
            <>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
                <FontAwesomeIcon icon={faCoffee} className="text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-stone-100">KapeRest</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">POS Staff</p>
              </div>
            </>
          )}
          {!isExpanded && (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-sm">
              <FontAwesomeIcon icon={faCoffee} className="text-base" />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 space-y-2 ${isExpanded ? 'px-4' : 'px-2'} py-8 transition-[padding] duration-500 ease-in-out overflow-y-auto scroll-smooth`}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full group flex items-center gap-3 rounded-lg border transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                item.isActive
                  ? 'border-orange-600 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'border-stone-200 dark:border-neutral-700 text-neutral-600 dark:text-stone-400 hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400'
              } focus:ring-orange-600 dark:focus:ring-orange-400 dark:focus:ring-offset-neutral-800 ${isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
              title={!isExpanded ? item.label : ''}
            >
              <FontAwesomeIcon icon={item.icon} className="h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 text-orange-600 dark:text-orange-400" />
              {isExpanded && (
                <>
                  <span className="font-semibold">{item.label}</span>
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
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 shadow-md hover:shadow-lg border border-stone-200 dark:border-neutral-700"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default StaffSidebar;
