import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface MessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

const MessageBox: React.FC<MessageBoxProps> = ({ isOpen, onClose, title, message, type }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  // Warm café theme colors matching the homepage
  const bgColor = isSuccess 
    ? 'bg-amber-50/95 dark:bg-orange-950/80' 
    : 'bg-red-50/95 dark:bg-red-950/80';
  const borderColor = isSuccess 
    ? 'border-orange-500/80 dark:border-orange-600/80' 
    : 'border-red-500/80 dark:border-red-600/80';
  const iconColor = isSuccess 
    ? 'text-orange-600 dark:text-orange-400' 
    : 'text-red-600 dark:text-red-400';
  const buttonColor = isSuccess 
    ? 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600' 
    : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-box-title"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Warm café theme background effect */}
      <div className="relative w-full max-w-md m-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-100/30 dark:from-stone-900 dark:via-stone-950/80 dark:to-amber-950/60 blur-sm"></div>
        <div className={`relative rounded-2xl border-2 ${borderColor} ${bgColor} shadow-2xl backdrop-blur-md transform transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95`}>
          <div className="p-8 text-center">
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${isSuccess ? 'bg-orange-100/80 dark:bg-orange-900/40' : 'bg-red-100/80 dark:bg-red-900/40'} mb-6 border ${isSuccess ? 'border-orange-200 dark:border-orange-800' : 'border-red-200 dark:border-red-800'}`}>
              <FontAwesomeIcon icon={isSuccess ? faCheckCircle : faTimesCircle} className={`h-12 w-12 ${iconColor}`} />
            </div>
            <h3 id="message-box-title" className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
              {title} <span className="text-xl">☕</span>
            </h3>
            <div className="mt-3">
              <p className="text-base leading-relaxed text-stone-700 dark:text-stone-300">
                {message}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50/40 via-orange-50/30 to-amber-50/40 dark:from-stone-900/60 dark:via-stone-950/40 dark:to-stone-900/60 px-6 py-4 rounded-b-2xl border-t border-orange-200/50 dark:border-orange-800/30">
            <button
              type="button"
              onClick={onClose}
              className={`w-full inline-flex justify-center rounded-xl border border-transparent px-6 py-3 text-base font-medium text-white shadow-lg ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-all duration-200 transform hover:scale-105`}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
