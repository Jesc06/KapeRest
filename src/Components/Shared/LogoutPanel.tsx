import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser, faSignOutAlt, faLock } from '@fortawesome/free-solid-svg-icons';

interface LogoutPanelProps {
  userRole?: string;
}

const LogoutPanel: React.FC<LogoutPanelProps> = ({ userRole = 'Cashier' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="hidden sm:flex items-center justify-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 rounded-lg bg-stone-100 dark:bg-neutral-800 border border-stone-200 dark:border-neutral-700 shadow-sm backdrop-blur-sm flex-shrink-0">
      {/* Divider */}
      <div className="h-7 w-px bg-stone-300 dark:bg-neutral-700" />

      {/* Terminal Info */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-600 dark:text-stone-400 opacity-75">Terminal</span>
        <span className="text-sm font-bold text-neutral-900 dark:text-stone-100">Main Counter</span>
      </div>

      {/* Divider */}
      <div className="h-7 w-px bg-stone-300 dark:bg-neutral-700" />

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-pulse dark:bg-green-400" />
          <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-500" />
        </div>
        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Online</span>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-stone-300 dark:bg-neutral-700" />

      {/* User Menu Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-stone-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
          title="User menu"
        >
          <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
          </div>
          <FontAwesomeIcon icon={faChevronDown} className={`h-3.5 w-3.5 text-neutral-600 dark:text-stone-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-stone-200 dark:border-neutral-700">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-stone-400">Account</p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-stone-100 mt-1">{userRole}</p>
            </div>
            
            {/* Account Settings Section */}
            <div className="py-2">
              <button
                onClick={() => {
                  // Navigate to the correct change password page based on current location
                  const isStaffPage = location.pathname.startsWith('/staff');
                  navigate(isStaffPage ? '/staff/change-password' : '/cashier/change-password');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-neutral-700 transition-all duration-200"
              >
                <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-stone-200 dark:bg-neutral-700" />

            {/* Logout Section */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoutPanel;
