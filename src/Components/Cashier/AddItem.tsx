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
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-900 via-orange-900/20 to-stone-900">
      

      <div aria-hidden className="absolute inset-0 z-0 bg-stone-50/90 backdrop-blur-xl dark:bg-neutral-900/60 pointer-events-none" />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen w-full flex-col bg-stone-100 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
          {/* Top Bar - Minimal Header */}
          <div className="sticky top-0 z-20 border-b border-orange-300/30 bg-stone-100/90 dark:border-orange-700/20 dark:bg-stone-800/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md border border-orange-400/40 bg-orange-50/60 hover:bg-orange-100/60 text-orange-700 dark:border-orange-600/30 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-400 transition-all duration-200"
                >
                  <FontAwesomeIcon icon={faBars} className="h-3.5 w-3.5" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-md border border-orange-400/40 bg-orange-50/60 hover:bg-orange-100/60 dark:border-orange-600/30 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-3.5 w-3.5" />
                </button>

                {/* Title */}
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900 dark:text-orange-100 truncate">Add MenuItem</h1>
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
              <div className="relative rounded-2xl border border-orange-200/40 dark:border-orange-700/30 bg-stone-50/95 dark:bg-stone-800/50 p-6 sm:p-7 shadow-md transition-all duration-300 ease-out">
                {/* Label Tag - Visual Hierarchy */}
                <div className="absolute -top-3 left-6 inline-flex h-6 items-center rounded-full border border-orange-300/50 bg-orange-50 dark:bg-orange-950/60 px-3 text-[10px] font-semibold tracking-wider text-orange-700 dark:text-orange-300">NEW MENUITEM</div>

                {/* Title with Visual Hierarchy */}
                <div className="mb-5">
                  <h2 className="text-3xl sm:text-4xl font-bold text-orange-900 dark:text-orange-50">Add MenuItem</h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-orange-700/70 dark:text-orange-300/70 font-normal">Register a new menu item to your inventory</p>
                </div>

                {/* Divider - Subtle */}
                <div className="h-px w-full bg-orange-200/20 dark:bg-orange-700/15 mb-5" aria-hidden />

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3.5 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">⚠ {error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3.5 bg-green-50/80 dark:bg-green-900/20 border border-green-200/50 dark:border-green-800/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">✓ {success}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Name Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                        Item Name
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon icon={faBox} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                        <input
                          type="text"
                          name="itemName"
                          value={formData.itemName}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200"
                          placeholder="e.g., Chocolate Cake"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Price Field */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                        Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-600/50 dark:text-orange-400/50 font-bold">₱</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200"
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
                    <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                      Description
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faFileAlt} className="absolute left-3.5 top-3.5 h-4 w-4 text-orange-600/50 dark:text-orange-400/50 pointer-events-none" />
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 text-sm sm:text-base rounded-lg border border-stone-300/40 dark:border-stone-700/40 bg-white dark:bg-stone-900/50 text-orange-900 dark:text-orange-50 placeholder-stone-400/60 dark:placeholder-stone-600/60 focus:outline-none focus:border-orange-400/60 focus:ring-1 focus:ring-orange-400/30 dark:focus:border-orange-400/40 dark:focus:ring-orange-400/20 transition-all duration-200 resize-none"
                        rows={2}
                        placeholder="Describe the item's features, quality, origin, etc."
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Image Upload Field */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-orange-900 dark:text-orange-200 mb-2">
                      Item Image
                    </label>
                    <div className="space-y-3">
                      <div className="relative border-2 border-dashed border-orange-300/40 dark:border-orange-700/40 rounded-lg p-4 hover:border-orange-400/60 dark:hover:border-orange-400/60 transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={isLoading}
                        />
                        <div className="flex flex-col items-center justify-center py-4">
                          <FontAwesomeIcon icon={faImage} className="h-8 w-8 text-orange-600/60 dark:text-orange-400/60 mb-2" />
                          <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Click to upload or drag and drop</p>
                          <p className="text-xs text-orange-600/60 dark:text-orange-400/60">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>

                      {/* Image Preview */}
                      {formData.imagePreview && (
                        <div className="relative rounded-lg overflow-hidden border border-orange-200/40 dark:border-orange-700/30 bg-stone-100 dark:bg-stone-900/30">
                          <img
                            src={formData.imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                            className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50/60 dark:bg-blue-900/10 rounded-lg p-2.5 border border-blue-200/30 dark:border-blue-800/20">
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                      ℹ️ All fields are required. Make sure the image represents the item well.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:shadow-none active:scale-95 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Adding...' : 'Add Item'}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/staff/add-item')}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-stone-200/70 dark:bg-stone-700/40 hover:bg-stone-300/70 dark:hover:bg-stone-700/60 disabled:bg-stone-100 dark:disabled:bg-stone-800/20 text-orange-900 dark:text-orange-100 text-sm sm:text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 disabled:cursor-not-allowed"
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
