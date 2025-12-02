import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faArrowLeft, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Clear tokens and go to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 dark:bg-gradient-to-br dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 font-sans overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-400/20 dark:bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl rounded-2xl border-2 border-red-400/60 dark:border-red-700/50 shadow-2xl p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-full p-6 shadow-xl">
                <FontAwesomeIcon icon={faShieldAlt} className="text-5xl" />
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-2 shadow-lg">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-red-500 dark:from-red-400 dark:via-orange-400 dark:to-red-300 mb-4">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-lg text-stone-700 dark:text-stone-300 mb-2 font-semibold">
            You are not authorized to access this page
          </p>
          <p className="text-base text-stone-600 dark:text-stone-400 mb-8">
            You don't have the necessary permissions to view this content. Please contact your administrator if you believe this is an error.
          </p>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent mb-8"></div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGoBack}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/30 dark:from-red-700 dark:to-orange-700 dark:hover:from-red-800 dark:hover:to-orange-800"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Login</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 dark:text-red-400" />
              <span>If you continue to experience issues, please contact support</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
