import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go back to previous page
    navigate(-1);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/20 dark:bg-gradient-to-br dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 font-sans overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-orange-300/20 dark:bg-orange-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 text-white rounded-full p-5 shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
            <FontAwesomeIcon icon={faShieldAlt} className="text-4xl" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 mb-3">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-base text-stone-700 dark:text-stone-300 mb-6">
          You don't have permission to access this page.
        </p>

        {/* Action */}
        <button
          onClick={handleGoBack}
          className="w-full group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-orange-500/30 dark:from-orange-700 dark:to-amber-700 dark:hover:from-orange-800 dark:hover:to-amber-800"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
