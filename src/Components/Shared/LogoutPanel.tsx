import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser, faSignOutAlt, faLock, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api';

interface LogoutPanelProps {
  // No props needed - role determined by current route
}

const LogoutPanel: React.FC<LogoutPanelProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply dark mode to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  // Determine user role based on current route
  const getUserRole = () => {
    if (location.pathname.startsWith('/staff')) return 'Staff';
    if (location.pathname.startsWith('/admin')) return 'Admin';
    return 'Cashier';
  };

  const userRole = getUserRole();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Call logout API
        const response = await fetch(`${API_BASE_URL}/Auth/Logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Log the response but don't block logout on API failure
        if (response.ok) {
          console.log('Logout API called successfully');
        } else {
          console.warn('Logout API call failed, but proceeding with local logout');
        }
      }

      // Clear token and navigate regardless of API response
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear token and navigate even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  return (
    <div className="hidden sm:flex items-center justify-center flex-shrink-0 px-2">
      {/* User Menu Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/40 hover:bg-stone-50 dark:hover:bg-stone-700 min-w-[140px] sm:min-w-[160px]"
          title="User menu"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0">
            <FontAwesomeIcon icon={faUser} className="h-4.5 w-4.5" />
          </div>
          <div className="hidden md:flex flex-col items-start flex-1 min-w-0">
            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate w-full">{userRole}</p>
            <p className="text-xs font-medium text-neutral-600 dark:text-stone-400">Account</p>
          </div>
          <FontAwesomeIcon icon={faChevronDown} className={`h-4 w-4 text-neutral-600 dark:text-stone-400 transition-transform duration-300 flex-shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 shadow-xl overflow-hidden z-[9999] animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-600 dark:text-stone-400">Account</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1">{userRole}</p>
            </div>

            {/* Account Settings Section */}
            <div className="py-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => {
                  toggleDarkMode();
                }}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all duration-200 rounded-none group"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <FontAwesomeIcon 
                      icon={faSun} 
                      className={`absolute h-4 w-4 text-orange-500 transition-all duration-300 ${
                        isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                      }`}
                    />
                    <FontAwesomeIcon 
                      icon={faMoon} 
                      className={`absolute h-4 w-4 text-indigo-500 transition-all duration-300 ${
                        isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                      }`}
                    />
                  </div>
                  <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                
                {/* Modern Toggle Switch */}
                <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  isDarkMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-orange-400 to-amber-500'
                }`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-stone-50 shadow-lg transform transition-all duration-300 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}>
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon 
                        icon={isDarkMode ? faMoon : faSun} 
                        className={`h-2.5 w-2.5 ${isDarkMode ? 'text-indigo-600' : 'text-orange-600'}`}
                      />
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  // Navigate to the correct change password page based on current location
                  const isStaffPage = location.pathname.startsWith('/staff');
                  navigate(isStaffPage ? '/staff/change-password' : '/cashier/change-password');
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-all duration-200 rounded-none"
              >
                <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-stone-200 dark:bg-stone-700" />

            {/* Logout Section */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 rounded-none"
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
