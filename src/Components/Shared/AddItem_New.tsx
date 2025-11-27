import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faBox, 
  faTag, 
  faFileAlt, 
  faImage,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft,
  faList,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
import LogoutPanel from './LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface ItemFormData {
  itemName: string;
  price: string;
  category: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
}

interface Product {
  id: number;
  productName: string;
  stocks: number;
}

interface SelectedProduct {
  productOfSupplierId: number;
  quantityUsed: number;
  productName: string;
}

const AddItem: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<ItemFormData>({
    itemName: '',
    price: '',
    category: '',
    description: '',
    image: null,
    imagePreview: null,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  
  // New fields for direct input
  const [productItem, setProductItem] = useState('');
  const [quantity, setQuantity] = useState('');

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/Inventory/GetAllProducts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.itemName.trim()) {
      setError('Item name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.image) {
      setError('Image is required. Please upload an image.');
      return;
    }

    console.log('Form validation passed. Submitting...');

    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      // Decode JWT to get cashierId
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      const cashierId = decoded.cashierId;

      if (!cashierId) {
        throw new Error('Cashier ID not found in token. Please login again.');
      }
      
      // Create FormData for file upload
      const apiFormData = new FormData();
      apiFormData.append('Item_name', formData.itemName);
      apiFormData.append('Price', formData.price);
      apiFormData.append('Category', formData.category);
      apiFormData.append('Description', formData.description);
      apiFormData.append('Image', formData.image);
      apiFormData.append('IsAvailable', 'true');
      apiFormData.append('cashierId', cashierId.toString());
      
      // Add products as JSON string (empty array if no products)
      const productsPayload = selectedProducts.map(p => ({
        ProductOfSupplierId: p.productOfSupplierId,
        QuantityUsed: p.quantityUsed
      }));
      
      // If no products selected, send empty array (backend will handle it)
      const productsJsonString = productsPayload.length > 0 
        ? JSON.stringify(productsPayload)
        : '[]';
      
      apiFormData.append('ProductsJson', productsJsonString);
      console.log('ProductsJson being sent:', productsJsonString);

      console.log('Sending menu item data:');
      console.log('Item Name:', formData.itemName);
      console.log('Price:', formData.price);
      console.log('Category:', formData.category);
      console.log('Description:', formData.description);
      console.log('Image:', formData.image?.name);
      console.log('Products:', productsPayload);
      console.log('Token exists:', !!token);
      console.log('API URL:', `${API_BASE_URL}/MenuItem/CreateMenuItem`);

      // Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of apiFormData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, `(${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await fetch(`${API_BASE_URL}/MenuItem/CreateMenuItem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - browser will set it automatically with boundary for FormData
        },
        body: apiFormData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Get the response text first
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        console.error('Error response status:', response.status);
        console.error('Error response text:', responseText);
        
        // Try to parse error as JSON
        let errorMessage = 'Failed to add menu item';
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.title || errorJson.errors || responseText;
          console.error('Parsed error:', errorJson);
        } catch {
          errorMessage = responseText || 'Unknown error occurred';
        }
        
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Success result (parsed):', result);
      } catch (parseErr) {
        console.log('Could not parse JSON response (might be plain text):', responseText);
        result = { success: true, message: responseText };
      }

      // Check if the result has an ID or other confirmation
      if (result && (result.id || result.itemId || result.success !== false)) {
        console.log('✅ Menu item created successfully!');
        console.log('Result data:', result);
        
        setSuccess('Menu item added successfully!');
        setFormData({
          itemName: '',
          price: '',
          category: '',
          description: '',
          image: null,
          imagePreview: null,
        });
        setSelectedProducts([]);

        setTimeout(() => {
          navigate('/staff');
        }, 2000);
      } else {
        console.error('⚠️ Unexpected response format:', result);
        throw new Error('Menu item may not have been saved properly. Please check the database.');
      }
    } catch (err) {
      console.error('❌ Error adding menu item:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      setError(err instanceof Error ? err.message : 'Failed to add menu item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = (product: Product, quantity: number) => {
    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    const exists = selectedProducts.find(p => p.productOfSupplierId === product.id);
    if (exists) {
      setSelectedProducts(selectedProducts.map(p => 
        p.productOfSupplierId === product.id 
          ? { ...p, quantityUsed: quantity }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        productOfSupplierId: product.id,
        quantityUsed: quantity,
        productName: product.productName
      }]);
    }
    setError('');
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.productOfSupplierId !== productId));
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
        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-stone-700/50 bg-stone-50/80 dark:bg-neutral-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Add Menu Item</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area - Landscape Layout */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full max-w-4xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                    <FontAwesomeIcon icon={faBox} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Add Menu Item</h2>
                    <p className="text-sm text-neutral-600 dark:text-stone-400 mt-1">Create a new menu item for your store</p>
                  </div>
                </div>
              </div>

              {/* Error & Success Messages */}
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
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Menu item has been added successfully. Redirecting...</p>
                  </div>
                </div>
              )}

              {/* Form - Enhanced Design */}
              <form onSubmit={handleSubmit} className="space-y-8 bg-stone-50/80 dark:bg-neutral-900/80 p-8 sm:p-10 rounded-3xl border-2 border-orange-100/80 dark:border-stone-700/80 shadow-2xl shadow-orange-500/10 backdrop-blur-xl">
                
                {/* Form Fields Section */}
                <div className="space-y-6">
                  {/* Item Name - Floating Label */}
                  <div className="relative group">
                    <div className="absolute left-5 top-4 z-10 flex items-center gap-2 pointer-events-none">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        formData.itemName 
                          ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                          : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700'
                      }`}>
                        <FontAwesomeIcon icon={faBox} className={`h-4 w-4 transition-colors duration-300 ${
                          formData.itemName ? 'text-white' : 'text-neutral-400 dark:text-stone-500'
                        }`} />
                      </div>
                    </div>
                    <input
                      type="text"
                      name="itemName"
                      id="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-stone-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter item name (e.g., Iced Latte)"
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="itemName"
                      className="absolute -top-2.5 left-14 px-2 bg-stone-50 dark:bg-stone-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                    >
                      Item Name <span className="text-red-500">*</span>
                    </label>
                  </div>

                  {/* Price & Category Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price - Floating Label */}
                    <div className="relative group">
                      <div className="absolute left-5 top-4 z-10 flex items-center gap-2 pointer-events-none">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          formData.price 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                            : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700'
                        }`}>
                          <FontAwesomeIcon icon={faTag} className={`h-4 w-4 transition-colors duration-300 ${
                            formData.price ? 'text-white' : 'text-neutral-400 dark:text-stone-500'
                          }`} />
                        </div>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-stone-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="price"
                        className="absolute -top-2.5 left-14 px-2 bg-stone-50 dark:bg-stone-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Price (₱) <span className="text-red-500">*</span>
                      </label>
                      {formData.price && parseFloat(formData.price) > 0 && (
                        <div className="absolute right-4 top-4 text-sm font-bold text-orange-600 dark:text-orange-400">
                          ₱{parseFloat(formData.price).toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Category - Floating Label */}
                    <div className="relative group">
                      <div className="absolute left-5 top-4 z-10 flex items-center gap-2 pointer-events-none">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          formData.category 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                            : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700'
                        }`}>
                          <FontAwesomeIcon icon={faList} className={`h-4 w-4 transition-colors duration-300 ${
                            formData.category ? 'text-white' : 'text-neutral-400 dark:text-stone-500'
                          }`} />
                        </div>
                      </div>
                      <select
                        name="category"
                        id="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white focus:outline-none border-neutral-200 dark:border-stone-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
                        disabled={isLoading}
                      >
                        <option value="">Select category</option>
                        <option value="Coffee">Coffee</option>
                        <option value="Non-Coffee">Non-Coffee</option>
                        <option value="Food">Food</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                      <label 
                        htmlFor="category"
                        className="absolute -top-2.5 left-14 px-2 bg-stone-50 dark:bg-stone-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Category <span className="text-red-500">*</span>
                      </label>
                    </div>

                    {/* Character Count for Description */}
                    <div className="relative group md:col-span-2">
                      <div className="absolute left-5 top-4 z-10 flex items-center gap-2 pointer-events-none">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          formData.description 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                            : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700'
                        }`}>
                          <FontAwesomeIcon icon={faFileAlt} className={`h-4 w-4 transition-colors duration-300 ${
                            formData.description ? 'text-white' : 'text-neutral-400 dark:text-stone-500'
                          }`} />
                        </div>
                      </div>
                      <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-stone-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={4}
                        maxLength={200}
                        placeholder="Describe your item (e.g., Rich espresso with steamed milk and ice)"
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="description"
                        className="absolute -top-2.5 left-14 px-2 bg-stone-50 dark:bg-stone-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Description <span className="text-red-500">*</span>
                      </label>
                      <div className="absolute bottom-3 right-4 text-xs font-medium text-neutral-400 dark:text-stone-500">
                        {formData.description.length}/200
                      </div>
                    </div>
                  </div>

                  {/* Product Item and Quantity Input Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Item - Floating Label */}
                    <div className="relative group">
                      <div className="absolute left-5 top-4 z-10 flex items-center gap-2 pointer-events-none">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          productItem 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                            : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700'
                        }`}>
                          <FontAwesomeIcon icon={faBox} className={`h-4 w-4 transition-colors duration-300 ${
                            productItem ? 'text-white' : 'text-neutral-400 dark:text-stone-500'
                          }`} />
                        </div>
                      </div>
                      <input
                        type="text"
                        name="productItem"
                        id="productItem"
                        value={productItem}
                        onChange={(e) => setProductItem(e.target.value)}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-stone-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter product item name"
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="productItem"
                        className="absolute -top-2.5 left-14 px-2 bg-stone-50 dark:bg-stone-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Product Item
                      </label>
                    </div>

                    {/* Quantity - Floating Label */}
                    <div className="relative group">
                      <div className="absolute left-5 top-4 z-10 flex items-center gap-2 pointer-events-none">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          quantity 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' 
                            : 'bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700'
                        }`}>
                          <FontAwesomeIcon icon={faList} className={`h-4 w-4 transition-colors duration-300 ${
                            quantity ? 'text-white' : 'text-neutral-400 dark:text-stone-500'
                          }`} />
                        </div>
                      </div>
                      <input
                        type="number"
                        name="quantity"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-stone-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter quantity"
                        min="0"
                        step="1"
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="quantity"
                        className="absolute -top-2.5 left-14 px-2 bg-stone-50 dark:bg-stone-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Quantity
                      </label>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-stone-200">
                        <FontAwesomeIcon icon={faBox} className="text-orange-600 dark:text-orange-400" />
                        Products Used <span className="text-neutral-400 dark:text-stone-500 font-normal">(Optional)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowProductModal(true)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                        Add Product
                      </button>
                    </div>

                    {/* Selected Products List */}
                    {selectedProducts.length > 0 && (
                      <div className="space-y-3">
                        {selectedProducts.map((product) => {
                          const productData = products.find(p => p.id === product.productOfSupplierId);
                          return (
                            <div key={product.productOfSupplierId} className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{product.productName}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-neutral-500 dark:text-stone-400">Quantity:</span>
                                    <span className="px-2 py-0.5 bg-orange-600 dark:bg-orange-500 text-white text-xs font-bold rounded-md">
                                      {product.quantityUsed}
                                    </span>
                                  </div>
                                  {productData && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-neutral-500 dark:text-stone-400">Available:</span>
                                      <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                                        productData.stocks > 10 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                          : productData.stocks > 0
                                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                      }`}>
                                        {productData.stocks}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(product.productOfSupplierId)}
                                className="flex-shrink-0 p-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                                title="Remove product"
                              >
                                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-stone-800 dark:text-stone-200">
                      <FontAwesomeIcon icon={faImage} className="text-orange-600 dark:text-orange-400" />
                      Item Image <span className="text-neutral-400 dark:text-stone-500 font-normal">(Optional)</span>
                    </label>
                    <span className="text-xs font-medium text-neutral-500 dark:text-stone-400">
                      Max 5MB
                    </span>
                  </div>
                  
                  {!formData.imagePreview ? (
                    <div className="relative border-2 border-dashed border-neutral-300 dark:border-stone-600 rounded-2xl p-8 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-gradient-to-br hover:from-orange-50/50 hover:to-amber-50/30 dark:hover:from-orange-950/30 dark:hover:to-amber-950/20 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-900">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isLoading}
                      />
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/50 dark:to-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-500/10">
                          <FontAwesomeIcon icon={faImage} className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-stone-400">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <div className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
                          Choose File
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-neutral-900 shadow-xl shadow-orange-500/20 animate-in fade-in zoom-in-95 duration-300">
                      <div className="aspect-video w-full bg-neutral-100 dark:bg-stone-800">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <div className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl shadow-lg backdrop-blur-sm flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="h-3.5 w-3.5" />
                          Uploaded
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="text-xs font-semibold opacity-90">Image Preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 relative overflow-hidden px-8 py-4 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-700 hover:via-orange-600 hover:to-orange-700 disabled:from-neutral-400 disabled:to-neutral-400 text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 disabled:shadow-none active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    {isLoading ? (
                      <>
                        <span className="relative inline-block h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span className="relative">Adding Item...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                        <span className="relative">Add Menu Item</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/staff')}
                    disabled={isLoading}
                    className="flex-1 px-8 py-4 bg-stone-50 dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 text-neutral-900 dark:text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group border-2 border-neutral-200 dark:border-stone-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Helper Text */}
                <div className="flex items-center justify-between pt-4 text-xs">
                  <p className="text-neutral-500 dark:text-stone-400">
                    <span className="text-red-500 font-semibold">*</span> Required fields
                  </p>
                  <p className="text-neutral-400 dark:text-stone-500">
                    All data will be saved securely
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Select Products</h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setSearchProduct('');
                  }}
                  className="text-white hover:bg-stone-50/20 rounded-lg p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50/90 dark:bg-neutral-800/90 border border-white/50 dark:border-stone-700 rounded-lg text-neutral-900 dark:text-white placeholder-stone-500 focus:outline-none focus:border-white"
                />
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="space-y-3">
                {products
                  .filter(p => p.productName.toLowerCase().includes(searchProduct.toLowerCase()))
                  .map((product) => {
                    const [quantity, setQuantity] = useState(
                      selectedProducts.find(sp => sp.productOfSupplierId === product.id)?.quantityUsed || 1
                    );
                    
                    return (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-stone-800 rounded-xl border-2 border-neutral-200 dark:border-stone-700 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-200">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-neutral-900 dark:text-white mb-2">{product.productName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-stone-400">Available Stock:</span>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                              product.stocks > 10 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : product.stocks > 0
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            }`}>
                              {product.stocks} units
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <label className="text-xs font-semibold text-neutral-600 dark:text-stone-400">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={product.stocks}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-24 px-3 py-2.5 bg-stone-50 dark:bg-stone-900 border-2 border-neutral-300 dark:border-stone-600 rounded-lg text-center text-neutral-900 dark:text-white font-bold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            handleAddProduct(product, quantity);
                            setShowProductModal(false);
                            setSearchProduct('');
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                          Add
                        </button>
                      </div>
                    );
                  })}
                
                {products.filter(p => p.productName.toLowerCase().includes(searchProduct.toLowerCase())).length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 dark:text-stone-400">No products found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddItem;
