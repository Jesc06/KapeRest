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
  const [selectedAvailability, setSelectedAvailability] = useState('all');

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

  // Filter items based on search term and availability
  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.price.toString().includes(searchTerm);
    
    const matchesAvailability = selectedAvailability === 'all' || 
      (selectedAvailability === 'available' && item.isAvailable === 'Available') ||
      (selectedAvailability === 'unavailable' && item.isAvailable !== 'Available');
    
    return matchesSearch && matchesAvailability;
  });

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

      const response = await fetch(`${API_BASE_URL}/MenuItem/DeleteMenuItem?cashierId=${encodeURIComponent(cashierId)}&id=${encodeURIComponent(itemId.toString())}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
    <div className="min-h-screen w-full bg-stone-50 dark:bg-stone-900">
      <div className="flex h-screen overflow-hidden">
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header with Glass Morphism */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-stone-50/90 dark:bg-stone-900/95 border-b border-stone-200/50 dark:border-stone-700/50 shadow-lg shadow-black/5">
            <div className="px-4 sm:px-6 md:px-8 py-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div className="hidden sm:flex items-center gap-3">
                    <div>
                      <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Menu Items</h1>
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Manage your menu catalog</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          {filteredItems.length} found
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <LogoutPanel />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 overflow-auto">

              {/* Availability Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedAvailability('all')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedAvailability === 'all'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setSelectedAvailability('available')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedAvailability === 'available'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-green-500 dark:hover:border-green-500'
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => setSelectedAvailability('unavailable')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    selectedAvailability === 'unavailable'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-red-500 dark:hover:border-red-500'
                  }`}
                >
                  Out of Stock
                </button>
              </div>

              {/* Premium Stats Cards */}
              {!isLoading && filteredItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Total Items Card */}
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                          <FontAwesomeIcon icon={faCoffee} className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-stone-50 animate-pulse"></div>
                          <span className="text-xs font-bold text-white">Live</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Items</p>
                        <p className="text-4xl font-black text-white">{filteredItems.length}</p>
                        <p className="text-xs font-medium text-white/70">menu items</p>
                      </div>
                    </div>
                  </div>

                  {/* Available Items Card */}
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-6 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                          <FontAwesomeIcon icon={faCheckCircle} className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Available Items</p>
                        <p className="text-4xl font-black text-white">{filteredItems.filter(item => item.isAvailable === "Available").length}</p>
                        <p className="text-xs font-medium text-white/70">ready to order</p>
                      </div>
                    </div>
                  </div>

                  {/* Unavailable Items Card */}
                  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 p-6 shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:-translate-y-2">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                          <FontAwesomeIcon icon={faTimesCircle} className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-white/80">Unavailable Items</p>
                        <p className="text-4xl font-black text-white">{filteredItems.filter(item => item.isAvailable !== "Available").length}</p>
                        <p className="text-xs font-medium text-white/70">out of stock</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Section */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-stone-700">
                {/* Table Header */}
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-800 dark:via-orange-950/20 dark:to-stone-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faCoffee} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Menu Catalog</h3>
                          <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mt-0.5">Complete item inventory</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate('/staff/add-item')}
                          className="relative flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
                          <FontAwesomeIcon icon={faPlus} className="relative h-4 w-4" />
                          <span className="relative text-sm">Add Item</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
                        <div className="relative h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 font-medium text-lg">Loading menu items...</p>
                    </div>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-2xl"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center">
                          <FontAwesomeIcon icon={faCoffee} className="h-10 w-10 text-orange-500 dark:text-orange-400" />
                        </div>
                      </div>
                      <p className="text-stone-600 dark:text-stone-400 text-xl font-bold mb-2">No menu items found</p>
                      <p className="text-neutral-500 dark:text-stone-500 text-sm">Try adjusting your search or add a new item</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-orange-200/60 dark:border-stone-700 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-stone-800/50 dark:via-stone-700/50 dark:to-stone-800/50">
                          <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Item Name</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-center text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Availability</th>
                          <th className="px-6 py-4 text-center text-xs font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100/50 dark:divide-neutral-800/50">
                        {filteredItems.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-amber-50/30 hover:to-orange-50/50 dark:hover:from-stone-800/40 dark:hover:via-stone-700/30 dark:hover:to-stone-800/40 transition-all duration-300"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="relative group/img">
                                  <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur-md opacity-0 group-hover/img:opacity-100 transition-opacity duration-300"></div>
                                  <img
                                    src={item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`}
                                    alt={item.itemName}
                                    className="relative w-12 h-12 object-cover rounded-xl border-2 border-orange-200 dark:border-stone-700 shadow-lg"
                                    onError={(e) => {
                                      e.currentTarget.src = '/images/placeholder.jpg';
                                    }}
                                  />
                                </div>
                                <div className="text-sm font-bold text-stone-900 dark:text-white">
                                  {item.itemName}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-black bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                                ₱{item.price.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-stone-600 dark:text-stone-400 max-w-xs truncate">
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
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={() => handleEdit(item.id)}
                                  className="relative p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg group"
                                  title="Edit item"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="relative p-2.5 bg-gradient-to-br from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 dark:from-red-900/30 dark:to-rose-900/30 dark:hover:from-red-900/50 dark:hover:to-rose-900/50 text-red-600 dark:text-red-400 rounded-xl transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg group"
                                  title="Delete item"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4 group-hover:scale-110 transition-transform" />
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
