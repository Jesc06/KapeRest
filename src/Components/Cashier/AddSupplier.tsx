import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faUser, faPhone, faEnvelope, faMapPin, faBuilding } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';

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
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Add Supplier</h1>
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
              <div className="relative rounded-2xl border border-stone-200 dark:border-neutral-700 bg-stone-50/50 dark:bg-neutral-800/50 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
                {/* Label Tag - Visual Hierarchy */}
                <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full border border-orange-600/30 bg-orange-50 dark:bg-orange-950/40 px-3 text-[10px] font-semibold tracking-wider text-orange-600 dark:text-orange-400">NEW SUPPLIER</div>

                {/* Title with Visual Hierarchy */}
                <div className="mb-5">
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-stone-100">Register Supplier</h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-normal">Add a new supplier to your inventory management system</p>
                </div>

                {/* Divider - Subtle */}
                <div className="h-px w-full bg-stone-200 dark:bg-neutral-700 mb-5" aria-hidden />

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">⚠ {error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">✓ {success}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Supplier Name Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                        Supplier Name
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faBuilding} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="text"
                          name="supplierName"
                          value={formData.supplierName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="e.g., ABC Coffee Supplies Inc."
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Contact Person Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                        Contact Person
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.contactPerson}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="Full name of contact person"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faPhone} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="+63 9XX XXX XXXX"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faEnvelope} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="supplier@company.com"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Field - Full Width */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faMapPin} className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 resize-none"
                        rows={2}
                        placeholder="Street address, city, province, postal code"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800/40">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ All fields are required to register a new supplier
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Adding...' : 'Add Supplier'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/staff')}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-stone-200 dark:bg-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-600 disabled:bg-stone-100 dark:disabled:bg-neutral-800 text-neutral-900 dark:text-stone-100 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
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
