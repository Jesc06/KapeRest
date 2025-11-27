import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBuilding, faSave } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api';

interface BranchResponse {
  id: number;
  branchName: string;
  location: string;
  staff: string;
  status: string;
}

interface AddBranchProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (branchData: BranchResponse) => void;
}

const AddBranch: React.FC<AddBranchProps> = ({ isOpen, onClose, onSubmit }) => {
  const [branchName, setBranchName] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ branchName?: string; location?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [apiSuccess, setApiSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      setApiError('');
      setApiSuccess(false);

      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const branchData = {
          name: branchName.trim(),
          location: location.trim(),
        };

        console.log('Sending branch data:', branchData);

        const response = await fetch(`${API_BASE_URL}/Branch/AddBranch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(branchData)
        });

        const responseText = await response.text();
        console.log('API Response:', responseText);
        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error('Add branch error response:', responseText);
          
          let errorMessage = responseText;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorJson.title || responseText;
          } catch (e) {
            errorMessage = responseText;
          }
          
          throw new Error(errorMessage || 'Failed to add branch');
        }

        let result: BranchResponse;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.warn('Response is not JSON:', responseText);
          // If backend returns plain text, create default response
          result = {
            id: 0,
            branchName: branchName.trim(),
            location: location.trim(),
            staff: 'N/A',
            status: 'N/A'
          };
        }
        
        console.log('Branch added successfully:', result);
        setApiSuccess(true);

        // Reset form first
        setBranchName('');
        setLocation('');
        setErrors({});

        // Call parent onSubmit callback with full branch data
        try {
          onSubmit(result);
        } catch (err) {
          console.error('Error in onSubmit callback:', err);
        }

        // Close modal after brief delay
        setTimeout(() => {
          setApiSuccess(false);
          onClose();
        }, 1000);

      } catch (err) {
        console.error('Error adding branch:', err);
        setApiError(err instanceof Error ? err.message : 'Failed to add branch. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setBranchName('');
    setLocation('');
    setErrors({});
    setApiError('');
    setApiSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-white">Add New Branch</h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">Create a new branch location</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-stone-600 dark:text-stone-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Branch Name */}
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
              Branch Name
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Enter branch name (e.g., Main Branch, SM Mall of Asia)"
              className={`w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 ${
                errors.branchName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-stone-200 dark:border-stone-700 focus:ring-orange-500'
              } rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {errors.branchName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.branchName}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (e.g., Manila, Makati, Quezon City)"
              className={`w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 ${
                errors.location
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-stone-200 dark:border-stone-700 focus:ring-orange-500'
              } rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {errors.location && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.location}
              </p>
            )}
          </div>

          {/* API Error Message */}
          {apiError && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{apiError}</p>
            </div>
          )}
          
          {/* API Success Message */}
          {apiSuccess && (
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
              <p className="text-sm text-green-600 dark:text-green-400 text-center">Branch added successfully!</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBranch;
