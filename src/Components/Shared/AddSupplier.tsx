import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faBuilding,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
import LogoutPanel from './LogoutPanel';
import { API_BASE_URL } from '../../config/api';
import MessageBox from './MessageBox';
import { jwtDecode } from 'jwt-decode';

interface SupplierFormData {
  supplierName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
}

interface FieldErrors {
  supplierName?: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

const AddSupplier: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageText, setMessageText] = useState('');

  const [formData, setFormData] = useState<SupplierFormData>({
    supplierName: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    address: '',
  });

  // Get userId from JWT token (cashierId)
  const getUserId = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return null;
      }
      
      const payload: any = jwtDecode(token);
      console.log('Full JWT payload:', payload);
      
      // Extract userId from cashierId claim
      const userId = payload?.cashierId || 
                     payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                     payload?.uid || 
                     payload?.sub;
      
      console.log('Extracted userId:', userId);
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    validateField(fieldName);
  };

  const validateField = (fieldName: string) => {
    const newErrors: FieldErrors = { ...fieldErrors };

    switch (fieldName) {
      case 'supplierName':
        if (!formData.supplierName.trim()) {
          newErrors.supplierName = 'Supplier name is required';
        } else {
          delete newErrors.supplierName;
        }
        break;
      case 'contactPerson':
        if (!formData.contactPerson.trim()) {
          newErrors.contactPerson = 'Contact person name is required';
        } else {
          delete newErrors.contactPerson;
        }
        break;
      case 'phoneNumber':
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        } else {
          delete newErrors.phoneNumber;
        }
        break;
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!formData.email.includes('@')) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'address':
        if (!formData.address.trim()) {
          newErrors.address = 'Address is required';
        } else {
          delete newErrors.address;
        }
        break;
      default:
        break;
    }

    setFieldErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const userId = getUserId();

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const requestBody = {
        supplierName: formData.supplierName,
        contactPerson: formData.contactPerson,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        userId: userId
      };

      console.log('Sending supplier data:', requestBody);
      console.log('UserId being sent:', userId);

      const response = await fetch(`${API_BASE_URL}/Supplier/AddSuppliers`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to add supplier');
      }

      // Check if response is text or JSON
      await response.text();
      
      // Show success message
      setMessageType('success');
      setMessageText('Supplier added successfully!');
      setShowMessageBox(true);
      
      // Reset form
      setFormData({
        supplierName: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        address: '',
      });

      setTimeout(() => {
        navigate('/staff/suppliers');
      }, 2000);
    } catch (err) {
      setMessageType('error');
      setMessageText(err instanceof Error ? err.message : 'Failed to add supplier. Please try again.');
      setShowMessageBox(true);
    } finally {
      setIsLoading(false);
    }
  };

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-stone-700/50 bg-stone-50/80 dark:bg-stone-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Add New Supplier</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-6 sm:px-8 md:px-12 py-10 sm:py-12">
            <div className="w-full max-w-5xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                    <FontAwesomeIcon icon={faBuilding} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Add Supplier</h2>
                    <p className="text-sm text-neutral-600 dark:text-stone-400 mt-1">Create a new supplier profile with all essential contact information</p>
                  </div>
                </div>
              </div>

              {/* Alert Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Success!</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Supplier has been added successfully. Redirecting...</p>
                  </div>
                </div>
              )}

              {/* Form - Flat Design */}
              <form onSubmit={handleSubmit} className="space-y-5 bg-stone-50 dark:bg-stone-900 p-6 rounded-lg border border-neutral-200 dark:border-stone-700 shadow-sm">
                
                {/* Supplier Name */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('supplierName')}
                    className={`w-full px-4 py-3.5 text-base rounded-lg border bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:opacity-50 ${
                      fieldErrors.supplierName
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 dark:border-stone-700 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                    placeholder="e.g., ABC Supplies Inc."
                    disabled={isLoading}
                  />
                  {fieldErrors.supplierName && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.supplierName}
                    </p>
                  )}
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('contactPerson')}
                    className={`w-full px-4 py-3.5 text-base rounded-lg border bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:opacity-50 ${
                      fieldErrors.contactPerson
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 dark:border-stone-700 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                    placeholder="e.g., Juan Dela Cruz"
                    disabled={isLoading}
                  />
                  {fieldErrors.contactPerson && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.contactPerson}
                    </p>
                  )}
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('phoneNumber')}
                      className={`w-full px-4 py-3.5 text-base rounded-lg border bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:opacity-50 ${
                        fieldErrors.phoneNumber
                          ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-neutral-300 dark:border-stone-700 focus:border-orange-500 focus:ring-orange-500'
                      }`}
                      placeholder="e.g., 09123456789"
                      disabled={isLoading}
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('email')}
                      className={`w-full px-4 py-3.5 text-base rounded-lg border bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:opacity-50 ${
                        fieldErrors.email
                          ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-neutral-300 dark:border-stone-700 focus:border-orange-500 focus:ring-orange-500'
                      }`}
                      placeholder="e.g., supplier@email.com"
                      disabled={isLoading}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('address')}
                    className={`w-full px-4 py-3.5 text-base rounded-lg border bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 disabled:opacity-50 ${
                      fieldErrors.address
                        ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-neutral-300 dark:border-stone-700 focus:border-orange-500 focus:ring-orange-500'
                    }`}
                    placeholder="Complete address"
                    disabled={isLoading}
                  />
                  {fieldErrors.address && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* Form Status Indicator */}
                {hasErrors && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                    Please fix the errors above before submitting
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || hasErrors}
                    className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400 text-white font-medium rounded-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                        <span>Add Supplier</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/staff')}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-neutral-200 dark:bg-stone-800 hover:bg-neutral-300 dark:hover:bg-stone-700 text-neutral-900 dark:text-white font-medium rounded-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Helper Text */}
                <p className="text-xs text-neutral-500 dark:text-stone-400 pt-1">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MessageBox */}
      {showMessageBox && (
        <MessageBox
          isOpen={showMessageBox}
          type={messageType}
          title={messageType === 'success' ? 'Success' : 'Error'}
          message={messageText}
          onClose={() => setShowMessageBox(false)}
        />
      )}
    </div>
  );
};

export default AddSupplier;
