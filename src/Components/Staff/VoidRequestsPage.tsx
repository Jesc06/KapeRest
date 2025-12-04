import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faBan, faReceipt, faCalendar } from '@fortawesome/free-solid-svg-icons';
import StaffSidebar from './StaffSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

interface VoidRequest {
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
  reason: string;
  salesItems: any[];
}

const VoidRequestsPage: React.FC = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [voidRequests, setVoidRequests] = useState<VoidRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchVoidRequests();
  }, []);

  const fetchVoidRequests = async () => {
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

      const response = await fetch(`${API_BASE_URL}/Purchases/SalesPurchases?cashierId=${cashierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VoidRequest[] = await response.json();
      // Filter only pending void requests
      const pendingVoids = data.filter(item => item.status === 'PendingVoid');
      setVoidRequests(pendingVoids);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching void requests:', err);
      setIsLoading(false);
    }
  };

  const filteredRequests = voidRequests.filter(request =>
    request.menuItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.id.toString().includes(searchTerm)
  );

  const handleApprove = async (saleId: number) => {
    if (!window.confirm(t('voidRequests.confirmApprove'))) return;

    setProcessing(saleId);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert(t('purchases.authError'));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Buy/ApprovedVoid?saleId=${saleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to approve void request');
      }

      const result = await response.text();
      alert(result);
      fetchVoidRequests();
    } catch (err) {
      console.error('Error approving void:', err);
      alert(`Failed to approve void. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (saleId: number) => {
    if (!window.confirm(t('voidRequests.confirmReject'))) return;

    setProcessing(saleId);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert(t('purchases.authError'));
        return;
      }

      const response = await fetch(`${API_BASE_URL}/Buy/RejectVoid?saleId=${saleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reject void request');
      }

      const result = await response.text();
      alert(result);
      fetchVoidRequests();
    } catch (err) {
      console.error('Error rejecting void:', err);
      alert(`Failed to reject void. ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setProcessing(null);
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
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-96 h-96 bg-orange-200/20 dark:bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/20 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Header */}
          <div className="sticky top-0 z-20 border-b border-orange-100/50 dark:border-stone-700/50 bg-stone-50/80 dark:bg-neutral-900/80 px-4 sm:px-6 md:px-8 py-3.5 sm:py-4 shadow-sm backdrop-blur-xl">
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
                  className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                >
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </button>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">{t('voidRequests.title')}</h1>
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
                    <FontAwesomeIcon icon={faBan} className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">{t('voidRequests.title')}</h2>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{t('voidRequests.subtitle')}</p>
                  </div>
                </div>
              </div>

              {/* Search Section */}
              <div className="mb-6">
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-sm" />
                  <input
                    type="text"
                    placeholder={t('voidRequests.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-neutral-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-orange-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Void Requests List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-12 text-center border border-neutral-200 dark:border-stone-700">
                    <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-stone-600 dark:text-stone-400">{t('voidRequests.loading')}</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="bg-stone-50 dark:bg-stone-900 rounded-lg p-12 text-center border border-neutral-200 dark:border-stone-700">
                    <FontAwesomeIcon icon={faBan} className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                    <p className="text-stone-600 dark:text-stone-400 text-lg font-medium">{t('voidRequests.noRequests')}</p>
                    <p className="text-neutral-500 dark:text-stone-500 text-sm mt-2">{t('voidRequests.allClear')}</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-stone-50 dark:bg-stone-900 rounded-xl border border-neutral-200 dark:border-stone-700 overflow-hidden hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex flex-col">
                          {/* Transaction Info */}
                          <div className="flex-1">
                            {/* Header with Receipt */}
                            <div className="flex items-start justify-between mb-4 pb-4 border-b border-neutral-100 dark:border-stone-700">
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                                  <FontAwesomeIcon icon={faReceipt} className="text-white text-lg" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                                    {request.menuItemName}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="font-mono text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-md font-semibold">
                                      {request.receiptNumber || `#${request.id}`}
                                    </span>
                                    <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                    <span className="text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                                      <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                                      {formatDate(request.dateTime)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Transaction Details Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase mb-1 font-medium">Subtotal</p>
                                <p className="text-base font-bold text-stone-900 dark:text-white">₱{request.subtotal.toFixed(2)}</p>
                              </div>
                              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase mb-1 font-medium">Tax</p>
                                <p className="text-base font-bold text-stone-900 dark:text-white">₱{request.tax.toFixed(2)}</p>
                              </div>
                              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 dark:text-stone-400 uppercase mb-1 font-medium">Discount</p>
                                <p className="text-base font-bold text-stone-900 dark:text-white">₱{request.discount.toFixed(2)}</p>
                              </div>
                              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800/50">
                                <p className="text-xs text-orange-700 dark:text-orange-400 uppercase mb-1 font-semibold">Total</p>
                                <p className="text-base font-bold text-orange-600 dark:text-orange-400">₱{request.total.toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Reason */}
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 rounded-lg p-4 border border-orange-100 dark:border-orange-900/30">
                              <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faBan} className="text-orange-600 dark:text-orange-400 text-sm" />
                                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide">Void Reason</p>
                              </div>
                              <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">{request.reason || 'No reason provided'}</p>
                            </div>
                          </div>

                          {/* Actions - Bottom Right */}
                          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-stone-700">
                            <button
                              onClick={() => handleApprove(request.id)}
                              disabled={processing === request.id}
                              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                              {processing === request.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing...
                                </>
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              disabled={processing === request.id}
                              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary */}
              {!isLoading && filteredRequests.length > 0 && (
                <div className="mt-6 bg-stone-50 dark:bg-stone-900 p-4 rounded-lg border border-neutral-200 dark:border-stone-700">
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    <span className="font-bold text-orange-600 dark:text-orange-400">{filteredRequests.length}</span> pending void request{filteredRequests.length !== 1 ? 's' : ''} awaiting approval
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoidRequestsPage;
