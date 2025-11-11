import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faChevronLeft, faChevronRight, faBox, faFileAlt, faImage } from '@fortawesome/free-solid-svg-icons';
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

    if (!formData.image) {
      setError('Item image is required');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // const formDataToSend = new FormData();
      // formDataToSend.append('itemName', formData.itemName);
      // formDataToSend.append('price', formData.price);
      // formDataToSend.append('description', formData.description);
      // formDataToSend.append('image', formData.image);
      //
      // const response = await fetch('/api/items', {
      //   method: 'POST',
      //   body: formDataToSend
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Item added successfully!');
      setFormData({
        itemName: '',
        price: '',
        description: '',
        image: null,
        imagePreview: null,
      });

      setTimeout(() => {
        navigate('/staff/add-item');
      }, 2000);
    } catch (err) {
      setError('Failed to add item. Please try again.');
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
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 dark:text-stone-100 truncate">Add MenuItem</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center px-4 sm:px-6 md:px-8 py-6">
            {/* Form Container - Minimal & Centered */}
            <div className="w-full max-w-2xl">
              {/* Card */}
              <div className="relative rounded-2xl border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
                {/* Label Tag - Visual Hierarchy */}
                <div className="absolute -top-4 left-8 inline-flex h-8 items-center rounded-full border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 px-4 text-xs font-bold tracking-wider text-orange-700 dark:text-orange-300 uppercase">New Menu Item</div>

                {/* Title with Visual Hierarchy */}
                <div className="mb-7">
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-stone-100 mb-3">Add Menu Item</h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-normal leading-relaxed">Register a new menu item to your inventory</p>
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
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Name Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                        Item Name
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faBox} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="text"
                          name="itemName"
                          value={formData.itemName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="e.g., Chocolate Cake"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Price Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-600/50 dark:text-orange-400/50 font-bold">₱</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="199.99"
                          step="0.01"
                          min="0"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description Field - Full Width */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faFileAlt} className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 transition-all duration-200 resize-none"
                        rows={2}
                        placeholder="Describe the item's features, quality, origin, etc."
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Image Upload Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-stone-200 mb-2">
                      Item Image
                    </label>
                    <div className="space-y-3">
                      <div className="relative border-2 border-dashed border-stone-300 dark:border-neutral-600 rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={isLoading}
                        />
                        <div className="flex flex-col items-center justify-center py-4">
                          <FontAwesomeIcon icon={faImage} className="h-8 w-8 text-orange-600/60 dark:text-orange-400/60 mb-2" />
                          <p className="text-xs font-medium text-neutral-700 dark:text-stone-300">Click to upload or drag and drop</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>

                      {/* Image Preview */}
                      {formData.imagePreview && (
                        <div className="relative rounded-lg overflow-hidden border border-stone-200 dark:border-neutral-700 bg-stone-100 dark:bg-neutral-800">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                            className="absolute top-2 right-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800/40">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ All fields are required. Make sure the image represents the item well.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Adding...' : 'Add Item'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/staff/add-item')}
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

export default AddItem;
