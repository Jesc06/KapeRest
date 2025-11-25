import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faCoffee, faEdit, faTrash, faPlus, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
import LogoutPanel from './LogoutPanel';
import UpdateItem from './UpdateItem';
import { API_BASE_URL } from '../../config/api';

interface Item {
  id: number;
  itemName: string;
  price: number;
  category?: string;
  description: string;
  isAvailable: string;
  image: string;
}

const ItemList: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
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
          setIsLoading(false);
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

        const data: Item[] = await response.json();
        setItems(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.price.toString().includes(searchTerm)
  );

  const handleEdit = (itemId: number) => {
    setSelectedItemId(itemId);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    // Refresh the items list after successful update
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const cashierId = decoded.cashierId;

        if (!cashierId) {
          console.error('Cashier ID not found in token');
          setIsLoading(false);
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

        const data: Item[] = await response.json();
        setItems(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setIsLoading(false);
      }
    };

    fetchItems();
  };

  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

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

      const response = await fetch(`${API_BASE_URL}/MenuItem/DeleteMenuItem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cashierId: cashierId,
          id: itemId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete item: ${errorText}`);
      }

      const result = await response.text();
      if (result.includes('Successfully deleted')) {
        // Remove from local state
        setItems(items.filter(i => i.id !== itemId));
        alert('Item deleted successfully');
      } else {
        alert(result); // Show the error message from backend
      }
    } catch (err) {
      console.error('Error deleting menu item:', err);
      alert('Failed to delete item. Please try again.');
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

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Header */}
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
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Menu</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
            <div className="w-full">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25">
                    <FontAwesomeIcon icon={faCoffee} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Menu Items List</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your menu items and availability</p>
                  </div>
                </div>
              </div>

              {/* Search and Add Section */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm" />
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => navigate('/staff/add-item')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-sm">Add Item</span>
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-neutral-600 dark:text-neutral-400">Loading menu items...</p>
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faCoffee} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">No menu items found</p>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Try adjusting your search</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-neutral-800 bg-orange-50/50 dark:bg-neutral-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Item Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Availability</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                        {filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-orange-50/50 dark:hover:bg-neutral-800/30 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`}
                                  alt={item.itemName}
                                  className="w-10 h-10 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 mr-3"
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder.jpg'; // Fallback image
                                  }}
                                />
                                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {item.itemName}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                ₱{item.price.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                                {item.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {item.isAvailable === "Available" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                                  Available
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                  <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3" />
                                  Out of Stock
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(item.id)}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 active:scale-95"
                                  title="Edit item"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 active:scale-95"
                                  title="Delete item"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary Card */}
              {!isLoading && filteredItems.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{filteredItems.length}</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Available Items</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {filteredItems.filter(item => item.isAvailable === "Available").length}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Unavailable Items</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {filteredItems.filter(item => item.isAvailable !== "Available").length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Update Item Modal */}
        {isUpdateModalOpen && selectedItemId && (
          <UpdateItem
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedItemId(null);
            }}
            itemId={selectedItemId}
            onSuccess={handleUpdateSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default ItemList;
