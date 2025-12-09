import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWarehouse, 
  faCheckCircle,
  faExclamationCircle,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import MessageBox from './MessageBox';
import { API_BASE_URL } from '../../config/api';
import { jwtDecode } from 'jwt-decode';

interface AddStocksProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StockFormData {
  productName: string;
  costPrice: string;
  stocks: string;
  units: string;
  supplierId: string;
}

interface Supplier {
  id: number;
  supplierName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  transactionDate: string;
  productOfSupplier: any[];
}

const AddStocks: React.FC<AddStocksProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [messageBox, setMessageBox] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const [formData, setFormData] = useState<StockFormData>({
    productName: '',
    costPrice: '',
    stocks: '',
    units: '',
    supplierId: '',
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [_loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Get userId from JWT token
  const getUserId = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      const payload: any = jwtDecode(token);
      // Extract userId from cashierId claim
      const userId = payload?.cashierId || 
                     payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                     payload?.uid || 
                     payload?.sub;
      
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const token = localStorage.getItem('accessToken');
        const userId = getUserId();

        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }
        
        const response = await fetch(`${API_BASE_URL}/Supplier/GetAllSuppliers?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch suppliers: ${response.status}`);
        }

        const data: Supplier[] = await response.json();
        console.log('Suppliers received:', data);
        setSuppliers(data);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError('Failed to load suppliers. Please refresh the page.');
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
  }, []);

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
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Prepare request body matching API structure
      const requestBody = {
        productName: formData.productName,
        costPrice: parseFloat(formData.costPrice),
        stocks: parseInt(formData.stocks),
        units: formData.units,
        supplierId: parseInt(formData.supplierId),
      };

      const response = await fetch(`${API_BASE_URL}/Inventory/AddProductsOfSuppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to add stock');
        throw new Error(errorText || `Failed to add stock: ${response.status}`);
      }

      // Read response as text since API returns plain text
      const result = await response.text();
      console.log('Stock added successfully:', result);

      setSuccess('Stock added successfully!');
      setMessageBox({
        isOpen: true,
        title: 'Success',
        message: 'Stock has been added successfully to the inventory!',
        type: 'success',
      });
      
      setFormData({
        productName: '',
        costPrice: '',
        stocks: '',
        units: '',
        supplierId: '',
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding stock:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add stock. Please try again.';
      setError(errorMessage);
      setMessageBox({
        isOpen: true,
        title: 'Error',
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Content */}
        <div 
          className="relative w-full max-w-4xl bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 dark:border-stone-700 bg-stone-50/95 dark:bg-stone-900/95 px-6 py-4 backdrop-blur-xl rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                <FontAwesomeIcon icon={faWarehouse} className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">Add Stock</h2>
                <p className="text-xs text-stone-600 dark:text-stone-400">Add new product stock to your inventory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-5">

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl sm:rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm shadow-lg">
                <FontAwesomeIcon icon={faExclamationCircle} className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">Error</p>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1 break-words">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl sm:rounded-2xl flex items-start gap-3">
                <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Success!</p>
                  <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1 break-words">Stock has been added successfully.</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="e.g., Arabica Coffee Beans"
                  disabled={isLoading}
                />
              </div>

              {/* Cost Price & Quantity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Cost Price */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Cost Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-stone-500 dark:text-stone-400">₱</span>
                    <input
                      type="number"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      step="0.01"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stocks"
                    value={formData.stocks}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="units"
                    value={formData.units}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id.toString()}>
                        {supplier.supplierName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-700">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-stone-400 disabled:to-stone-400 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 disabled:shadow-none transition-all duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Adding Stock...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                      <span>Add Stock</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <MessageBox
        isOpen={messageBox.isOpen}
        onClose={() => setMessageBox({ ...messageBox, isOpen: false })}
        title={messageBox.title}
        message={messageBox.message}
        type={messageBox.type}
      />
    </div>
  );
};

export default AddStocks;
