import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faChevronLeft, 
  faChevronRight, 
  faUser, 
  faPhone, 
  faEnvelope, 
  faMapMarker, 
  faBuilding,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';

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

  const [formData, setFormData] = useState<SupplierFormData>({
    supplierName: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    address: '',
  });

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
        }
        break;
      case 'contactPerson':
        if (!formData.contactPerson.trim()) {
          newErrors.contactPerson = 'Contact person name is required';
        }
        break;
      case 'phoneNumber':
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        }
        break;
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!formData.email.includes('@')) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 'address':
        if (!formData.address.trim()) {
          newErrors.address = 'Address is required';
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
      // TODO: Replace with actual API call
      // const response = await fetch('/api/suppliers', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess('Supplier added successfully!');
      setFormData({
        supplierName: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        address: '',
      });

      setTimeout(() => {
        navigate('/staff');
      }, 2000);
    } catch (err) {
      setError('Failed to add supplier. Please try again.');
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

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
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
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Add New Supplier</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                    <FontAwesomeIcon icon={faBuilding} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Add Supplier</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Create a new supplier profile with all essential contact information</p>
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
                <div className="mb-6 p-4 bg-green-50/80 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Success!</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Supplier has been added successfully. Redirecting...</p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 bg-white/70 dark:bg-neutral-900/70 p-6 sm:p-8 rounded-3xl border border-orange-100/50 dark:border-neutral-800/50 shadow-2xl shadow-orange-500/5 backdrop-blur-xl">
                
                {/* Supplier Name - Floating Label */}
                <div className="relative group">
                  <input
                    type="text"
                    name="supplierName"
                    id="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('supplierName')}
                    aria-label="Supplier Name"
                    aria-invalid={!!fieldErrors.supplierName}
                    aria-describedby={fieldErrors.supplierName ? 'supplierName-error' : undefined}
                    className={`w-full px-5 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer ${
                      fieldErrors.supplierName
                        ? 'border-red-400 dark:border-red-500/50 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-400/10'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10'
                    } hover:border-orange-300 dark:hover:border-orange-600`}
                    placeholder="Supplier Name"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="supplierName"
                    className={`absolute left-5 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                      ${formData.supplierName ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                    Supplier Name <span className="text-red-500">*</span>
                  </label>
                  {fieldErrors.supplierName && (
                    <p id="supplierName-error" className="text-xs text-red-600 dark:text-red-400 mt-2 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="inline-block w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span> {fieldErrors.supplierName}
                    </p>
                  )}
                </div>

                {/* Contact Person - Floating Label */}
                <div className="relative group">
                  <input
                    type="text"
                    name="contactPerson"
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('contactPerson')}
                    aria-label="Contact Person Name"
                    aria-invalid={!!fieldErrors.contactPerson}
                    aria-describedby={fieldErrors.contactPerson ? 'contactPerson-error' : undefined}
                    className={`w-full px-5 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer ${
                      fieldErrors.contactPerson
                        ? 'border-red-400 dark:border-red-500/50 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-400/10'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10'
                    } hover:border-orange-300 dark:hover:border-orange-600`}
                    placeholder="Contact Person"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="contactPerson"
                    className={`absolute left-5 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                      ${formData.contactPerson ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  {fieldErrors.contactPerson && (
                    <p id="contactPerson-error" className="text-xs text-red-600 dark:text-red-400 mt-2 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="inline-block w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span> {fieldErrors.contactPerson}
                    </p>
                  )}
                </div>

                {/* Phone & Email Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone Number - Floating Label */}
                  <div className="relative group">
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('phoneNumber')}
                      aria-label="Phone Number"
                      aria-invalid={!!fieldErrors.phoneNumber}
                      aria-describedby={fieldErrors.phoneNumber ? 'phoneNumber-error' : undefined}
                      className={`w-full px-5 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer ${
                        fieldErrors.phoneNumber
                          ? 'border-red-400 dark:border-red-500/50 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-400/10'
                          : 'border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10'
                      } hover:border-orange-300 dark:hover:border-orange-600`}
                      placeholder="Phone Number"
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="phoneNumber"
                      className={`absolute left-5 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                        peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                        ${formData.phoneNumber ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                    >
                      <FontAwesomeIcon icon={faPhone} className="mr-2" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    {fieldErrors.phoneNumber && (
                      <p id="phoneNumber-error" className="text-xs text-red-600 dark:text-red-400 mt-2 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="inline-block w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span> {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Email - Floating Label */}
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur('email')}
                      aria-label="Email Address"
                      aria-invalid={!!fieldErrors.email}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={`w-full px-5 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer ${
                        fieldErrors.email
                          ? 'border-red-400 dark:border-red-500/50 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-400/10'
                          : 'border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10'
                      } hover:border-orange-300 dark:hover:border-orange-600`}
                      placeholder="Email"
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="email"
                      className={`absolute left-5 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                        peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                        peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                        ${formData.email ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                    >
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    {fieldErrors.email && (
                      <p id="email-error" className="text-xs text-red-600 dark:text-red-400 mt-2 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="inline-block w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span> {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address - Floating Label */}
                <div className="relative group">
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('address')}
                    aria-label="Address"
                    aria-invalid={!!fieldErrors.address}
                    aria-describedby={fieldErrors.address ? 'address-error' : undefined}
                    className={`w-full px-5 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer ${
                      fieldErrors.address
                        ? 'border-red-400 dark:border-red-500/50 focus:ring-4 focus:ring-red-500/10 dark:focus:ring-red-400/10'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10'
                    } hover:border-orange-300 dark:hover:border-orange-600`}
                    placeholder="Address"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="address"
                    className={`absolute left-5 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                      ${formData.address ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    <FontAwesomeIcon icon={faMapMarker} className="mr-2" />
                    Address <span className="text-red-500">*</span>
                  </label>
                  {fieldErrors.address && (
                    <p id="address-error" className="text-xs text-red-600 dark:text-red-400 mt-2 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="inline-block w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full"></span> {fieldErrors.address}
                    </p>
                  )}
                </div>

                {/* Form Status Indicator */}
                {hasErrors && (
                  <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-sm text-amber-700 dark:text-amber-400 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      <span className="font-semibold">Please fix the errors above before submitting</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || hasErrors}
                    className="flex-1 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-neutral-400 disabled:to-neutral-400 text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 disabled:shadow-none active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Adding Supplier...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Add Supplier</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/staff')}
                    disabled={isLoading}
                    className="flex-1 px-8 py-3.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 text-neutral-900 dark:text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group border-2 border-neutral-200 dark:border-neutral-700"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Helper Text */}
                <div className="text-left pt-2">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="text-red-500 font-semibold">*</span> Required fields
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupplier;
