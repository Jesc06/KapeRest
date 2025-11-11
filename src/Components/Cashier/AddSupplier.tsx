import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faUser, faPhone, faEnvelope, faMapMarker, faBuilding } from '@fortawesome/free-solid-svg-icons';
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
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen w-full flex-col bg-white dark:bg-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Add Supplier</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-4">
            <div className="w-full max-w-7xl mx-auto">
              <div className="mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-stone-100">Add Supplier</h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Register a new supplier to your system</p>
              </div>

              {error && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">⚠ {error}</p>
                </div>
              )}

              {success && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">✓ {success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., ABC Coffee Supplies"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faUser} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., John Doe"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faPhone} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., +63 917 123 4567"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Row 2: Email & Address */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., supplier@abc.com"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Address Field */}
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faMapMarker} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                      rows={2}
                      placeholder="e.g., 123 Main St, City, Country"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-orange-400 disabled:to-orange-400 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add Supplier'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/staff')}
                    disabled={isLoading}
                    className="flex-1 px-5 py-2.5 bg-stone-200 dark:bg-neutral-700 hover:bg-stone-300 dark:hover:bg-neutral-600 disabled:bg-stone-100 dark:disabled:bg-neutral-800 text-neutral-900 dark:text-stone-100 text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
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
  );
};

export default AddSupplier;
