import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faBars, faChevronLeft, faChevronRight, faEnvelope, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

const StaffChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    return {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  };

  const passwordStrength = checkPasswordStrength(newPassword);
  const isPasswordStrong = Object.values(passwordStrength).every(val => val);
  // compute a simple strength score (0-100)
  const strengthScore = Math.round((Object.values(passwordStrength).filter(Boolean).length / 4) * 100);
  const strengthColor = strengthScore < 50 ? 'bg-red-500' : strengthScore < 80 ? 'bg-amber-500' : 'bg-green-600';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and numbers');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, currentPassword, newPassword })
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Password changed successfully!');
      setEmail('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/staff/add-supplier');
      }, 2000);
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Change Password</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-3">
            {/* Form Container - Minimal & Centered */}
            <div className="w-full max-w-2xl px-3 sm:px-4 md:px-6">
              {/* Card */}
              <div className="relative rounded-2xl border border-stone-200 dark:border-neutral-700 bg-stone-50/50 dark:bg-neutral-800/50 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
                {/* Label Tag - Visual Hierarchy */}
                <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full border border-orange-600/30 bg-orange-50 dark:bg-orange-950/40 px-3 text-[10px] font-semibold tracking-wider text-orange-600 dark:text-orange-400">SECURITY</div>

                {/* Title with Visual Hierarchy */}
                <div className="mb-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-stone-100">Change Password</h2>
                  <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 font-normal">Update your password to keep your account secure</p>
                </div>

                {/* Divider - Subtle */}
                <div className="h-px w-full bg-stone-200 dark:bg-neutral-700 mb-6" aria-hidden />

                {/* Error / Success Messages (aria-live) */}
                <div aria-live="polite" className="mb-4">
                  {error && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">⚠ {error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg">
                      <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">✓ {success}</p>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-900 dark:text-stone-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Current Password Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-900 dark:text-stone-200 mb-2">
                      Current Password
                    </label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <FontAwesomeIcon icon={showCurrentPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-900 dark:text-stone-200 mb-2">
                      New Password
                    </label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Password strength UI: progress bar + checklist */}
                  {newPassword && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-stone-400">Password Strength</p>
                        <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{strengthScore}%</p>
                      </div>

                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden dark:bg-neutral-700">
                        <div
                          className={`h-2 rounded-full ${strengthColor}`}
                          style={{ width: `${strengthScore}%` }}
                          aria-hidden
                        />
                      </div>

                      <div className="bg-stone-50 dark:bg-neutral-800/50 rounded-lg p-3 border border-stone-200 dark:border-neutral-700">
                        <p className="text-xs font-semibold text-neutral-600 dark:text-stone-400 mb-2">Requirements</p>
                        <ul className="grid grid-cols-1 gap-2 text-xs">
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={passwordStrength.hasMinLength ? faCheckCircle : faTimesCircle} className={`${passwordStrength.hasMinLength ? 'text-green-600' : 'text-stone-300'} h-4 w-4`} />
                            <span className={passwordStrength.hasMinLength ? 'text-neutral-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-500'}>At least 8 characters</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={passwordStrength.hasUppercase ? faCheckCircle : faTimesCircle} className={`${passwordStrength.hasUppercase ? 'text-green-600' : 'text-stone-300'} h-4 w-4`} />
                            <span className={passwordStrength.hasUppercase ? 'text-neutral-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-500'}>Uppercase letter (A-Z)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={passwordStrength.hasLowercase ? faCheckCircle : faTimesCircle} className={`${passwordStrength.hasLowercase ? 'text-green-600' : 'text-stone-300'} h-4 w-4`} />
                            <span className={passwordStrength.hasLowercase ? 'text-neutral-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-500'}>Lowercase letter (a-z)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <FontAwesomeIcon icon={passwordStrength.hasNumber ? faCheckCircle : faTimesCircle} className={`${passwordStrength.hasNumber ? 'text-green-600' : 'text-stone-300'} h-4 w-4`} />
                            <span className={passwordStrength.hasNumber ? 'text-neutral-800 dark:text-stone-100' : 'text-stone-500 dark:text-stone-500'}>Number (0-9)</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-900 dark:text-stone-200 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <FontAwesomeIcon icon={faLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800/40">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ Use a strong password with mix of uppercase, lowercase, and numbers for better security
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !isPasswordStrong || newPassword !== confirmPassword}
                      className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/staff/add-supplier')}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-stone-200 dark:bg-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-600 disabled:bg-stone-100 dark:disabled:bg-neutral-800 text-neutral-900 dark:text-stone-100 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffChangePassword;
