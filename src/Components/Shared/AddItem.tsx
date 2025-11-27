  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
  import { 
    faBars, 
    faBox, 
    faImage,
    faCheckCircle,
    faExclamationCircle,
    faArrowLeft,
    faPlus,
    faTrash
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

  interface ProductItem {
    productOfSupplierId: number;
    quantityUsed: number;
  }

  interface Product {
    id: number;
    productName: string;
    costPrice: number;
    stocks: number;
    units: string;
    supplierId: number;
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
    const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
    const [currentProduct, setCurrentProduct] = useState<string>('');
    const [currentQuantity, setCurrentQuantity] = useState<string>('');

    // Fetch products from API - filtered by userId from backend
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            console.log('No token found');
            return;
          }

          // Decode token to see user info
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            console.log('Decoded JWT Token:', decoded);
            console.log('User ID (uid):', decoded.uid);
          } catch (e) {
            console.error('Error decoding token:', e);
          }

          console.log('Fetching products from API...');
          // Backend will automatically filter by userId (uid) from JWT token
          const response = await fetch(`${API_BASE_URL}/Inventory/GetAllProducts`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('Response status:', response.status);

          if (response.ok) {
            const data = await response.json();
            console.log('User-specific products received from API:', data);
            console.log('Number of products:', data.length);
            if (data.length > 0) {
              console.log('First product structure:', data[0]);
              console.log('Product ID field:', data[0].id);
              console.log('Product CashierId field:', data[0].cashierId);
              console.log('Product SupplierId field:', data[0].supplierId);
            }
            setProducts(data);
          } else {
            console.error('Failed to fetch products:', response.status);
            const errorText = await response.text();
            console.error('Error details:', errorText);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };

      fetchProducts();
    }, []);

    const handleAddProduct = () => {
      if (!currentProduct || !currentQuantity) {
        setError('Please select a product and enter quantity');
        return;
      }

      const productId = parseInt(currentProduct);
      const quantity = parseInt(currentQuantity);

      console.log('Current Product (string):', currentProduct);
      console.log('Product ID (parsed):', productId);
      console.log('Quantity:', quantity);

      if (isNaN(productId) || productId === 0) {
        setError('Invalid product selected');
        console.error('Product ID is invalid:', productId);
        return;
      }

      if (quantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }

      // Check if product already exists
      const existingIndex = selectedProducts.findIndex(p => p.productOfSupplierId === productId);
      if (existingIndex >= 0) {
        setError('Product already added. Remove it first to change quantity.');
        return;
      }

      const newProduct = {
        productOfSupplierId: productId,
        quantityUsed: quantity
      };

      console.log('Adding product:', newProduct);
      setSelectedProducts([...selectedProducts, newProduct]);

      setCurrentProduct('');
      setCurrentQuantity('');
      setError('');
    };

    const handleRemoveProduct = (productId: number) => {
      setSelectedProducts(selectedProducts.filter(p => p.productOfSupplierId !== productId));
    };

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
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          return;
        }

        if (!file.type.startsWith('image/')) {
          setError('Please select a valid image file');
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            image: file,
            imagePreview: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
        setError('');
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');

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
        setError('Item image is required');
        return;
      }

      setIsLoading(true);

      // Retry logic for API cold start issues
      const maxRetries = 3; // Increase to 3 attempts
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
            throw new Error('No authentication token found. Please login again.');
          }
          
          // Create FormData for file upload
          const apiFormData = new FormData();
          apiFormData.append('Item_name', formData.itemName);
          apiFormData.append('Price', formData.price);
          apiFormData.append('Category', formData.category);
          apiFormData.append('Description', formData.description);
          apiFormData.append('Image', formData.image);
          apiFormData.append('IsAvailable', 'Yes');
          
          // Build Products.Json from selectedProducts
          const productsPayload = selectedProducts.map(p => ({
            ProductOfSupplierId: p.productOfSupplierId,
            QuantityUsed: p.quantityUsed
          }));
          
          const productsJsonString = productsPayload.length > 0 
            ? JSON.stringify(productsPayload)
            : '[]';
          
          apiFormData.append('ProductsJson', productsJsonString);
          
          if (attempt === 1) {
            console.log('ProductsJson being sent:', productsJsonString);
            console.log('Number of products being sent:', productsPayload.length);
          }

          console.log(`🔄 Attempt ${attempt} of ${maxRetries}...`);

          const response = await fetch(`${API_BASE_URL}/MenuItem/CreateMenuItem`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: apiFormData
          });

          console.log(`✅ Response received: ${response.status}`);

          if (!response.ok) {
            let errorText = '';
            try {
              errorText = await response.text();
              console.error('❌ Error response:', errorText);
            } catch (e) {
              console.error('Could not read error response');
            }
            throw new Error(errorText || `Failed to add menu item (Status: ${response.status})`);
          }

          const result = await response.json();
          console.log('✅ Menu item created successfully:', result);
          
          setSuccess('Item added successfully!');
          setFormData({
            itemName: '',
            price: '',
            category: '',
            description: '',
            image: null,
            imagePreview: null,
          });
          setSelectedProducts([]);
          setCurrentProduct('');
          setCurrentQuantity('');

          setTimeout(() => {
            navigate('/staff');
          }, 2000);
          
          // Success - break out of retry loop
          return;

        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          console.error(`❌ Attempt ${attempt} failed:`, lastError.message);
          
          // If connection refused and not last attempt, wait longer
          if (attempt < maxRetries) {
            const waitTime = attempt === 1 ? 2000 : 1500; // Wait 2s after first fail, 1.5s after
            console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      // All retries failed
      if (lastError) {
        console.error('💥 === All attempts failed ===');
        console.error('The API crashed on first request. This is a backend issue.');
        console.error('Error message:', lastError.message);
        console.error('================================');
        
        setError('API connection issue. Please try again or check if the API is running properly.');
      }
      
      setIsLoading(false);
    };

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

                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Add Menu Item</h1>
                </div>

                <LogoutPanel />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="w-full max-w-5xl mx-auto">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                      <FontAwesomeIcon icon={faBox} className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent truncate">Add Menu Item</h2>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-stone-400 mt-1">Create a new menu item for your store</p>
                    </div>
                  </div>
                </div>

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
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl sm:rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-sm shadow-lg">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Success!</p>
                      <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">Menu item has been added successfully. Redirecting...</p>
                    </div>
                  </div>
                )}

                {/* Form - Improved Design */}
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-neutral-200/50 dark:border-stone-700/50 shadow-xl shadow-neutral-900/5">
                  
                  {/* Item Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all text-sm sm:text-base"
                      placeholder="e.g., Iced Latte"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Price and Category - Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Price */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-stone-400 text-sm sm:text-base font-medium">₱</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all text-sm sm:text-base"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 appearance-none cursor-pointer transition-all text-sm sm:text-base"
                        disabled={isLoading}
                      >
                        <option value="">Select category</option>
                        <option value="Coffee">Coffee</option>
                        <option value="Non-Coffee">Non-Coffee</option>
                        <option value="Food">Food</option>
                        <option value="Dessert">Dessert</option>
                        <option value="Beverage">Beverage</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 resize-none transition-all text-sm sm:text-base"
                      rows={4}
                      placeholder="Brief description of the menu item"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Product Items - Multiple Selection */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Product Items (Optional)
                    </label>
                    
                    {/* Add Product Form */}
                    <div className="space-y-4 p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800/30 rounded-xl border border-neutral-200 dark:border-stone-700">
                      <div className="flex flex-col gap-3">
                        <div>
                          <select
                            value={currentProduct}
                            onChange={(e) => setCurrentProduct(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 appearance-none cursor-pointer transition-all text-sm sm:text-base"
                            disabled={isLoading}
                          >
                            <option value="">Select a product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.productName}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex gap-2 sm:gap-3">
                          <input
                            type="number"
                            value={currentQuantity}
                            onChange={(e) => setCurrentQuantity(e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all text-sm sm:text-base"
                            placeholder="Quantity"
                            min="0"
                            step="1"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={handleAddProduct}
                            className="flex-shrink-0 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg min-w-[80px] sm:min-w-[100px]"
                            disabled={isLoading}
                          >
                            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="text-sm sm:text-base">Add</span>
                          </button>
                        </div>
                      </div>

                      {/* Selected Products List */}
                      {selectedProducts.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                            <span>Selected Products ({selectedProducts.length})</span>
                          </p>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {selectedProducts.map((item) => {
                              const product = products.find(p => p.id === item.productOfSupplierId);
                              return (
                                <div
                                  key={item.productOfSupplierId}
                                  className="flex items-center justify-between gap-3 p-3 sm:p-4 bg-stone-50 dark:bg-stone-900 rounded-lg sm:rounded-xl border border-neutral-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-all"
                                >
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-white truncate">
                                    {product?.productName || `Product #${item.productOfSupplierId}`}
                                  </p>
                                  <p className="text-xs text-neutral-500 dark:text-stone-400">
                                    Quantity: {item.quantityUsed}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.productOfSupplierId)}
                                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                  disabled={isLoading}
                                  aria-label="Remove product"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Item Image <span className="text-red-500">*</span>
                    </label>
                    
                    {!formData.imagePreview ? (
                      <div className="relative border-2 border-dashed border-neutral-300 dark:border-stone-600 rounded-xl p-6 sm:p-8 hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer bg-neutral-50 dark:bg-stone-800/50 transition-all duration-200">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={isLoading}
                        />
                        <div className="flex flex-col items-center text-center pointer-events-none">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center mb-3">
                            <FontAwesomeIcon icon={faImage} className="h-6 w-6 sm:h-7 sm:w-7 text-orange-500" />
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-stone-700 dark:text-stone-300">Click to upload image</p>
                          <p className="text-xs sm:text-sm text-neutral-500 dark:text-stone-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border-2 border-neutral-300 dark:border-stone-700 bg-neutral-100 dark:bg-stone-800">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="w-full h-48 sm:h-56 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                        <div className="absolute top-3 right-3 flex gap-2">
                          <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                            Uploaded
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors flex items-center gap-1.5"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-neutral-200 dark:border-stone-700">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-neutral-400 disabled:to-neutral-400 text-white font-semibold rounded-xl disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 active:scale-[0.98] text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Adding Item...</span>
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span>Add Menu Item</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/staff')}
                      disabled={isLoading}
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-neutral-200 dark:bg-stone-800 hover:bg-neutral-300 dark:hover:bg-stone-700 text-neutral-900 dark:text-white font-semibold rounded-xl disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md text-sm sm:text-base"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Cancel</span>
                    </button>
                  </div>

                  {/* Helper Text */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <p className="text-xs sm:text-sm text-neutral-500 dark:text-stone-400 text-center">
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

  export default AddItem;
