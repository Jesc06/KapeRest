import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser, faSignOutAlt, faLock } from '@fortawesome/free-solid-svg-icons';

interface LogoutPanelProps {
  userRole?: string;
}

const LogoutPanel: React.FC<LogoutPanelProps> = ({ userRole = 'Cashier' }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="hidden sm:flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 rounded-lg bg-stone-100/80 dark:bg-stone-800/60 border border-orange-300/50 dark:border-orange-700/30 shadow-sm backdrop-blur-sm flex-shrink-0">
      {/* Divider */}
      <div className="h-7 w-px bg-orange-300/50 dark:bg-orange-700/30" />

      {/* Terminal Info */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400 opacity-75">Terminal</span>
        <span className="text-sm font-bold text-orange-900 dark:text-orange-100">Main Counter</span>
      </div>

      {/* Divider */}
      <div className="h-7 w-px bg-orange-300/50 dark:bg-orange-700/30" />

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-2 w-2 rounded-full bg-orange-400 animate-pulse dark:bg-orange-300" />
          <div className="h-2 w-2 rounded-full bg-orange-500 dark:bg-orange-400" />
        </div>
        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Online</span>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-orange-300/50 dark:bg-orange-700/30" />

      {/* User Menu Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-orange-50/60 dark:hover:bg-orange-900/20 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
          title="User menu"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
          </div>
          <FontAwesomeIcon icon={faChevronDown} className={`h-3.5 w-3.5 text-orange-600 dark:text-orange-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-orange-300/50 bg-stone-100 dark:bg-stone-800 shadow-lg dark:border-orange-700/30 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-orange-300/40 dark:border-orange-700/30">
              <p className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Account</p>
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 mt-1">{userRole}</p>
            </div>
            
            {/* Account Settings Section */}
            <div className="py-2">
              <button
                onClick={() => {
                  alert('Change Password feature coming soon!');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-50/60 dark:hover:bg-orange-900/20 transition-all duration-200"
              >
                <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-orange-300/30 dark:bg-orange-700/20" />

            {/* Logout Section */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-all duration-200"
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
