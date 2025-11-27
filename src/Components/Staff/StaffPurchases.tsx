import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faShoppingCart, faBan, faCheckCircle, faTimesCircle, faBell } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface SalesItem {
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
}

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
  salesItems: SalesItem[];
}

const StaffPurchases: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voidRequestCount, setVoidRequestCount] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch purchases from API
  useEffect(() => {
    fetchPurchases();
  }, []);

  // Fetch void request count
  useEffect(() => {
    const fetchVoidRequestCount = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const cashierId = decoded.cashierId;

        if (!cashierId) return;

        const response = await fetch(`${API_BASE_URL}/Purchases/SalesPurchases?cashierId=${cashierId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const pendingCount = data.filter((item: any) => item.status === 'PendingVoid').length;
          setVoidRequestCount(pendingCount);
        }
      } catch (err) {
        console.error('Error fetching void request count:', err);
      }
    };

    fetchVoidRequestCount();
    // Refresh count every 30 seconds
    const interval = setInterval(fetchVoidRequestCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPurchases = async () => {
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

      // Updated to match backend - now filters by cashierId on backend
      const response = await fetch(`${API_BASE_URL}/Purchases/SalesPurchases?cashierId=${cashierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Purchase[] = await response.json();
      // Backend now handles filtering by cashierId, so we get only user's purchases
      setPurchases(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setIsLoading(false);
    }
  };

  // Filter purchases based on search term, payment method, and status
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.menuItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.id.toString().includes(searchTerm);
    
    const matchesPayment = selectedPaymentMethod === 'all' || purchase.paymentMethod === selectedPaymentMethod;
    const matchesStatus = selectedStatus === 'all' || purchase.status === selectedStatus;
    
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const handleVoid = async (saleId: number) => {
    if (!window.confirm('Are you sure you want to void this purchase? This action will restore the stock.')) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }

      // Decode JWT to get cashierId for authorization
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      const cashierId = decoded.cashierId;

      if (!cashierId) {
        console.error('Cashier ID not found in token');
        alert('Authorization error. Please log in again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Buy/VoidItem?saleItemId=${saleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Void error response:', errorText);
        throw new Error(`Failed to void purchase: ${errorText || 'Server error'}`);
      }

      const result = await response.text();
      alert(result);
      
      // Refresh the purchases list
      fetchPurchases();
    } catch (err) {
      console.error('Error voiding purchase:', err);
      alert(`Failed to void purchase. ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
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
                      <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Purchases</h1>
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Transaction history</p>
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
                        placeholder="Search purchases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          {filteredPurchases.length} found
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Void Requests Bell */}
                  <button
                    onClick={() => navigate('/staff/void-requests')}
                    className="relative p-2.5 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                    title="Void Requests"
                  >
                    <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
                    {voidRequestCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] px-1.5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse border-2 border-white dark:border-stone-900">
                        {voidRequestCount > 9 ? '9+' : voidRequestCount}
                      </span>
                    )}
                  </button>

                  <LogoutPanel />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6 overflow-auto">

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Payment Method Filters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPaymentMethod('all')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedPaymentMethod === 'all'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500'
                    }`}
                  >
                    All Payments
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('Cash')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedPaymentMethod === 'Cash'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    onClick={() => setSelectedPaymentMethod('GCash')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedPaymentMethod === 'GCash'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500'
                    }`}
                  >
                    GCash
                  </button>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedStatus === 'all'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-green-500 dark:hover:border-green-500'
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => setSelectedStatus('Completed')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedStatus === 'Completed'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-green-500 dark:hover:border-green-500'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => setSelectedStatus('Voided')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                      selectedStatus === 'Voided'
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-2 border-stone-200 dark:border-stone-700 hover:border-red-500 dark:hover:border-red-500'
                    }`}
                  >
                    Voided
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-stone-700">
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-800 dark:via-orange-950/20 dark:to-stone-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faShoppingCart} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Purchase History</h3>
                          <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mt-0.5">All transaction records</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-stone-600 dark:text-stone-400">Loading purchases...</p>
                      </div>
                    </div>
                  ) : filteredPurchases.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <FontAwesomeIcon icon={faShoppingCart} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                        <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">No purchases found</p>
                        <p className="text-neutral-500 dark:text-stone-500 text-sm mt-2">Try adjusting your search</p>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-stone-700 bg-orange-50/50 dark:bg-stone-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Sale ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Receipt No.</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Item Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Subtotal</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Tax</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Discount</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                        {filteredPurchases.map((purchase) => (
                          <tr
                            key={purchase.id}
                            className="hover:bg-orange-50/50 dark:hover:bg-stone-800/30 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-stone-900 dark:text-white">
                                #{purchase.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                {purchase.receiptNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-stone-900 dark:text-white">
                                {purchase.menuItemName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-stone-600 dark:text-stone-400">
                                {formatDate(purchase.dateTime)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-stone-900 dark:text-white">
                                ₱{purchase.subtotal.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-stone-600 dark:text-stone-400">
                                ₱{purchase.tax.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-stone-600 dark:text-stone-400">
                                ₱{purchase.discount.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                ₱{purchase.total.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-stone-900 dark:text-white">
                                {purchase.paymentMethod}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {purchase.status === "Completed" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                                  Completed
                                </span>
                              ) : purchase.status === "Voided" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                  <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3" />
                                  Voided
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                  {purchase.status}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => purchase.status !== "Voided" && handleVoid(purchase.id)}
                                disabled={purchase.status === "Voided"}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                                  purchase.status === "Voided"
                                    ? "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed opacity-50"
                                    : "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 active:scale-95 cursor-pointer"
                                }`}
                                title={purchase.status === "Voided" ? "Already voided" : "Void this purchase"}
                              >
                                <FontAwesomeIcon icon={faBan} className="h-3.5 w-3.5" />
                                Void
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPurchases;
