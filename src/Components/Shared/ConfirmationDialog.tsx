import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg m-4">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/20 via-orange-500/20 to-amber-500/20 blur-2xl"></div>
        
        <div className="relative rounded-3xl border-2 border-red-200/50 dark:border-red-800/50 bg-white/95 dark:bg-neutral-900/95 shadow-2xl backdrop-blur-xl transform transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95 overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-200 z-10"
          >
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-950/40 dark:via-orange-950/30 dark:to-amber-950/20 px-8 pt-8 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="flex-1 pt-1">
                <h3 id="confirmation-dialog-title" className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 font-medium">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border-y border-amber-200/50 dark:border-amber-800/30 px-8 py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                ⚠️ This action cannot be undone
              </p>
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="bg-gradient-to-br from-neutral-50/80 to-stone-100/50 dark:from-neutral-800/80 dark:to-neutral-900/50 px-8 py-6">
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-6 py-3 text-sm font-bold text-neutral-700 dark:text-neutral-300 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-gradient-to-br from-red-600 to-orange-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
                Proceed with Rejection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
