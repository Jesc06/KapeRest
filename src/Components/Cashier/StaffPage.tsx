import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';
import TintedBackdrop from '../TintedBackdrop';

const StaffPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Redirect to Add Supplier on mount
  React.useEffect(() => {
    navigate('/staff/add-supplier', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-900 via-orange-900/20 to-stone-900">
      <TintedBackdrop />

      <div aria-hidden className="absolute inset-0 z-0 bg-stone-50/90 backdrop-blur-xl dark:bg-neutral-900/60 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-stone-100 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-orange-300/30 bg-stone-100/90 dark:border-orange-700/20 dark:bg-stone-800/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md border border-orange-400/40 bg-orange-50/60 hover:bg-orange-100/60 text-orange-700 dark:border-orange-600/30 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-400 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-md border border-orange-400/40 bg-orange-50/60 hover:bg-orange-100/60 dark:border-orange-600/30 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-3.5 w-3.5" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900 dark:text-orange-100 truncate">Staff Management</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Loading State */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-orange-600 dark:text-orange-400">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
