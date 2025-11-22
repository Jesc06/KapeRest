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
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Staff Portal</p>
              </div>
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
              <FontAwesomeIcon icon={faCoffee} className="text-2xl" />
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {/* Home - First Item */}
          <button
            onClick={() => navigate('/staff')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isHome
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Home</span>
            )}
          </button>

          {/* Divider */}
          {isExpanded && (
            <div className="py-2">
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
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                isAddItem || isMenuItemList
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              <FontAwesomeIcon icon={faUtensils} className="text-xl flex-shrink-0" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left text-lg font-semibold truncate">Menu Item</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-sm transition-transform duration-300 ease-in-out ${menuItemOpen ? 'rotate-90' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {isExpanded && (
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                menuItemOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="ml-6 mt-2 space-y-1 p-2 rounded-lg bg-stone-50/50 dark:bg-neutral-800/50 border border-stone-200/50 dark:border-neutral-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/add-item');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isAddItem
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isAddItem
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    </div>
                    <span>Add Item</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/items');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isMenuItemList
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isMenuItemList
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <FontAwesomeIcon icon={faList} className="text-xs" />
                    </div>
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
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                isAddSupplier || isSupplierList
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              <FontAwesomeIcon icon={faBuilding} className="text-xl flex-shrink-0" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left text-lg font-semibold truncate">Supplier</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-sm transition-transform duration-300 ease-in-out ${supplierOpen ? 'rotate-90' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {isExpanded && (
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                supplierOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="ml-6 mt-2 space-y-1 p-2 rounded-lg bg-stone-50/50 dark:bg-neutral-800/50 border border-stone-200/50 dark:border-neutral-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/add-supplier');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isAddSupplier
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isAddSupplier
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    </div>
                    <span>Add Supplier</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/suppliers');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isSupplierList
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isSupplierList
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <FontAwesomeIcon icon={faList} className="text-xs" />
                    </div>
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
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
                isStocksActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              <FontAwesomeIcon icon={faWarehouse} className="text-xl flex-shrink-0" />
              {isExpanded && (
                <>
                  <span className="flex-1 text-left text-lg font-semibold truncate">Inventory</span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={`text-sm transition-transform duration-300 ease-in-out ${stocksOpen ? 'rotate-90' : 'rotate-0'}`}
                  />
                </>
              )}
            </button>

            {/* Dropdown Items */}
            {isExpanded && (
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                stocksOpen ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="ml-6 mt-2 space-y-1 p-2 rounded-lg bg-stone-50/50 dark:bg-neutral-800/50 border border-stone-200/50 dark:border-neutral-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/add-stocks');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isAddStocks
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isAddStocks
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                    </div>
                    <span>Add Stocks</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/staff/stocks');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isStocksList
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 shadow-sm"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-sm"
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isStocksList
                        ? 'bg-orange-500 text-white'
                        : 'bg-stone-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      <FontAwesomeIcon icon={faList} className="text-xs" />
                    </div>
                    <span>View Inventory</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sales - Standalone */}
          <button
            onClick={() => navigate('/staff/sales')}
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

          {/* Divider - System Section */}
          {isExpanded && (
            <div className="py-2">
              <div className="border-t border-neutral-200 dark:border-neutral-700"></div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 px-5 pt-2">SYSTEM</p>
            </div>
          )}

          {/* Audit Trail */}
          <button
            onClick={() => navigate('/staff/audit-trail')}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${
              isAuditTrail
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-950/20 dark:hover:to-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faClipboardList} className="text-xl flex-shrink-0" />
            {isExpanded && (
              <span className="flex-1 text-left text-lg font-semibold truncate">Audit Trail</span>
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
