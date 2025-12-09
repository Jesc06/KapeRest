import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faTruck, faEdit, faTrash, faPlus, faTimes, faSave, faCoffee, faBoxes, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
import LogoutPanel from './LogoutPanel';
import AddSupplier from './AddSupplier';
import { API_BASE_URL } from '../../config/api';
import MessageBox from './MessageBox';
import { jwtDecode } from 'jwt-decode';

interface Supplier {
  id: number;
  supplierName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  transactionDate: string;
}

interface Stock {
  id: number;
  productName: string;
  supplierName: string;
  stocks: number;
  units: string;
  costPrice: number;
  transactionDate: string;
  cashierId: string;
  branchId: number;
}

interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  movementType: string; // "Stock In" or "Stock Out"
  quantity: number;
  unitPrice: number;
  reason: string;
  transactionDate: string;
  userId: string;
  branchId: number;
}

interface MenuItem {
  id: number;
  itemName: string;
  category: string;
  price: number;
  isAvailable: string;
  menuItemProducts: MenuItemProduct[];
}

interface MenuItemProduct {
  productOfSupplierId: number;
  productName: string;
  quantityUsed: number;
}

const SupplierList: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageText, setMessageText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'suppliers' | 'stocks' | 'menuItems'>('suppliers');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'Stock In' | 'Stock Out'>('all');

  // Get userId from JWT token (cashierId)
  const getUserId = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      const payload: any = jwtDecode(token);
      console.log('SupplierList - Decoded JWT:', payload);
      
      // Extract userId from various possible claims
      const userId = payload?.cashierId || 
                     payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                     payload?.uid || 
                     payload?.sub;
      
      console.log('SupplierList - Extracted userId:', userId);
      return userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch suppliers from API
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const userId = getUserId();

      console.log('SupplierList - userId for fetch:', userId);

      if (!userId) {
        console.error('SupplierList - No userId found');
        throw new Error('User ID not found. Please login again.');
      }

      const url = `${API_BASE_URL}/Supplier/GetAllSuppliers?userId=${userId}`;
      console.log('SupplierList - Fetching from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('SupplierList - Response status:', response.status);
      console.log('SupplierList - Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SupplierList - API Error:', errorText);
        throw new Error(`Failed to fetch suppliers: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('SupplierList - Raw response:', responseText);

      const data: Supplier[] = responseText ? JSON.parse(responseText) : [];
      console.log('SupplierList - Parsed suppliers:', data);
      console.log('SupplierList - Number of suppliers:', data.length);
      
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchStocks();
    fetchStockMovements();
    fetchMenuItems();
  }, []);

  // Fetch stocks from API
  const fetchStocks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/Inventory/GetAllProducts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.status}`);
      }

      const data: Stock[] = await response.json();
      setStocks(data);
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  };

  // Fetch stock movements from API
  const fetchStockMovements = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/Inventory/GetStockMovements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stock movements: ${response.status}`);
      }

      const data: StockMovement[] = await response.json();
      setStockMovements(data);
    } catch (err) {
      console.error('Error fetching stock movements:', err);
    }
  };

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/MenuItem/GetAllMenuItems`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch menu items: ${response.status}`);
      }

      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  // Filter suppliers based on search term and date range
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phoneNumber.includes(searchTerm) ||
      supplier.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date range filtering
    let matchesDateRange = true;
    if (startDate || endDate) {
      const supplierDate = new Date(supplier.transactionDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && supplierDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && supplierDate <= end;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  // Filter stock movements based on search term and date range
  // Filter stock movements based on search term, movement type, and date range
  const filteredStockMovements = stockMovements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.movementType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMovementType = movementTypeFilter === 'all' || movement.movementType === movementTypeFilter;
    
    let matchesDateRange = true;
    if (startDate || endDate) {
      const movementDate = new Date(movement.transactionDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && movementDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && movementDate <= end;
      }
    }
    
    return matchesSearch && matchesMovementType && matchesDateRange;
  });

  // Filter menu items based on search term
  const filteredMenuItems = menuItems.filter(item => {
    return item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier({ ...supplier });
  };

  const handleSaveEdit = async () => {
    if (!editingSupplier) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const userId = getUserId();

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/Supplier/UpdateSupplier?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSupplier),
      });

      if (!response.ok) {
        throw new Error('Failed to update supplier');
      }

      // Update local state
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier : s));
      setEditingSupplier(null);
      
      setMessageType('success');
      setMessageText('Supplier updated successfully!');
      setShowMessageBox(true);
    } catch (err) {
      setMessageType('error');
      setMessageText(err instanceof Error ? err.message : 'Failed to update supplier. Please try again.');
      setShowMessageBox(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (supplierId: number) => {
    setDeleteId(supplierId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const userId = getUserId();

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
      
      // First, check if this supplier has associated stocks
      const stocksResponse = await fetch(`${API_BASE_URL}/Inventory/GetAllProducts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (stocksResponse.ok) {
        const stocks = await stocksResponse.json();
        const supplierToDelete = suppliers.find(s => s.id === deleteId);
        
        // Check if any stock is linked to this supplier
        const hasLinkedStocks = stocks.some((stock: any) => 
          stock.supplierName === supplierToDelete?.supplierName
        );

        if (hasLinkedStocks) {
          setShowDeleteConfirm(false);
          setDeleteId(null);
          setMessageType('error');
          setMessageText('Cannot delete supplier: There are stock items linked to this supplier. Please remove or reassign the stocks first.');
          setShowMessageBox(true);
          return;
        }
      }

      // Proceed with deletion if no linked stocks
      const response = await fetch(`${API_BASE_URL}/Supplier/DeleteSupplier/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete supplier');
      }

      // Refresh the supplier list from the database
      await fetchSuppliers();
      
      setShowDeleteConfirm(false);
      setDeleteId(null);
      
      setMessageType('success');
      setMessageText('Supplier deleted successfully!');
      setShowMessageBox(true);
    } catch (err) {
      console.error('Delete error:', err);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setMessageType('error');
      setMessageText(err instanceof Error ? err.message : 'Failed to delete supplier. Please try again.');
      setShowMessageBox(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 dark:bg-stone-900">
      <div className="flex h-screen overflow-hidden">
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header */}
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
                      <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Suppliers</h1>
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Manage supplier contacts</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          {filteredSuppliers.length} found
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

              {/* Date Range Filters - Always visible for all tabs */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Movement Type Filter - Only for Stock Movements */}
                {activeTab === 'stocks' && (
                  <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">Type:</label>
                    <select
                      value={movementTypeFilter}
                      onChange={(e) => setMovementTypeFilter(e.target.value as 'all' | 'Stock In' | 'Stock Out')}
                      className="bg-transparent text-sm font-medium text-stone-900 dark:text-white focus:outline-none cursor-pointer pr-6"
                    >
                      <option value="all" className="bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white">All Movements</option>
                      <option value="Stock In" className="bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white">Stock In Only</option>
                      <option value="Stock Out" className="bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white">Stock Out Only</option>
                    </select>
                  </div>
                )}
                
                {/* Date Range Pickers - Available for all tabs */}
                <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-sm text-stone-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-sm text-stone-900 dark:text-white focus:outline-none"
                  />
                </div>
                
                {/* Clear Filters Button */}
                {(startDate || endDate || (activeTab === 'stocks' && movementTypeFilter !== 'all')) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setMovementTypeFilter('all');
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    activeTab === 'suppliers'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faTruck} className="h-4 w-4" />
                  <span>Suppliers</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'suppliers'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-300'
                  }`}>
                    {filteredSuppliers.length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('stocks')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    activeTab === 'stocks'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faBoxes} className="h-4 w-4" />
                  <span>Stock Movements</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'stocks'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-300'
                  }`}>
                    {filteredStockMovements.length}
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('menuItems')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    activeTab === 'menuItems'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  <FontAwesomeIcon icon={faCoffee} className="h-4 w-4" />
                  <span>Menu Items Stock</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'menuItems'
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-300'
                  }`}>
                    {filteredMenuItems.length}
                  </span>
                </button>
              </div>

              {/* Table Section */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-800 dark:via-orange-950/20 dark:to-stone-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon 
                            icon={activeTab === 'suppliers' ? faTruck : activeTab === 'stocks' ? faBoxes : faCoffee} 
                            className="h-7 w-7 text-white" 
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                            {activeTab === 'suppliers' ? 'Supplier Directory' : 
                             activeTab === 'stocks' ? 'Stock Movements' : 
                             'Menu Items Stock Usage'}
                          </h3>
                          <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mt-0.5">
                            {activeTab === 'suppliers' ? 'Complete supplier list' : 
                             activeTab === 'stocks' ? 'Track stock in and stock out' : 
                             'Products used in menu items'}
                          </p>
                        </div>
                      </div>
                      
                      {activeTab === 'suppliers' && (
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="relative flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
                          <FontAwesomeIcon icon={faPlus} className="relative h-4 w-4" />
                          <span className="relative text-sm">Add Supplier</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-stone-600 dark:text-stone-400">Loading data...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faTruck} className="h-16 w-16 text-red-300 dark:text-red-700 mb-4" />
                        <p className="text-red-600 dark:text-red-400 text-lg font-medium">Error loading data</p>
                        <p className="text-neutral-500 dark:text-stone-500 text-sm mt-2">{error}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Suppliers Table */}
                      {activeTab === 'suppliers' && (
                        filteredSuppliers.length === 0 ? (
                          <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                              <FontAwesomeIcon icon={faTruck} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                              <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">No suppliers found</p>
                              <p className="text-neutral-500 dark:text-stone-500 text-sm mt-2">Try adjusting your search</p>
                            </div>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-orange-100 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-800/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Supplier Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Contact Person</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Phone Number</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                              {filteredSuppliers.map((supplier) => (
                                <tr
                                  key={supplier.id}
                                  className="hover:bg-orange-50/50 dark:hover:bg-stone-800/30 transition-colors duration-150"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                                        <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                      </div>
                                      <div className="text-sm font-semibold text-stone-900 dark:text-white">
                                        {supplier.supplierName}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-stone-900 dark:text-white">{supplier.contactPerson}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-stone-600 dark:text-stone-400">{supplier.phoneNumber}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-stone-600 dark:text-stone-400">{supplier.email}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-stone-600 dark:text-stone-400">{supplier.address}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-stone-600 dark:text-stone-400">{formatDate(supplier.transactionDate)}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => handleEdit(supplier)}
                                        className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 active:scale-95"
                                        title="Edit supplier"
                                      >
                                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteClick(supplier.id)}
                                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 active:scale-95"
                                        title="Delete supplier"
                                      >
                                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )
                      )}

                      {/* Stock Movements Table */}
                      {activeTab === 'stocks' && (
                        filteredStockMovements.length === 0 ? (
                          <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                              <FontAwesomeIcon icon={faBoxes} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                              <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">No stock movements found</p>
                              <p className="text-neutral-500 dark:text-stone-500 text-sm mt-2">Try adjusting your search</p>
                            </div>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-orange-100 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-800/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Product Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Movement Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Unit Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Total Value</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                              {filteredStockMovements.map((movement) => {
                                const isStockIn = movement.movementType === "Stock In";
                                const totalValue = movement.quantity * movement.unitPrice;
                                return (
                                  <tr
                                    key={movement.id}
                                    className="hover:bg-orange-50/50 dark:hover:bg-stone-800/30 transition-colors duration-150"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                                          <FontAwesomeIcon icon={faBoxes} className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="text-sm font-semibold text-stone-900 dark:text-white">
                                          {movement.productName}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                                        isStockIn 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                      }`}>
                                        <FontAwesomeIcon 
                                          icon={isStockIn ? faArrowUp : faArrowDown} 
                                          className="h-3 w-3" 
                                        />
                                        {movement.movementType}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`text-sm font-bold ${
                                        isStockIn 
                                          ? 'text-green-600 dark:text-green-400' 
                                          : 'text-red-600 dark:text-red-400'
                                      }`}>
                                        {isStockIn ? '+' : '-'}{movement.quantity}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-stone-900 dark:text-white">₱{movement.unitPrice.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-bold text-orange-600 dark:text-orange-400">₱{totalValue.toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                        {movement.reason}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-stone-600 dark:text-stone-400">{formatDate(movement.transactionDate)}</div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )
                      )}

                      {/* Menu Items Stock Usage Table */}
                      {activeTab === 'menuItems' && (
                        filteredMenuItems.length === 0 ? (
                          <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                              <FontAwesomeIcon icon={faCoffee} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                              <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">No menu items found</p>
                              <p className="text-neutral-500 dark:text-stone-500 text-sm mt-2">Try adjusting your search</p>
                            </div>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-orange-100 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-800/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Menu Item</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Products Used</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Availability</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                              {filteredMenuItems.map((item) => (
                                <tr
                                  key={item.id}
                                  className="hover:bg-orange-50/50 dark:hover:bg-stone-800/30 transition-colors duration-150"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                                        <FontAwesomeIcon icon={faCoffee} className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                      </div>
                                      <div className="text-sm font-semibold text-stone-900 dark:text-white">
                                        {item.itemName}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-orange-600 dark:text-orange-400">₱{item.price.toFixed(2)}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1">
                                      {item.menuItemProducts && item.menuItemProducts.length > 0 ? (
                                        item.menuItemProducts.map((product, index) => (
                                          <div key={index} className="flex items-center gap-2 text-xs">
                                            <span className="font-medium text-stone-900 dark:text-white">{product.productName || `Product #${product.productOfSupplierId}`}</span>
                                            <span className="text-stone-500 dark:text-stone-400">×{product.quantityUsed}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-xs text-stone-500 dark:text-stone-400 italic">No products linked</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                      item.isAvailable === 'Available' 
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                    }`}>
                                      <div className={`h-2 w-2 rounded-full ${
                                        item.isAvailable === 'Available' ? 'bg-green-600' : 'bg-red-600 animate-pulse'
                                      }`}></div>
                                      {item.isAvailable}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                  <FontAwesomeIcon icon={faTruck} className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">Edit Supplier</h2>
                  <p className="text-sm text-stone-600 dark:text-stone-400">Update supplier information</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSupplier(null)}
                className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Supplier Name</label>
                  <input
                    type="text"
                    value={editingSupplier.supplierName}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, supplierName: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Enter supplier name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={editingSupplier.contactPerson}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={editingSupplier.phoneNumber}
                      onChange={(e) => setEditingSupplier({ ...editingSupplier, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingSupplier.email}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-stone-700 dark:text-stone-300 mb-2">Address</label>
                  <textarea
                    value={editingSupplier.address}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Full address"
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="sticky bottom-0 px-6 py-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-700 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTrash} className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Delete Supplier</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-stone-700 dark:text-stone-300 mb-6">
                Are you sure you want to delete this supplier? All associated data will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MessageBox */}
      {showMessageBox && (
        <MessageBox
          isOpen={showMessageBox}
          type={messageType}
          title={messageType === 'success' ? 'Success' : 'Error'}
          message={messageText}
          onClose={() => setShowMessageBox(false)}
        />
      )}

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <AddSupplier
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchSuppliers(); // Refresh the list
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SupplierList;
