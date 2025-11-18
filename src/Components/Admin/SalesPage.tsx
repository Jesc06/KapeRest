import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faChartLine, faDownload, faCalendar, faBuilding, faMoneyBill, faClock } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from './AdminSidebar';
import LogoutPanel from '../Shared/LogoutPanel';

interface Sale {
  id: number;
  transactionId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  cashierName: string;
  branchName: string;
  transactionDate: string;
  paymentMethod: string;
}

const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockData: Sale[] = [
          {
            id: 1,
            transactionId: "TXN-001",
            productName: "Cappuccino",
            quantity: 2,
            unitPrice: 120,
            totalAmount: 240,
            cashierName: "Juan Dela Cruz",
            branchName: "Main Branch",
            transactionDate: "2025-11-18T08:30:00",
            paymentMethod: "Cash"
          },
          {
            id: 2,
            transactionId: "TXN-002",
            productName: "Latte",
            quantity: 1,
            unitPrice: 150,
            totalAmount: 150,
            cashierName: "Maria Santos",
            branchName: "Downtown Branch",
            transactionDate: "2025-11-18T09:15:00",
            paymentMethod: "Card"
          },
          {
            id: 3,
            transactionId: "TXN-003",
            productName: "Espresso",
            quantity: 3,
            unitPrice: 100,
            totalAmount: 300,
            cashierName: "Pedro Reyes",
            branchName: "Main Branch",
            transactionDate: "2025-11-18T10:00:00",
            paymentMethod: "Cash"
          },
          {
            id: 4,
            transactionId: "TXN-004",
            productName: "Mocha",
            quantity: 2,
            unitPrice: 140,
            totalAmount: 280,
            cashierName: "Ana Garcia",
            branchName: "Uptown Branch",
            transactionDate: "2025-11-18T11:30:00",
            paymentMethod: "GCash"
          },
          {
            id: 5,
            transactionId: "TXN-005",
            productName: "Americano",
            quantity: 1,
            unitPrice: 110,
            totalAmount: 110,
            cashierName: "Juan Dela Cruz",
            branchName: "Main Branch",
            transactionDate: "2025-11-18T12:45:00",
            paymentMethod: "Card"
          },
          {
            id: 6,
            transactionId: "TXN-006",
            productName: "Flat White",
            quantity: 2,
            unitPrice: 135,
            totalAmount: 270,
            cashierName: "Maria Santos",
            branchName: "Downtown Branch",
            transactionDate: "2025-11-18T13:20:00",
            paymentMethod: "Cash"
          },
        ];
        setSales(mockData);
        setIsLoading(false);
      }, 500);
    };

    fetchSales();
  }, [filterPeriod]);

  // Get unique branches for filter
  const branches = ['all', ...Array.from(new Set(sales.map(s => s.branchName)))];

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      sale.transactionId.toLowerCase().includes(searchLower) ||
      sale.productName.toLowerCase().includes(searchLower) ||
      sale.cashierName.toLowerCase().includes(searchLower);
    
    const matchesBranch = filterBranch === 'all' || sale.branchName === filterBranch;
    
    return matchesSearch && matchesBranch;
  });

  // Calculate stats
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalTransactions = filteredSales.length;
  const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;

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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
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
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

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

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Sales Report</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Total Sales */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <FontAwesomeIcon icon={faMoneyBill} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Sales</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">₱{totalSales.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Total Transactions */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FontAwesomeIcon icon={faChartLine} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Transactions</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalTransactions}</p>
                  </div>
                </div>
              </div>

              {/* Average Sale */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <FontAwesomeIcon icon={faDownload} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Avg. Sale</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">₱{averageSale.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 border border-neutral-100 dark:border-neutral-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Branch Filter */}
                <div className="relative">
                  <FontAwesomeIcon icon={faBuilding} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>
                        {branch === 'all' ? 'All Branches' : branch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Period Filter */}
                <div className="relative">
                  <FontAwesomeIcon icon={faCalendar} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 z-10" />
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value as 'daily' | 'monthly' | 'yearly')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden border border-neutral-100 dark:border-neutral-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Unit Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Total Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Cashier</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Branch</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Payment</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          Loading sales...
                        </td>
                      </tr>
                    ) : filteredSales.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          No sales found
                        </td>
                      </tr>
                    ) : (
                      filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-orange-50 dark:hover:bg-neutral-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-orange-600 dark:text-orange-400">{sale.transactionId}</td>
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{sale.productName}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{sale.quantity}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">₱{sale.unitPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">₱{sale.totalAmount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{sale.cashierName}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{sale.branchName}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              sale.paymentMethod === 'Cash' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : sale.paymentMethod === 'Card'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                              {sale.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            <div className="flex flex-col">
                              <span>{formatDate(sale.transactionDate).split(',')[0]}</span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1">
                                <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                                {formatTime(sale.transactionDate)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
