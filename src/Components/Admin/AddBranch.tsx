import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBuilding, faMapMarkerAlt, faSave } from '@fortawesome/free-solid-svg-icons';

interface AddBranchProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (branchData: { branchName: string; location: string }) => void;
}

const AddBranch: React.FC<AddBranchProps> = ({ isOpen, onClose, onSubmit }) => {
  const [branchName, setBranchName] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ branchName?: string; location?: string }>({});

  const validateForm = () => {
    const newErrors: { branchName?: string; location?: string } = {};

    if (!branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        branchName: branchName.trim(),
        location: location.trim(),
      });

      // Reset form
      setBranchName('');
      setLocation('');
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setBranchName('');
    setLocation('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border-2 border-stone-200 dark:border-neutral-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Add New Branch</h2>
              <p className="text-sm text-orange-100 font-medium">Create a new branch location</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-200 flex items-center justify-center group"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Branch Name */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Branch Name
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Enter branch name (e.g., Main Branch, SM Mall of Asia)"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                  errors.branchName
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-stone-200 dark:border-neutral-700 focus:ring-orange-500 focus:border-orange-500'
                } bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 shadow-sm hover:shadow-md transition-all duration-200`}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <FontAwesomeIcon icon={faBuilding} className={`h-4 w-4 ${errors.branchName ? 'text-red-500' : 'text-orange-500'}`} />
              </div>
            </div>
            {errors.branchName && (
              <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {errors.branchName}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <label className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Location
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location (e.g., Manila, Makati, Quezon City)"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 ${
                  errors.location
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-stone-200 dark:border-neutral-700 focus:ring-orange-500 focus:border-orange-500'
                } bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 shadow-sm hover:shadow-md transition-all duration-200`}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <FontAwesomeIcon icon={faMapMarkerAlt} className={`h-4 w-4 ${errors.location ? 'text-red-500' : 'text-orange-500'}`} />
              </div>
            </div>
            {errors.location && (
              <p className="mt-2 text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {errors.location}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-black text-sm uppercase tracking-wide hover:bg-stone-50 dark:hover:bg-neutral-700 transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm uppercase tracking-wide hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
              Save Branch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBranch;
