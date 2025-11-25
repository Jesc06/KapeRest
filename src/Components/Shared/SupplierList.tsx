import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faTruck, faEdit, faTrash, faPlus, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from '../Staff/StaffSidebar';
import LogoutPanel from './LogoutPanel';
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

const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [messageText, setMessageText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Get userId from JWT token (cashierId)
  const getUserId = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      const payload: any = jwtDecode(token);
      // Extract userId from cashierId claim
      const userId = payload?.cashierId || 
                     payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                     payload?.uid || 
                     payload?.sub;
      
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

      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/Supplier/GetAllSuppliers?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.status}`);
      }

      const data: Supplier[] = await response.json();
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
  }, []);

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phoneNumber.includes(searchTerm) ||
    supplier.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Supplier</h1>
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
                    <FontAwesomeIcon icon={faTruck} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Supplier List</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Manage your suppliers and contacts</p>
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
                      placeholder="Search suppliers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                    />
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => navigate('/staff/add-supplier')}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-sm">Add Supplier</span>
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-neutral-600 dark:text-neutral-400">Loading suppliers...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faTruck} className="h-16 w-16 text-red-300 dark:text-red-700 mb-4" />
                      <p className="text-red-600 dark:text-red-400 text-lg font-medium">Error loading suppliers</p>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">{error}</p>
                    </div>
                  </div>
                ) : filteredSuppliers.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faTruck} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">No suppliers found</p>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Try adjusting your search</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-neutral-800 bg-orange-50/50 dark:bg-neutral-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Supplier Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Contact Person</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Phone Number</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                        {filteredSuppliers.map((supplier) => (
                          <tr
                            key={supplier.id}
                            className="hover:bg-orange-50/50 dark:hover:bg-neutral-800/30 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                                  <FontAwesomeIcon icon={faTruck} className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                  {supplier.supplierName}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-900 dark:text-white">{supplier.contactPerson}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">{supplier.phoneNumber}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">{supplier.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">{supplier.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(supplier.transactionDate)}</div>
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
                  </div>
                )}
              </div>

              {/* Summary Card */}
              {!isLoading && filteredSuppliers.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Suppliers</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{filteredSuppliers.length}</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Active Suppliers</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{filteredSuppliers.length}</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Recent Additions</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {filteredSuppliers.filter(s => {
                        const date = new Date(s.transactionDate);
                        const now = new Date();
                        const diffTime = Math.abs(now.getTime() - date.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 7;
                      }).length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Edit Supplier</h3>
                <button
                  onClick={() => setEditingSupplier(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Supplier Name</label>
                <input
                  type="text"
                  value={editingSupplier.supplierName}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, supplierName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Contact Person</label>
                <input
                  type="text"
                  value={editingSupplier.contactPerson}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={editingSupplier.phoneNumber}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editingSupplier.email}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Address</label>
                <textarea
                  value={editingSupplier.address}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  rows={3}
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
                onClick={() => setEditingSupplier(null)}
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
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Delete Supplier</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-neutral-700 dark:text-neutral-300 mb-6">
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

export default SupplierList;
