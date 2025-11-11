import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faBox, faTag, faFileAlt, faImage } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from './LogoutPanel';

interface ItemFormData {
  itemName: string;
  price: string;
  description: string;
  image: File | null;
  imagePreview: string | null;
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
    description: '',
    image: null,
    imagePreview: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call with file upload
      // const formDataApi = new FormData();
      // formDataApi.append('itemName', formData.itemName);
      // formDataApi.append('price', formData.price);
      // formDataApi.append('description', formData.description);
      // if (formData.image) {
      //   formDataApi.append('image', formData.image);
      // }
      // const response = await fetch('/api/items', {
      //   method: 'POST',
      //   body: formDataApi
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Menu item added successfully!');
      setFormData({
        itemName: '',
        price: '',
        description: '',
        image: null,
        imagePreview: null,
      });

      setTimeout(() => {
        navigate('/staff');
      }, 2000);
    } catch (err) {
      setError('Failed to add menu item. Please try again.');
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Add Menu Item</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area - Landscape Layout */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-4">
            {/* Form Container - Landscape Layout */}
            <div className="w-full max-w-7xl mx-auto">
              {/* Title Section */}
              <div className="mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-stone-100">Add Menu Item</h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Create a new menu item for your store</p>
              </div>

              {/* Error & Success Messages */}
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Row 1: Item Name & Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Item Name Field */}
                  <div className="group">
                    <label className="block text-xs font-bold text-neutral-900 dark:text-stone-100 mb-1.5 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faBox} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="e.g., Chocolate Cake"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Price Field */}
                  <div className="group">
                    <label className="block text-xs font-bold text-neutral-900 dark:text-stone-100 mb-1.5 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                      <FontAwesomeIcon icon={faTag} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md"
                      placeholder="199.99"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Row 2: Description */}
                <div className="group">
                  <label className="block text-xs font-bold text-neutral-900 dark:text-stone-100 mb-1.5 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                    <FontAwesomeIcon icon={faFileAlt} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 shadow-sm hover:shadow-md resize-none"
                    rows={2}
                    placeholder="Describe the item's features, ingredients, quality, etc."
                    disabled={isLoading}
                  />
                </div>

                {/* Row 3: Image Upload */}
                <div className="group">
                  <label className="block text-xs font-bold text-neutral-900 dark:text-stone-100 mb-1.5 group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200">
                    <FontAwesomeIcon icon={faImage} className="mr-1.5 text-orange-600 dark:text-orange-500" />
                    Item Image
                  </label>
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-stone-300 dark:border-neutral-600 rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isLoading}
                      />
                      <div className="flex flex-col items-center justify-center py-2">
                        <FontAwesomeIcon icon={faImage} className="h-8 w-8 text-orange-600 dark:text-orange-500 mb-2" />
                        <p className="text-xs font-semibold text-neutral-900 dark:text-stone-100">Click to upload or drag and drop</p>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {formData.imagePreview && (
                      <div className="relative rounded-lg overflow-hidden border border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-stone-50 dark:from-orange-950/30 dark:to-neutral-800">
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="h-32 w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-orange-400 disabled:to-orange-400 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Adding...' : 'Add Item'}
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

export default AddItem;
