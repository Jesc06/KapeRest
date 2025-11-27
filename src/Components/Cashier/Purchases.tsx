import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faFilter, faReceipt, faCalendar, faPercentage, faBan, faTimes } from '@fortawesome/free-solid-svg-icons';
import Sidebar from './Sidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface Purchase {
  id: number;
  receiptNumber: string;
  menuItemName: string;
  dateTime: string;
  cashierId: string;
  branchId: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: string;
  salesItems: any[];
}

const Purchases: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [submittingVoid, setSubmittingVoid] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Decode JWT token to extract cashierId
      const payload = JSON.parse(atob(token.split('.')[1]));
      const cashierId = payload.cashierId || payload.uid;
      const branchId = payload.branchId;
      console.log('Decoded token payload:', payload);
      console.log('Using cashierId:', cashierId, 'branchId:', branchId);

      if (!cashierId) {
        console.error('No cashier ID found in token');
        return;
      }

      const apiUrl = `${API_BASE_URL}/Purchases/SalesPurchases?cashierId=${cashierId}&branchId=${branchId}`;
      console.log('Fetching from URL:', apiUrl);
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        let purchasesData = [];
        if (Array.isArray(data)) {
          purchasesData = data;
        } else if (data && Array.isArray(data.data)) {
          purchasesData = data.data;
        } else if (data && typeof data === 'object') {
          purchasesData = [data];
        }
        setPurchases(purchasesData);
      } else {
        console.error('Failed to fetch purchases:', response.statusText, response.status);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique statuses
  const statuses = ['All', ...Array.from(new Set(purchases.map(p => p.status)))];

  // Filter purchases based on search and status
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      (purchase.menuItemName && purchase.menuItemName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      purchase.id.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelled':
      case 'voided':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pendingvoid':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  // Handle request void
  const handleRequestVoid = (saleId: number) => {
    setSelectedSaleId(saleId);
    setVoidReason('');
    setShowVoidModal(true);
  };

  // Submit void request
  const submitVoidRequest = async () => {
    if (!voidReason.trim()) {
      alert('Please provide a reason for void request');
      return;
    }

    if (!selectedSaleId) return;

    setSubmittingVoid(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Authentication error. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Buy/RequestVoid?saleId=${selectedSaleId}&reason=${encodeURIComponent(voidReason)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to submit void request');
      }

      const result = await response.text();
      alert(result);
      
      // Close modal and refresh purchases
      setShowVoidModal(false);
      setVoidReason('');
      setSelectedSaleId(null);
      fetchPurchases();
    } catch (err) {
      console.error('Error submitting void request:', err);
      alert(`Failed to submit void request. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setSubmittingVoid(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-stone-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        {/* Main Content */}
        <div className={`flex h-screen flex-1 flex-col bg-stone-50 dark:bg-stone-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Top Bar */}
          <div className="sticky top-0 z-20 border-b border-stone-200 dark:border-stone-700 bg-stone-50/95 dark:bg-neutral-800/95 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Controls & Title */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                {/* Hamburger - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
                </button>

                {/* Sidebar Toggle - Desktop Only */}
                <button
                  onClick={() => setSidebarExpanded(!sidebarExpanded)}
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-700 hover:bg-stone-100 dark:hover:bg-stone-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                {/* Title */}
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-stone-900 dark:text-stone-100 truncate">Purchases</h1>
              </div>

              {/* Right: Logout Panel */}
              <LogoutPanel />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8">
              {/* Header Section */}
              <div className="mb-6">
                <div className="bg-stone-50 dark:bg-stone-800 border-l-4 border-orange-500 rounded-lg p-6 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <FontAwesomeIcon icon={faReceipt} className="text-3xl text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                        Purchase History
                      </h2>
                      <p className="text-neutral-600 dark:text-stone-400 text-sm font-medium">
                        View all purchase transactions and details
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter Section */}
              <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by menu item name or transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <FontAwesomeIcon icon={faFilter} className="text-neutral-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors duration-200 appearance-none cursor-pointer"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status === 'All' ? 'All Status' : status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4 text-sm text-neutral-600 dark:text-stone-400">
                Showing <span className="font-bold text-orange-600 dark:text-orange-400">{filteredPurchases.length}</span> of {purchases.length} purchases
              </div>

              {/* Purchases List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-12 text-center border border-stone-200 dark:border-stone-700">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faReceipt} className="text-4xl text-orange-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Loading purchases...</h3>
                    <p className="text-neutral-600 dark:text-stone-400">Please wait while we fetch your transaction history</p>
                  </div>
                ) : filteredPurchases.length === 0 ? (
                  <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-12 text-center border border-stone-200 dark:border-stone-700">
                    <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FontAwesomeIcon icon={faReceipt} className="text-4xl text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">No purchases found</h3>
                    <p className="text-neutral-600 dark:text-stone-400">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="bg-stone-50 dark:bg-stone-800 rounded-2xl p-6 border border-stone-200 dark:border-stone-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left: Receipt Info */}
                        <div className="lg:col-span-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FontAwesomeIcon icon={faReceipt} className="text-orange-600 dark:text-orange-400 text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1 truncate">
                                {purchase.menuItemName || 'No Items'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-stone-400">
                                <span className="flex items-center gap-1 font-mono text-xs bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                                  <FontAwesomeIcon icon={faReceipt} className="text-xs" />
                                  {purchase.receiptNumber || `#${purchase.id}`}
                                </span>
                                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${getStatusColor(purchase.status)}`}>
                                  {purchase.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                          {/* Subtotal */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase tracking-wide mb-1 font-semibold">Subtotal</p>
                            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                              ₱{purchase.subtotal.toFixed(2)}
                            </p>
                          </div>

                          {/* Discount */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                              <FontAwesomeIcon icon={faPercentage} className="text-xs" />
                              Discount
                            </p>
                            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                              ₱{purchase.discount.toFixed(2)}
                            </p>
                          </div>

                          {/* Tax */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase tracking-wide mb-1 font-semibold">Tax</p>
                            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                              ₱{purchase.tax.toFixed(2)}
                            </p>
                          </div>

                          {/* Date/Time */}
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase tracking-wide mb-1 font-semibold flex items-center gap-1">
                              <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                              Date
                            </p>
                            <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                              {formatDateTime(purchase.dateTime)}
                            </p>
                          </div>
                        </div>

                        {/* Right: Total Amount */}
                        <div className="lg:col-span-2 flex flex-col items-end justify-between text-right">
                          <div>
                            <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase tracking-wide mb-1 font-semibold">Total Amount</p>
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                              ₱{purchase.total.toFixed(2)}
                            </p>
                          </div>
                          {/* Request Void Button */}
                          {purchase.status === 'Completed' && (
                            <button
                              onClick={() => handleRequestVoid(purchase.id)}
                              className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 active:scale-95 text-sm font-medium flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faBan} className="h-3.5 w-3.5" />
                              Request Void
                            </button>
                          )}
                          {purchase.status === 'PendingVoid' && (
                            <div className="mt-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium">
                              Void Pending
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Void Request Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-stone-50 dark:bg-stone-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Request Void</h3>
              <button
                onClick={() => setShowVoidModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-neutral-600 dark:text-stone-400 mb-4">
              Please provide a reason for requesting to void this transaction. This will be sent to staff for approval.
            </p>

            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Enter reason for void request..."
              rows={4}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-stone-900 border border-neutral-200 dark:border-stone-700 rounded-lg text-neutral-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors duration-200 resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVoidModal(false)}
                disabled={submittingVoid}
                className="flex-1 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitVoidRequest}
                disabled={submittingVoid || !voidReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingVoid ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBan} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
