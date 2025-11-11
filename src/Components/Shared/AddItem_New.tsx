import React, { useState } from 'react';
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
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
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
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Create a new menu item for your store</p>
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
              <form onSubmit={handleSubmit} className="space-y-8 bg-white/80 dark:bg-neutral-900/80 p-8 sm:p-10 rounded-3xl border-2 border-orange-100/80 dark:border-neutral-800/80 shadow-2xl shadow-orange-500/10 backdrop-blur-xl">
                
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
                          formData.itemName ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'
                        }`} />
                      </div>
                    </div>
                    <input
                      type="text"
                      name="itemName"
                      id="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter item name (e.g., Iced Latte)"
                      disabled={isLoading}
                    />
                    <label 
                      htmlFor="itemName"
                      className="absolute -top-2.5 left-14 px-2 bg-white dark:bg-neutral-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
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
                            formData.price ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'
                          }`} />
                        </div>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="price"
                        className="absolute -top-2.5 left-14 px-2 bg-white dark:bg-neutral-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Price (₱) <span className="text-red-500">*</span>
                      </label>
                      {formData.price && parseFloat(formData.price) > 0 && (
                        <div className="absolute right-4 top-4 text-sm font-bold text-orange-600 dark:text-orange-400">
                          ₱{parseFloat(formData.price).toFixed(2)}
                        </div>
                      )}
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
                            formData.description ? 'text-white' : 'text-neutral-400 dark:text-neutral-500'
                          }`} />
                        </div>
                      </div>
                      <textarea
                        name="description"
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-16 pr-5 py-4 text-base font-medium rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 dark:focus:border-orange-400 dark:focus:ring-orange-400/20 hover:border-orange-300 dark:hover:border-orange-600 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                        rows={4}
                        maxLength={200}
                        placeholder="Describe your item (e.g., Rich espresso with steamed milk and ice)"
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="description"
                        className="absolute -top-2.5 left-14 px-2 bg-white dark:bg-neutral-900 text-xs font-semibold text-orange-600 dark:text-orange-400"
                      >
                        Description <span className="text-red-500">*</span>
                      </label>
                      <div className="absolute bottom-3 right-4 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                        {formData.description.length}/200
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      <FontAwesomeIcon icon={faImage} className="text-orange-600 dark:text-orange-400" />
                      Item Image <span className="text-neutral-400 dark:text-neutral-500 font-normal">(Optional)</span>
                    </label>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      Max 5MB
                    </span>
                  </div>
                  
                  {!formData.imagePreview ? (
                    <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-2xl p-8 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-gradient-to-br hover:from-orange-50/50 hover:to-amber-50/30 dark:hover:from-orange-950/30 dark:hover:to-amber-950/20 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-900">
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
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <div className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold rounded-xl group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
                          Choose File
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-neutral-900 shadow-xl shadow-orange-500/20 animate-in fade-in zoom-in-95 duration-300">
                      <div className="aspect-video w-full bg-neutral-100 dark:bg-neutral-800">
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
                    className="flex-1 px-8 py-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 text-neutral-900 dark:text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group border-2 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Helper Text */}
                <div className="flex items-center justify-between pt-4 text-xs">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    <span className="text-red-500 font-semibold">*</span> Required fields
                  </p>
                  <p className="text-neutral-400 dark:text-neutral-500">
                    All data will be saved securely
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
