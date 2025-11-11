import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faChevronLeft, 
  faChevronRight, 
  faBox, 
  faTag, 
  faFileAlt, 
  faImage,
  faCheckCircle,
  faExclamationCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
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
        navigate('/staff');
      }, 2000);
    } catch (err) {
      setError('Failed to add item. Please try again.');
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
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-64' : 'lg:ml-16'}`}>
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-neutral-800/50 bg-white/80 dark:bg-neutral-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
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
                  className="hidden lg:flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={sidebarExpanded ? faChevronLeft : faChevronRight} className="h-4 w-4" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Add Menu Item</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full max-w-4xl mx-auto">
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

              <form onSubmit={handleSubmit} className="space-y-6 bg-white/70 dark:bg-neutral-900/70 p-6 sm:p-8 rounded-3xl border border-orange-100/50 dark:border-neutral-800/50 shadow-2xl shadow-orange-500/5 backdrop-blur-xl">
                
                {/* Item Name - Floating Label */}
                <div className="relative group">
                  <input
                    type="text"
                    name="itemName"
                    id="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10 hover:border-orange-300 dark:hover:border-orange-600"
                    placeholder="Item Name"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="itemName"
                    className={`absolute left-4 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                      ${formData.itemName ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    <FontAwesomeIcon icon={faBox} className="mr-1.5" />
                    Item Name <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Price - Floating Label */}
                <div className="relative group">
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10 hover:border-orange-300 dark:hover:border-orange-600"
                    placeholder="Price"
                    step="0.01"
                    min="0"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="price"
                    className={`absolute left-4 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                      ${formData.price ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    <FontAwesomeIcon icon={faTag} className="mr-1.5" />
                    Price (₱) <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Description - Floating Label */}
                <div className="relative group">
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 pt-6 pb-2.5 text-base rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-transparent focus:outline-none peer border-neutral-200 dark:border-neutral-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:focus:border-orange-400 dark:focus:ring-orange-400/10 hover:border-orange-300 dark:hover:border-orange-600 resize-none"
                    rows={4}
                    placeholder="Description"
                    disabled={isLoading}
                  />
                  <label 
                    htmlFor="description"
                    className={`absolute left-4 top-4 text-neutral-500 dark:text-neutral-400 transition-all duration-200 pointer-events-none
                      peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                      peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-orange-600 dark:peer-focus:text-orange-400
                      ${formData.description ? 'top-1.5 text-xs text-orange-600 dark:text-orange-400' : ''}`}
                  >
                    <FontAwesomeIcon icon={faFileAlt} className="mr-1.5" />
                    Description <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    <FontAwesomeIcon icon={faImage} className="mr-1.5 text-orange-600 dark:text-orange-400" />
                    Item Image <span className="text-red-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-2xl p-6 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isLoading}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                        <FontAwesomeIcon icon={faImage} className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">Click to upload or drag and drop</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>

                  {formData.imagePreview && (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-neutral-900 shadow-lg animate-in fade-in zoom-in duration-300">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <div className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                          ✓ Uploaded
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: null, imagePreview: null }))}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-neutral-400 disabled:to-neutral-400 text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 disabled:shadow-none active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                  >
                    {isLoading ? (
                      <>
                        <span className="inline-block h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Adding Item...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Add Item</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/staff')}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:bg-neutral-50 dark:disabled:bg-neutral-900 text-neutral-900 dark:text-white text-base font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-3 group border-2 border-neutral-200 dark:border-neutral-700"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Cancel</span>
                  </button>
                </div>

                {/* Helper Text */}
                <div className="text-left pt-2">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
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
