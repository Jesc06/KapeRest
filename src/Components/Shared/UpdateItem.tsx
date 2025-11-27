import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faImage,
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faPlus,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api';

interface UpdateItemProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  onSuccess: () => void;
}

interface ItemFormData {
  itemName: string;
  price: string;
  category: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
  isAvailable: string;
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

const UpdateItem: React.FC<UpdateItemProps> = ({ isOpen, onClose, itemId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<ItemFormData>({
    itemName: '',
    price: '',
    category: '',
    description: '',
    image: null,
    imagePreview: null,
    isAvailable: 'Available',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([]);
  const [currentProduct, setCurrentProduct] = useState<string>('');
  const [currentQuantity, setCurrentQuantity] = useState<string>('');

  // Fetch item details when modal opens
  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails();
      fetchProducts();
    }
  }, [isOpen, itemId]);

  const fetchItemDetails = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
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
        console.error('Cashier ID not found in token');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/MenuItem/GetAllMenuItem?cashierId=${cashierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const item = data.find((i: any) => i.id === itemId);

      console.log('All items from API:', data);
      console.log('Looking for itemId:', itemId);
      console.log('Found item:', item);

      if (item) {
        console.log('Item details:', {
          id: item.id,
          itemName: item.itemName,
          price: item.price,
          category: item.category,
          description: item.description,
          isAvailable: item.isAvailable
        });
        
        setFormData({
          itemName: item.itemName,
          price: item.price.toString(),
          category: item.category || '',
          description: item.description,
          image: null,
          imagePreview: item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`,
          isAvailable: item.isAvailable,
        });
      } else {
        console.error('Item not found in the list!');
        setError('Item not found');
      }
    } catch (err) {
      console.error('Error fetching item details:', err);
      setError('Failed to load item details');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Inventory/GetAllProducts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('All products loaded:', data.length);
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct || !currentQuantity) {
      setError('Please select a product and enter quantity');
      return;
    }

    const productId = parseInt(currentProduct);
    const quantity = parseInt(currentQuantity);

    if (isNaN(productId) || productId === 0) {
      setError('Invalid product selected');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    const existingIndex = selectedProducts.findIndex(p => p.productOfSupplierId === productId);
    if (existingIndex >= 0) {
      setError('Product already added. Remove it first to change quantity.');
      return;
    }

    const newProduct = {
      productOfSupplierId: productId,
      quantityUsed: quantity
    };

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

    // Warning about products
    if (selectedProducts.length > 0) {
      console.warn('⚠️ Products selected:', selectedProducts);
      console.warn('⚠️ Make sure these products belong to your cashier account!');
    } else {
      console.log('✅ No products selected - will clear existing product associations');
    }

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

      console.log('Decoded JWT:', decoded);
      console.log('CashierId from JWT:', cashierId);
      console.log('Item ID to update:', itemId);

      if (!cashierId) {
        throw new Error('Cashier ID not found in token');
      }
      
      // Create FormData for file upload
      const apiFormData = new FormData();
      apiFormData.append('Id', itemId.toString());
      apiFormData.append('cashierId', cashierId);
      apiFormData.append('Item_name', formData.itemName);
      apiFormData.append('Price', formData.price);
      apiFormData.append('Category', formData.category);
      apiFormData.append('Description', formData.description);
      apiFormData.append('IsAvailable', formData.isAvailable);

      // Log FormData contents
      console.log('FormData contents:');
      console.log('- Id:', itemId);
      console.log('- cashierId:', cashierId);
      console.log('- Item_name:', formData.itemName);
      console.log('- Price:', formData.price);
      console.log('- Category:', formData.category);
      console.log('- Description:', formData.description);
      console.log('- IsAvailable:', formData.isAvailable);
      
      // Handle image - if new image selected, use it; otherwise fetch the existing image
      if (formData.image) {
        console.log('Using newly selected image');
        apiFormData.append('Image', formData.image);
      } else if (formData.imagePreview) {
        console.log('Converting existing image from base64');
        // Convert base64 to blob if no new image was selected
        const base64Response = await fetch(formData.imagePreview);
        const blob = await base64Response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        apiFormData.append('Image', file);
        console.log('Image blob size:', blob.size);
      } else {
        console.error('No image available!');
        throw new Error('Image is required');
      }
      
      // Build Products.Json from selectedProducts
      const productsPayload = selectedProducts.map(p => ({
        ProductOfSupplierId: p.productOfSupplierId,
        QuantityUsed: p.quantityUsed
      }));
      
      const productsJsonString = productsPayload.length > 0 
        ? JSON.stringify(productsPayload)
        : '[]';
      
      apiFormData.append('ProductsJson', productsJsonString);
      console.log('- ProductsJson:', productsJsonString);

      console.log('Sending PUT request to:', `${API_BASE_URL}/MenuItem/UpdateMenuItem`);
      console.log('Request method: PUT');
      console.log('Authorization token present:', !!token);

      const response = await fetch(`${API_BASE_URL}/MenuItem/UpdateMenuItem`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: apiFormData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response status:', response.status);
        console.error('Error response text:', errorText);
        console.error('Full error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(errorText || 'Failed to update menu item');
      }

      const result = await response.text();
      console.log('Menu item updated successfully:', result);
      
      setSuccess('Item updated successfully!');

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating menu item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <FontAwesomeIcon icon={faBox} className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Update Menu Item</h2>
              <p className="text-sm text-neutral-600 dark:text-stone-400">Edit the details of your menu item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-neutral-600 dark:text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-neutral-600 dark:text-stone-400">Loading item details...</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
                  <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Error</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-xl flex items-start gap-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300">Success!</p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Menu item has been updated successfully.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cashier ID Display - For Debugging */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                  <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                    Cashier ID (from JWT Token)
                  </label>
                  <input
                    type="text"
                    value={(() => {
                      try {
                        const token = localStorage.getItem('accessToken');
                        if (!token) return 'No token found';
                        const base64Url = token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        const decoded = JSON.parse(jsonPayload);
                        return decoded.cashierId || 'cashierId not found in token';
                      } catch (e) {
                        return 'Error decoding token';
                      }
                    })()}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 font-mono text-sm"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    This is the cashierId that will be sent with the update request
                  </p>
                </div>

                {/* Item ID Display - For Debugging */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-lg">
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Item ID
                  </label>
                  <input
                    type="text"
                    value={itemId}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-purple-300 dark:border-purple-700 bg-purple-100 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 font-mono text-sm"
                  />
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                    This is the item ID that will be updated
                  </p>
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all"
                    placeholder="e.g., Iced Latte"
                    disabled={isLoading}
                  />
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-stone-400 font-medium">₱</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-9 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 appearance-none cursor-pointer transition-all"
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

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="isAvailable"
                    value={formData.isAvailable}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 appearance-none cursor-pointer transition-all"
                    disabled={isLoading}
                  >
                    <option value="Available">Available</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 resize-none transition-all"
                    rows={4}
                    placeholder="Brief description of the menu item"
                    disabled={isLoading}
                  />
                </div>

                {/* Product Items */}
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Product Items (Optional)
                  </label>
                  
                  <div className="space-y-4 p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-800/30 rounded-xl border border-neutral-200 dark:border-stone-700">
                    <div className="flex flex-col gap-3">
                      <div>
                        <select
                          value={currentProduct}
                          onChange={(e) => setCurrentProduct(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 appearance-none cursor-pointer transition-all"
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
                      
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={currentQuantity}
                          onChange={(e) => setCurrentQuantity(e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border border-neutral-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 transition-all"
                          placeholder="Quantity"
                          min="0"
                          step="1"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={handleAddProduct}
                          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          disabled={isLoading}
                        >
                          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {selectedProducts.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span>Selected Products ({selectedProducts.length})</span>
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {selectedProducts.map((item) => {
                            const product = products.find(p => p.id === item.productOfSupplierId);
                            return (
                              <div
                                key={item.productOfSupplierId}
                                className="flex items-center justify-between gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-neutral-200 dark:border-stone-700 shadow-sm hover:shadow-md transition-all"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                    {product?.productName || `Product #${item.productOfSupplierId}`}
                                  </p>
                                  <p className="text-xs text-neutral-500 dark:text-stone-400">
                                    Quantity: {item.quantityUsed}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProduct(item.productOfSupplierId)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                  disabled={isLoading}
                                >
                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
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
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                    Item Image <span className="text-red-500">*</span>
                  </label>
                  
                  {!formData.imagePreview ? (
                    <div className="relative border-2 border-dashed border-neutral-300 dark:border-stone-600 rounded-xl p-8 hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer bg-neutral-50 dark:bg-neutral-800/50 transition-all duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={isLoading}
                      />
                      <div className="flex flex-col items-center text-center pointer-events-none">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 flex items-center justify-center mb-3">
                          <FontAwesomeIcon icon={faImage} className="h-7 w-7 text-orange-500" />
                        </div>
                        <p className="text-base font-semibold text-stone-700 dark:text-stone-300">Click to upload image</p>
                        <p className="text-sm text-neutral-500 dark:text-stone-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-neutral-300 dark:border-stone-700 bg-neutral-100 dark:bg-stone-800">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-56 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                          {formData.image ? 'New Image' : 'Current Image'}
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
                <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-stone-700">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-neutral-400 disabled:to-neutral-400 text-white font-semibold rounded-xl disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200 active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
                        <span>Update Item</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3.5 bg-neutral-200 dark:bg-stone-800 hover:bg-neutral-300 dark:hover:bg-stone-700 text-neutral-900 dark:text-white font-semibold rounded-xl disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateItem;
