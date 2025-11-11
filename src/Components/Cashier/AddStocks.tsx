import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faBox, faTag, faWarehouse, faBuilding, faCube } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';

interface StockFormData {
  productName: string;
  costPrice: string;
  stocks: string;
  units: string;
  supplierId: string;
}

interface Supplier {
  id: number;
  name: string;
}

const AddStocks: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<StockFormData>({
    productName: '',
    costPrice: '',
    stocks: '',
    units: '',
    supplierId: '',
  });

  // Mock supplier data - replace with API call
  const suppliers: Supplier[] = [
    { id: 1, name: 'ABC Coffee Supplies Inc.' },
    { id: 2, name: 'Premium Imports Co.' },
    { id: 3, name: 'Local Distributors Ltd.' },
    { id: 4, name: 'International Traders' },
  ];

  // Unit options
  const unitOptions = [
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'ltr', label: 'Liter (ltr)' },
    { value: 'box', label: 'Box' },
    { value: 'bag', label: 'Bag' },
    { value: 'bundle', label: 'Bundle' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!formData.productName.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      setError('Cost price must be greater than 0');
      return;
    }

    if (!formData.stocks || parseInt(formData.stocks) < 0) {
      setError('Stock quantity must be 0 or greater');
      return;
    }

    if (!formData.units) {
      setError('Unit of measurement is required');
      return;
    }

    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/stocks', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Stock added successfully!');
      setFormData({
        productName: '',
        costPrice: '',
        stocks: '',
        units: '',
        supplierId: '',
      });

      setTimeout(() => {
        navigate('/staff');
      }, 2000);
    } catch (err) {
      setError('Failed to add stock. Please try again.');
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Add Stocks</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto flex items-start justify-center px-4 sm:px-6 md:px-8 py-6">
            {/* Form Container - Landscape Layout */}
            <div className="w-full max-w-7xl">
              {/* Card */}
              <div className="relative rounded-2xl border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
                {/* Label Tag - Visual Hierarchy */}
                <div className="absolute -top-4 left-8 inline-flex h-8 items-center rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 px-4 text-xs font-bold tracking-wider text-orange-700 dark:text-orange-300 uppercase">New Stock Entry</div>

                {/* Title with Visual Hierarchy */}
                <div className="mb-7">
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-stone-100 mb-3">Add Stock</h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-normal leading-relaxed">Add new product stock to your inventory system</p>
                </div>

                {/* Divider - Subtle */}
                <div className="h-px w-full bg-gradient-to-r from-stone-200 via-stone-200 to-transparent dark:from-neutral-700 dark:via-neutral-700 mb-6" aria-hidden />

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
                  {/* Row 1: Product Name, Cost Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {/* Product Name Field */}
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                        <FontAwesomeIcon icon={faBox} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="e.g., Arabica Coffee Beans"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Cost Price Field */}
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                        <FontAwesomeIcon icon={faTag} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                        Cost Price (₱)
                      </label>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="0.00"
                        step="0.01"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Row 2: Quantity, Unit, Supplier */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                    {/* Stocks/Quantity Field */}
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                        <FontAwesomeIcon icon={faCube} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="stocks"
                        value={formData.stocks}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                        placeholder="0"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Units Field */}
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                        <FontAwesomeIcon icon={faWarehouse} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                        Unit
                      </label>
                      <select
                        name="units"
                        value={formData.units}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        disabled={isLoading}
                      >
                        <option value="">Select Unit</option>
                        {unitOptions.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Supplier Field */}
                    <div className="group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-stone-200 mb-2 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                        <FontAwesomeIcon icon={faBuilding} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                        Supplier
                      </label>
                      <select
                        name="supplierId"
                        value={formData.supplierId}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                        disabled={isLoading}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 border border-blue-200 dark:border-blue-800/50 mt-4">
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                      ℹ️ All fields are required to add a new stock entry
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-orange-400 disabled:to-orange-400 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Adding...' : 'Add Stock'}
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
    </div>
  );
};

export default AddStocks;
