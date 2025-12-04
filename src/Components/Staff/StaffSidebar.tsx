import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faTimes, faBuilding, faUtensils, faHome, faWarehouse, faClipboardList, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import KapeRestLogo from '../../assets/KapeRest.png';
import { useLanguage } from '../../context/LanguageContext';

interface StaffSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isExpanded?: boolean;
}

const StaffSidebar: React.FC<StaffSidebarProps> = ({ isOpen = true, onClose, isExpanded = false }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isAddSupplier = location.pathname === '/staff/add-supplier';
  const isSupplierList = location.pathname === '/staff/suppliers';
  const isAddItem = location.pathname === '/staff/add-item';
  const isMenuItemList = location.pathname ==='/staff/items';
  const isSales = location.pathname === '/staff/sales';
  const isPurchases = location.pathname === '/staff/purchases';
  const isAddStocks = location.pathname === '/staff/add-stocks';
  const isStocksList = location.pathname === '/staff/stocks';
  const isHome = location.pathname === '/staff';
  const isAuditTrail = location.pathname === '/staff/audit-trail';

  // Check if any supplier/item/stocks-related route is active
  const isSupplierActive = isAddSupplier || isSupplierList;
  const isItemActive = isAddItem || isMenuItemList;
  const isStocksActive = isAddStocks || isStocksList;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen flex flex-col flex-shrink-0 border-r border-neutral-200 dark:border-stone-700 bg-gradient-to-b from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-900 transition-all duration-300 ease-in-out z-40 shadow-xl ${
        !isOpen ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0 ${isExpanded ? 'w-80' : 'w-28'}`}>
      {/* Header with Branding */}
        <div className="sticky top-0 flex items-center justify-center border-b border-neutral-200 dark:border-stone-700 bg-stone-50/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-5 transition-all duration-300">
          {isExpanded ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg p-2"> 
                <img src={KapeRestLogo} alt="KapeRest" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h2 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight leading-tight">KapeRest</h2>
                <p className="text-base font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide leading-none">Staff Portal</p>
              </div>
            </div>
          ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg p-2">
            <img src={KapeRestLogo} alt="KapeRest" className="w-full h-full object-contain brightness-0 invert" />
          </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {/* 1. DASHBOARD - Most frequently accessed */}
          <button
            onClick={() => navigate('/staff')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isHome
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faHome} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('sidebar.dashboard')}</span>
            )}
          </button>

          {/* Divider - Core Operations */}
          {isExpanded && (
            <div className="my-3 pt-1">
              <div className="border-t border-neutral-200 dark:border-stone-700"></div>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400 px-4 pt-3 uppercase tracking-wider">Core Operations</p>
            </div>
          )}

          {/* 2. SUPPLIERS - Direct to list view */}
          <button
            onClick={() => navigate('/staff/suppliers')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isSupplierActive
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faBuilding} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('staff.suppliers')}</span>
            )}
          </button>

          {/* 3. MENU ITEMS - Direct to list view */}
          <button
            onClick={() => navigate('/staff/items')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isItemActive
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faUtensils} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('staff.items')}</span>
            )}
          </button>

          {/* 4. INVENTORY - Direct to list view */}
          <button
            onClick={() => navigate('/staff/stocks')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isStocksActive
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faWarehouse} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('sidebar.inventory')}</span>
            )}
          </button>

          {/* Divider - Reports & Analytics */}
          {isExpanded && (
            <div className="my-3 pt-1">
              <div className="border-t border-neutral-200 dark:border-stone-700"></div>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400 px-4 pt-3 uppercase tracking-wider">Reports & Analytics</p>
            </div>
          )}

          {/* 5. SALES - Financial reporting */}
          <button
            onClick={() => navigate('/staff/sales')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isSales
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faChartLine} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('sidebar.sales')}</span>
            )}
          </button>

          {/* 6. PURCHASES - Transaction history */}
          <button
            onClick={() => navigate('/staff/purchases')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isPurchases
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faShoppingCart} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('staff.purchases')}</span>
            )}
          </button>

          {/* Divider - System & Security */}
          {isExpanded && (
            <div className="my-3 pt-1">
              <div className="border-t border-neutral-200 dark:border-stone-700"></div>
              <p className="text-xs font-black text-orange-600 dark:text-orange-400 px-4 pt-3 uppercase tracking-wider">System & Security</p>
            </div>
          )}

          {/* 7. AUDIT TRAIL - System monitoring */}
          <button
            onClick={() => navigate('/staff/audit-trail')}
            className={`w-full flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
              isAuditTrail
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                : "text-stone-700 dark:text-stone-300 hover:bg-orange-50/80 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400"
            }`}
          >
            <FontAwesomeIcon icon={faClipboardList} className="text-lg flex-shrink-0 w-5 h-5" />
            {isExpanded && (
              <span className="flex-1 text-left font-medium truncate break-words line-clamp-1">{t('admin.auditTrail')}</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Close button for mobile */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-4 top-4 z-40 lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 transition-all duration-200 shadow-lg border border-neutral-200 dark:border-stone-700"
        >
          <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
        </button>
      )}
    </>
  );
};

export default StaffSidebar;


