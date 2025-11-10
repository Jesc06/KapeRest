import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faUser, faPhone, faEnvelope, faMapPin, faBuilding } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';
import TintedBackdrop from '../TintedBackdrop';

interface SupplierFormData {
  supplierName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
}

const AddSupplier: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.supplierName.trim()) {
      setError('Supplier name is required');
      return;
    }

    if (!formData.contactPerson.trim()) {
      setError('Contact person name is required');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
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
      await new Promise(resolve => setTimeout(resolve, 1000));

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-900 via-orange-900/20 to-stone-900">
      <TintedBackdrop />

      <div aria-hidden className="absolute inset-0 z-0 bg-stone-50/90 backdrop-blur-xl dark:bg-neutral-900/60 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-stone-100 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-orange-300/30 bg-stone-100/90 dark:border-orange-700/20 dark:bg-stone-800/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md border border-orange-400/40 bg-orange-50/60 hover:bg-orange-100/60 text-orange-700 dark:border-orange-600/30 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-400 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-md border border-orange-400/40 bg-orange-50/60 hover:bg-orange-100/60 dark:border-orange-600/30 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-3.5 w-3.5" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900 dark:text-orange-100 truncate">Add Supplier</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-3">
            {/* Form Container - Minimal & Centered */}
            <div className="w-full max-w-6xl px-3 sm:px-4 md:px-6">
              {/* Card */}
              <div className="relative rounded-2xl border border-orange-200/40 dark:border-orange-700/30 bg-stone-50/95 dark:bg-stone-800/50 p-6 sm:p-7 shadow-md transition-all duration-300 ease-out">
                {/* Label Tag - Visual Hierarchy */}
                <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full border border-orange-300/50 bg-orange-50 dark:bg-orange-950/60 px-3 text-[10px] font-semibold tracking-wider text-orange-700 dark:text-orange-300">NEW SUPPLIER</div>

                {/* Title with Visual Hierarchy */}
                <div className="mb-5">
                  <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 dark:text-orange-50">Register Supplier</h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-orange-700/70 dark:text-orange-300/70 font-normal">Add a new supplier to your inventory management system</p>
                </div>

                {/* Divider - Subtle */}
                <div className="h-px w-full bg-orange-200/20 dark:bg-orange-700/15 mb-5" aria-hidden />

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3.5 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">⚠ {error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3.5 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">✓ {success}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supplier Name Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                        Supplier Name
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faBuilding} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="text"
                          name="supplierName"
                          value={formData.supplierName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="e.g., ABC Coffee Supplies Inc."
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Contact Person Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                        Contact Person
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="Full name of contact person"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="+63 9XX XXX XXXX"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="supplier@company.com"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Field - Full Width */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faMapPin} className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200 resize-none"
                        rows={2}
                        placeholder="Street address, city, province, postal code"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50/60 dark:bg-blue-900/10 rounded-lg p-2.5 border border-blue-200/30 dark:border-blue-800/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ All fields are required to register a new supplier
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Adding...' : 'Add Supplier'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/staff')}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-stone-200/70 dark:bg-stone-700/40 hover:bg-stone-300/70 dark:hover:bg-stone-700/60 disabled:bg-stone-100 dark:disabled:bg-stone-800/20 text-orange-900 dark:text-orange-100 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
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

export default AddSupplier;
