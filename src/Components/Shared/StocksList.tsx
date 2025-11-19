import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faBox, faEdit, faTrash, faPlus, faFilter, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
import LogoutPanel from './LogoutPanel';
import { API_BASE_URL } from '../../config/api';
import MessageBox from './MessageBox';

interface Stock {
  id?: number;
  productId?: number;
  productName: string;
  stocks: number;
  units: string;
  costPrice: number;
  transactionDate: string;
  supplierName: string;
  cashierId?: string;
  branchId?: number;
}

interface Cashier {
  id: string;
  userName: string;
  branchId: number;
  branchName: string;
  location: string;
}

interface Branch {
  id: number;
  branchName: string;
  location: string;
}

const StocksList: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'product' | 'supplier'>('all');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentUserCashierId, setCurrentUserCashierId] = useState<string | null>(null);
  const [currentUserBranchId, setCurrentUserBranchId] = useState<number | null>(null);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageText, setMessageText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  // Decode JWT token to get cashierId and branchId
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Decode JWT (split by . and decode the payload part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        console.log('Decoded JWT:', decoded);
        console.log('cashierId from JWT:', decoded.cashierId);
        console.log('branchId from JWT:', decoded.branchId);
        
        if (decoded.cashierId) {
          setCurrentUserCashierId(decoded.cashierId);
        }
        if (decoded.branchId) {
          const parsedBranchId = parseInt(decoded.branchId);
          console.log('Parsed branchId:', parsedBranchId);
          setCurrentUserBranchId(parsedBranchId);
        }
      } catch (err) {
        console.error('Error decoding JWT:', err);
      }
    }
  }, []);

  // Monitor branchId changes
  useEffect(() => {
    console.log('currentUserBranchId state updated to:', currentUserBranchId);
  }, [currentUserBranchId]);

  // Fetch cashiers and branches
  useEffect(() => {
    const fetchCashiersAndBranches = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Fetch cashiers
        const cashiersResponse = await fetch(`${API_BASE_URL}/RegisterPendingAccount/ExistingCashierAccount`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (cashiersResponse.ok) {
          const cashiersData = await cashiersResponse.json();
          console.log('Cashiers received:', cashiersData);
          setCashiers(cashiersData);
        }

        // Fetch branches
        const branchesResponse = await fetch(`${API_BASE_URL}/Branch/GetAllBranch`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (branchesResponse.ok) {
          const branchesData = await branchesResponse.json();
          console.log('Branches received:', branchesData);
          console.log('Current user branchId from JWT:', currentUserBranchId);
          setBranches(branchesData);
        }
      } catch (err) {
        console.error('Error fetching cashiers/branches:', err);
      }
    };

    fetchCashiersAndBranches();
  }, []);

  // Fetch stocks from API
  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      console.log('Stocks received:', data);
      console.log('First stock object keys:', data[0] ? Object.keys(data[0]) : 'No stocks');
      console.log('First stock full object:', data[0]);
      console.log('Sample stock cashierId:', data[0]?.cashierId);
      console.log('Sample stock branchId:', data[0]?.branchId);
      setStocks(data);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stocks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Filter stocks based on search and category
  const filteredStocks = stocks.filter(stock => {
    const searchLower = searchTerm.toLowerCase();
    
    if (filterCategory === 'product') {
      return stock.productName.toLowerCase().includes(searchLower);
    } else if (filterCategory === 'supplier') {
      return stock.supplierName.toLowerCase().includes(searchLower);
    } else {
      return (
        stock.productName.toLowerCase().includes(searchLower) ||
        stock.supplierName.toLowerCase().includes(searchLower)
      );
    }
  });

  const handleEdit = (stock: Stock) => {
    setEditingStock({ ...stock });
  };

  const handleSaveEdit = async () => {
    if (!editingStock) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/Inventory/UpdateProductOfSuppliers`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStock),
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      // Update local state
      const editingId = editingStock.productId || editingStock.id;
      setStocks(stocks.map(s => (s.productId || s.id) === editingId ? editingStock : s));
      setEditingStock(null);
      
      setMessageType('success');
      setMessageText('Stock updated successfully!');
      setShowMessageBox(true);
    } catch (err) {
      setMessageType('error');
      setMessageText('Failed to update stock. Please try again.');
      setShowMessageBox(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (stock: Stock) => {
    console.log('Delete clicked for stock:', stock);
    // Use productId if available, otherwise use id
    const stockId = stock.productId || stock.id;
    if (!stockId) {
      console.error('No valid ID found for stock:', stock);
      setMessageType('error');
      setMessageText('Cannot delete: Stock ID is missing.');
      setShowMessageBox(true);
      return;
    }
    setDeleteId(stockId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/Inventory/DeleteProductOfSuppliers/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        throw new Error('Failed to delete stock');
      }

      // Refresh the stock list from the database
      await fetchStocks();
      
      setShowDeleteConfirm(false);
      setDeleteId(null);
      
      setMessageType('success');
      setMessageText('Stock deleted successfully!');
      setShowMessageBox(true);
    } catch (err) {
      console.error('Delete error:', err);
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setMessageType('error');
      setMessageText('Failed to delete stock. Please try again.');
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

  const getCashierName = (cashierId?: string) => {
    // Use current user's cashierId from JWT
    const idToUse = cashierId || currentUserCashierId;
    if (!idToUse) return 'N/A';
    
    const cashier = cashiers.find(c => c.id === idToUse);
    return cashier?.userName || 'N/A';
  };

  const getBranchName = (branchId?: number) => {
    // Use current user's branchId from JWT
    const idToUse = branchId || currentUserBranchId;
    console.log('getBranchName - idToUse:', idToUse, 'branches:', branches.map(b => ({ id: b.id, name: b.branchName })));
    if (!idToUse) return 'N/A';
    
    const branch = branches.find(b => b.id === idToUse);
    console.log('getBranchName - found branch:', branch);
    return branch?.branchName || 'N/A';
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

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Stocks Inventory</h1>
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
                    <FontAwesomeIcon icon={faBox} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Stocks List</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your inventory and stock levels</p>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm" />
                    <input
                      type="text"
                      placeholder="Search stocks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative sm:w-48">
                    <FontAwesomeIcon icon={faFilter} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none z-10 text-sm" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as 'all' | 'product' | 'supplier')}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 transition-colors duration-200 appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      <option value="product">Product Name</option>
                      <option value="supplier">Supplier Name</option>
                    </select>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => navigate('/staff/add-stocks')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-sm">Add Stock</span>
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-neutral-600 dark:text-neutral-400">Loading stocks...</p>
                    </div>
                  </div>
                ) : filteredStocks.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faBox} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">No stocks found</p>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Try adjusting your search or filter</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-neutral-800 bg-orange-50/50 dark:bg-neutral-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Product Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Supplier</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Cashier</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Branch</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Stock Level</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Units</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Cost Price</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                        {filteredStocks.map((stock) => (
                          <tr key={stock.id} className="hover:bg-orange-50/30 dark:hover:bg-neutral-800/30 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                              {stock.productName}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {stock.supplierName}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {getCashierName(stock.cashierId)}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {getBranchName(stock.branchId)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                stock.stocks > 50 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : stock.stocks > 20
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {stock.stocks}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {stock.units}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                              ₱{stock.costPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {formatDate(stock.transactionDate)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(stock)}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 active:scale-95"
                                  title="Edit stock"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(stock)}
                                  className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 active:scale-95"
                                  title="Delete stock"
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
              {!isLoading && filteredStocks.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{filteredStocks.length}</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Stock Units</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {filteredStocks.reduce((sum, stock) => sum + stock.stocks, 0)}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ₱{filteredStocks.reduce((sum, stock) => sum + (stock.stocks * stock.costPrice), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Edit Stock</h3>
                <button
                  onClick={() => setEditingStock(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingStock.productName}
                  onChange={(e) => setEditingStock({ ...editingStock, productName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Stock Level</label>
                  <input
                    type="number"
                    value={editingStock.stocks}
                    onChange={(e) => setEditingStock({ ...editingStock, stocks: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Units</label>
                  <input
                    type="text"
                    value={editingStock.units}
                    onChange={(e) => setEditingStock({ ...editingStock, units: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingStock.costPrice}
                  onChange={(e) => setEditingStock({ ...editingStock, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={editingStock.supplierName}
                  onChange={(e) => setEditingStock({ ...editingStock, supplierName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
            
            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-b-2xl flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <button
                onClick={() => setEditingStock(null)}
                disabled={isSaving}
                className="px-4 py-2.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-medium rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTrash} className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Delete Stock</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
                Are you sure you want to delete this stock entry? All associated data will be permanently removed.
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
                  className="flex-1 px-4 py-2.5 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-medium rounded-lg transition-colors"
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
    </div>
  );
};

export default StocksList;
