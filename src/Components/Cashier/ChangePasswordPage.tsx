import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChangePassword from './ChangePassword';
import TintedBackdrop from '../TintedBackdrop';

const ChangePasswordPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-stone-100 dark:bg-stone-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isExpanded={sidebarExpanded}
      />

      {/* Tinted Backdrop for Mobile */}
      {sidebarOpen && (
        <TintedBackdrop />
      )}

      {/* Change Password Component */}
      <ChangePassword
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarExpanded={sidebarExpanded}
        onToggleSidebarExpand={() => setSidebarExpanded(!sidebarExpanded)}
      />
    </div>
  );
};

export default ChangePasswordPage;
