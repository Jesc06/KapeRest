import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faChartLine, faTimes, faChevronRight, faPlus, faList, faBuilding, faUtensils, faHome, faWarehouse, faClipboardList } from '@fortawesome/free-solid-svg-icons';

interface StaffSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isOpen = true, onClose, isExpanded = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Dropdown states - expanded by default on first visit, then persisted
  const [supplierOpen, setSupplierOpen] = useState(() => {
    const saved = localStorage.getItem('staffSidebar_supplierOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const [menuItemOpen, setMenuItemOpen] = useState(() => {
    const saved = localStorage.getItem('staffSidebar_menuItemOpen');
    return saved ? JSON.parse(saved) : true;
  });
  const [stocksOpen, setStocksOpen] = useState(() => {
    const saved = localStorage.getItem('staffSidebar_stocksOpen');
    return saved ? JSON.parse(saved) : true;
  });

  // Toggle functions - save state to localStorage
  const toggleSupplier = () => {
    const newState = !supplierOpen;
    setSupplierOpen(newState);
    localStorage.setItem('staffSidebar_supplierOpen', JSON.stringify(newState));
  };

  const toggleMenuItem = () => {
    const newState = !menuItemOpen;
    setMenuItemOpen(newState);
    localStorage.setItem('staffSidebar_menuItemOpen', JSON.stringify(newState));
  };

  const toggleStocks = () => {
    const newState = !stocksOpen;
    setStocksOpen(newState);
    localStorage.setItem('staffSidebar_stocksOpen', JSON.stringify(newState));
  };

  const isAddSupplier = location.pathname === '/staff/add-supplier';
  const isSupplierList = location.pathname === '/staff/suppliers';
  const isAddItem = location.pathname === '/staff/add-item';
  const isMenuItemList = location.pathname ==='/staff/items';
  const isSales = location.pathname === '/staff/sales';
  const isAddStocks = location.pathname === '/staff/add-stocks';
  const isStocksList = location.pathname === '/staff/stocks';
  const isHome = location.pathname === '/staff';
  const isAuditTrail = location.pathname === '/staff/audit-trail';

  // Check if any stocks-related route is active (including inventory view)
  const isStocksActive = isAddStocks || isStocksList;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-900 transition-[width] duration-300 ease-in-out z-40 shadow-xl ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-72' : 'w-20'}`}>
      {/* Header with Branding */}
        <div className="sticky top-0 flex items-center justify-center border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-5 transition-all duration-300">
          {isExpanded ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg"> 
                <FontAwesomeIcon icon={faCoffee} className="text-xl" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-tight">KapeRest</h2>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide leading-none">Staff Portal</p>
              </div>
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <FontAwesomeIcon icon={faCoffee} className="text-xl" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {/* Home - First Item */}
          <button
            onClick={() => navigate('/staff')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isHome
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate">Home</span>
            )}
          </button>

          {/* Divider */}
          {isExpanded && (
            <div className="my-3 pt-1">
              <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>
          )}

          {/* Menu Item Section */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (!isExpanded) return;
                toggleMenuItem();
              }}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isAddItem || isMenuItemList
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              <FontAwesomeIcon icon={faUtensils} className="text-lg flex-shrink-0 w-5 h-5" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left font-medium truncate">Menu Item</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-xs transition-transform duration-300 ease-in-out ${menuItemOpen ? 'rotate-90' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {isExpanded && (
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                menuItemOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="ml-3 mt-1 space-y-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/add-item');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      isAddItem
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs w-4 flex-shrink-0" />
                    <span>Add Item</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/items');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      isMenuItemList
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <FontAwesomeIcon icon={faList} className="text-xs w-4 flex-shrink-0" />
                    <span>Item List</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Supplier Section */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (!isExpanded) return;
                toggleSupplier();
              }}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isAddSupplier || isSupplierList
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              <FontAwesomeIcon icon={faBuilding} className="text-lg flex-shrink-0 w-5 h-5" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left font-medium truncate">Supplier</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-xs transition-transform duration-300 ease-in-out ${supplierOpen ? 'rotate-90' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {isExpanded && (
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                supplierOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="ml-3 mt-1 space-y-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/add-supplier');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      isAddSupplier
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs w-4 flex-shrink-0" />
                    <span>Add Supplier</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/suppliers');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      isSupplierList
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <FontAwesomeIcon icon={faList} className="text-xs w-4 flex-shrink-0" />
                    <span>Supplier List</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Inventory Section */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (!isExpanded) return;
                toggleStocks();
              }}
              className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isStocksActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              <FontAwesomeIcon icon={faWarehouse} className="text-lg flex-shrink-0 w-5 h-5" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left font-medium truncate">Inventory</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-xs transition-transform duration-300 ease-in-out ${stocksOpen ? 'rotate-90' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {isExpanded && (
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                stocksOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="ml-3 mt-1 space-y-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/add-stocks');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      isAddStocks
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs w-4 flex-shrink-0" />
                    <span>Add Stocks</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/stocks');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-all duration-200 ${
                      isStocksList
                        ? "text-orange-600 dark:text-orange-400 bg-orange-50/60 dark:bg-orange-950/20 font-medium"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30"
                    }`}
                  >
                    <FontAwesomeIcon icon={faList} className="text-xs w-4 flex-shrink-0" />
                    <span>View Inventory</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sales - Standalone */}
          <button
            onClick={() => navigate('/staff/sales')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isSales
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate">Sales</span>
            )}
          </button>

          {/* Divider - System Section */}
          {isExpanded && (
            <div className="my-3 pt-1">
              <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 px-4 pt-2">SYSTEM</p>
            </div>
          )}

          {/* Audit Trail */}
          <button
            onClick={() => navigate('/staff/audit-trail')}
            className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isAuditTrail
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-700 dark:text-neutral-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faClipboardList} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate">Audit Trail</span>
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

export default StaffSidebar;
