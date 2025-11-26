import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBuilding, faSave } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api';

interface BranchData {
  id: number;
  branchName: string;
  location: string;
  staff: string;
  status: string;
}

interface EditBranchProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (branchData: BranchData) => void;
  branch: BranchData | null;
}

const EditBranch: React.FC<EditBranchProps> = ({ isOpen, onClose, onUpdate, branch }) => {
  const [branchName, setBranchName] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<{ branchName?: string; location?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [apiSuccess, setApiSuccess] = useState(false);

  useEffect(() => {
    if (branch) {
      setBranchName(branch.branchName);
      setLocation(branch.location);
    }
  }, [branch]);

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

    if (!branch) return;

    if (validateForm()) {
      setIsSubmitting(true);
      setApiError('');
      setApiSuccess(false);

      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }

        const updateData = {
          id: branch.id,
          name: branchName.trim(),
          location: location.trim(),
          staff: branch.staff,
          status: branch.status
        };

        console.log('Sending update data:', updateData);

        const response = await fetch(`${API_BASE_URL}/Branch/UpdateBranch`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        const responseText = await response.text();
        console.log('API Response:', responseText);
        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error('Update branch error response:', responseText);
          
          let errorMessage = responseText;
          try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.message || errorJson.error || errorJson.title || responseText;
          } catch (e) {
            errorMessage = responseText;
          }
          
          throw new Error(errorMessage || 'Failed to update branch');
        }

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.warn('Response is not JSON:', responseText);
          result = { success: true, message: responseText };
        }
        
        console.log('Branch updated successfully:', result);
        setApiSuccess(true);

        // Call parent onUpdate callback
        const updatedBranch: BranchData = {
          id: branch.id,
          branchName: branchName.trim(),
          location: location.trim(),
          staff: branch.staff,
          status: branch.status
        };
        onUpdate(updatedBranch);

        // Reset form and close after success
        setTimeout(() => {
          setBranchName('');
          setLocation('');
          setErrors({});
          setApiSuccess(false);
          onClose();
        }, 1500);

      } catch (err) {
        console.error('Error updating branch:', err);
        setApiError(err instanceof Error ? err.message : 'Failed to update branch. Please try again.');
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

  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Edit Branch</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Update branch information</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Branch Name */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              Branch Name
            </label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="Enter branch name"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 ${
                errors.branchName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-orange-500'
              } rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            />
            {errors.branchName && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.branchName}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border-2 ${
                errors.location
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-neutral-200 dark:border-neutral-700 focus:ring-orange-500'
              } rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
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
              <p className="text-sm text-green-600 dark:text-green-400 text-center">Branch updated successfully!</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
                <span>Updating...</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                <span>Update Branch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBranch;
