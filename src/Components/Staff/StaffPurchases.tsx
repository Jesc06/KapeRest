import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faShoppingCart, faBan, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch purchases from API
  useEffect(() => {
    fetchPurchases();
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

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase =>
    purchase.menuItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.id.toString().includes(searchTerm)
  );

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

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Purchases</h1>
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
                    <FontAwesomeIcon icon={faShoppingCart} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">Purchases History</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">View and manage all purchase transactions</p>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="mb-6">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by ID, item name, payment method, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-neutral-600 dark:text-neutral-400">Loading purchases...</p>
                    </div>
                  </div>
                ) : filteredPurchases.length === 0 ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faShoppingCart} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg font-medium">No purchases found</p>
                      <p className="text-neutral-500 dark:text-neutral-500 text-sm mt-2">Try adjusting your search</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-orange-100 dark:border-neutral-800 bg-orange-50/50 dark:bg-neutral-800/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Sale ID</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Item Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Subtotal</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Tax</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Discount</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Payment</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-100 dark:divide-neutral-800">
                        {filteredPurchases.map((purchase) => (
                          <tr
                            key={purchase.id}
                            className="hover:bg-orange-50/50 dark:hover:bg-neutral-800/30 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                                #{purchase.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-900 dark:text-white">
                                {purchase.menuItemName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                {formatDate(purchase.dateTime)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                ₱{purchase.subtotal.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                ₱{purchase.tax.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                ₱{purchase.discount.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                ₱{purchase.total.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-neutral-900 dark:text-white">
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
                              {purchase.status !== "Voided" ? (
                                <button
                                  onClick={() => handleVoid(purchase.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 active:scale-95 text-sm font-medium"
                                  title="Void this purchase"
                                >
                                  <FontAwesomeIcon icon={faBan} className="h-3.5 w-3.5" />
                                  Void
                                </button>
                              ) : (
                                <span className="text-xs text-neutral-400 dark:text-neutral-600">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary Cards */}
              {!isLoading && filteredPurchases.length > 0 && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Purchases</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{filteredPurchases.length}</p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {filteredPurchases.filter(p => p.status === "Completed").length}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Voided</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {filteredPurchases.filter(p => p.status === "Voided").length}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ₱{filteredPurchases
                        .filter(p => p.status === "Completed")
                        .reduce((sum, p) => sum + p.total, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPurchases;
