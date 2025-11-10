import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from './LogoutPanel';

interface ChangePasswordProps {
  onToggleSidebar?: () => void;
  sidebarExpanded?: boolean;
  onToggleSidebarExpand?: () => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  onToggleSidebar,
  sidebarExpanded = true,
  onToggleSidebarExpand,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateForm = (): boolean => {
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return false;
    }
    if (!email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email' });
      return false;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return false;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return false;
    }
    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      
      // Reset form
      setTimeout(() => {
        setEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-full flex-col bg-stone-100 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
      {/* Top Bar */}
      <div className="sticky top-0 z-10 border-b border-orange-300/50 bg-stone-100/95 dark:border-orange-700/30 dark:bg-stone-800/90 px-4 sm:px-5 md:px-6 py-3 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
        {/* Top Section: Sidebar Toggle | Title | Logout Panel */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Left Section: Sidebar Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Hamburger Menu - Mobile Only */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-orange-400/60 bg-orange-50 hover:bg-orange-100 text-orange-700 transition-all duration-200 shadow-sm dark:border-orange-600/40 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 dark:text-orange-300"
            >
              <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
            </button>

            {/* Sidebar Toggle Button - Desktop Only */}
            <button
              onClick={onToggleSidebarExpand}
              className="hidden lg:flex flex-shrink-0 h-9 w-9 items-center justify-center rounded-lg border border-orange-400/50 bg-gradient-to-br from-orange-50 to-orange-100/80 hover:from-orange-100 hover:to-orange-200 text-orange-600 transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md dark:border-orange-600/40 dark:from-orange-900/30 dark:to-orange-900/20 dark:hover:from-orange-900/50 dark:hover:to-orange-900/40 dark:text-orange-400 dark:hover:text-orange-300"
              title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
            </button>
          </div>

          {/* Center Section: Title */}
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-orange-900 dark:text-orange-100">Change Password</h1>
          </div>

          {/* Right Section: Logout Panel */}
          <LogoutPanel userRole="Cashier" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-4 sm:gap-5 p-4 sm:p-5 md:p-6">
        {/* Change Password Form Container */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-xl border border-orange-300/50 dark:border-orange-700/30 bg-stone-100/80 dark:bg-stone-800/60 shadow-lg dark:shadow-xl overflow-hidden">
            {/* Form Header */}
            <div className="border-b border-orange-300/40 dark:border-orange-700/30 bg-stone-100/60 dark:bg-stone-800/50 px-6 py-4">
              <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">Security Update</h2>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Update your account password securely</p>
            </div>

            {/* Form Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-lg border ${
                  message.type === 'success'
                    ? 'bg-green-50 border-green-300/50 dark:bg-green-900/20 dark:border-green-700/30'
                    : 'bg-red-50 border-red-300/50 dark:bg-red-900/20 dark:border-red-700/30'
                }`}>
                  <p className={`text-sm font-semibold ${
                    message.type === 'success'
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {message.text}
                  </p>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 text-sm font-semibold bg-stone-100 dark:bg-stone-800 border border-orange-300/50 dark:border-orange-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-all"
                />
              </div>

              {/* Current Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-stone-100 dark:bg-stone-800 border border-orange-300/50 dark:border-orange-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-stone-100 dark:bg-stone-800 border border-orange-300/50 dark:border-orange-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">Minimum 6 characters required</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-stone-100 dark:bg-stone-800 border border-orange-300/50 dark:border-orange-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="border-t border-orange-300/40 dark:border-orange-700/30 bg-stone-100/60 dark:bg-stone-800/50 px-6 py-4 space-y-3">
              {/* Update Password Button */}
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 rounded-md bg-orange-600 hover:bg-orange-700 px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600 dark:focus:ring-orange-500 dark:focus:ring-offset-stone-900 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"></path>
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

              {/* Cancel Button */}
              <button
                onClick={() => navigate('/cashier')}
                className="w-full flex items-center justify-center gap-2.5 rounded-md border border-orange-300/50 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 text-sm font-bold text-orange-700 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 dark:border-orange-700/30 dark:bg-stone-800/60 dark:hover:bg-stone-800/80 dark:text-orange-300 dark:focus:ring-orange-500 dark:focus:ring-offset-stone-900 shadow-sm hover:shadow-md"
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
