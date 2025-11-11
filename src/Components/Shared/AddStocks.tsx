import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faWarehouse, 
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
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
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Add Stocks</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                    <FontAwesomeIcon icon={faWarehouse} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Add Stock</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Add new product stock to your inventory system</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Success!</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Stock has been added successfully. Redirecting...</p>
                  </div>
                </div>
              )}

              {/* Form - Flat Design */}
              <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
                
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                    placeholder="e.g., Arabica Coffee Beans"
                    disabled={isLoading}
                  />
                </div>

                {/* Cost Price & Quantity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Cost Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-neutral-500 dark:text-neutral-400">₱</span>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleChange}
                        className="w-full pl-7 pr-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                        placeholder="0.00"
                        step="0.01"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="stocks"
                      value={formData.stocks}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                      placeholder="0"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Unit & Supplier Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Unit */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="units"
                      value={formData.units}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="">Select unit</option>
                      {unitOptions.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
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
                        <span>Add Stock</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/staff')}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium rounded-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Helper Text */}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-1">
                  <span className="text-red-500">*</span> Required fields
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStocks;
