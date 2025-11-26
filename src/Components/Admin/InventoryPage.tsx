import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faEdit, faTrash, faBoxes, faDownload } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from './AdminSidebar';
import LogoutPanel from '../Shared/LogoutPanel';
import { API_BASE_URL } from '../../config/api';

interface Branch {
  branchName: string;
  location: string;
}

interface Cashier {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Stock {
  id: number;
  productName: string;
  stocks: number;
  units: string;
  costPrice: number;
  transactionDate: string;
  supplierName: string;
  branch: Branch;
  cashier: Cashier | null;
}

const InventoryPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch inventory from API
  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/Inventory/GetAllProducts_Admin`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Stock[] = await response.json();
        setStocks(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setIsLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Get unique branches and staff for filters
  const branches = ['all', ...Array.from(new Set(stocks.map(s => s.branch.branchName)))];
  const staff = ['all', 'unassigned', ...Array.from(new Set(
    stocks
      .filter(s => s.cashier !== null)
      .map(s => s.cashier ? `${s.cashier.firstName || ''} ${s.cashier.lastName || ''}`.trim() : '')
      .filter(name => name !== '')
  ))];
  const units = ['all', 'ml', 'kg', 'pcs'];

  // Filter stocks
  const filteredStocks = stocks.filter(stock => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      stock.productName.toLowerCase().includes(searchLower) ||
      stock.supplierName.toLowerCase().includes(searchLower) ||
      stock.branch.branchName.toLowerCase().includes(searchLower) ||
      (stock.cashier && `${stock.cashier.firstName || ''} ${stock.cashier.lastName || ''}`.toLowerCase().includes(searchLower));
    
    const matchesBranch = filterBranch === 'all' || stock.branch.branchName === filterBranch;
    
    const staffName = stock.cashier ? `${stock.cashier.firstName || ''} ${stock.cashier.lastName || ''}`.trim() : '';
    const matchesStaff = filterStaff === 'all' || 
      (filterStaff === 'unassigned' && stock.cashier === null) ||
      (staffName === filterStaff);
    
    const matchesUnit = filterUnit === 'all' || stock.units === filterUnit;
    
    return matchesSearch && matchesBranch && matchesStaff && matchesUnit;
  });

  // Calculate stats
  const totalItems = stocks.length;
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.stocks * stock.costPrice), 0);
  const lowStockItems = stocks.filter(s => s.stocks < 100).length;

  const handleUpdate = (stockId: number) => {
    // Navigate to update page
    console.log('Update stock:', stockId);
  };

  const handleDelete = (stockId: number) => {
    if (window.confirm('Are you sure you want to delete this stock entry?')) {
      setStocks(stocks.filter(s => s.id !== stockId));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockBadgeColor = (stockLevel: number) => {
    if (stockLevel < 100) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (stockLevel < 500) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
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

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent truncate">Inventory Management</h1>
              </div>

              <LogoutPanel />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Total Items */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FontAwesomeIcon icon={faBoxes} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Items</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalItems}</p>
                  </div>
                </div>
              </div>

              {/* Total Value */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <FontAwesomeIcon icon={faDownload} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Value</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">₱{totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Low Stock */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <FontAwesomeIcon icon={faEdit} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Low Stock</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{lowStockItems}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 sm:p-6 shadow-lg mb-6 border border-neutral-100 dark:border-neutral-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search products, suppliers, branch, staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Branch Filter */}
                <div className="relative">
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>
                        {branch === 'all' ? 'All Branches' : branch}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Staff Filter */}
                <div className="relative">
                  <select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {staff.map(s => (
                      <option key={s} value={s}>
                        {s === 'all' ? 'All Staff' : s === 'unassigned' ? 'Unassigned' : s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Filter */}
                <div className="relative">
                  <select
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit === 'all' ? 'All Units' : unit.toUpperCase()}
                      </option>
                    ))}
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
                      <th className="px-6 py-4 text-left text-sm font-semibold">Product Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Stocks</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Units</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Cost Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Total Value</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Supplier</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Branch</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Staff</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          <div className="inline-block h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-lg font-medium">Loading inventory...</p>
                        </td>
                      </tr>
                    ) : filteredStocks.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400">
                          <FontAwesomeIcon icon={faBoxes} className="text-4xl mb-3 opacity-50" />
                          <p className="text-lg font-medium">No inventory items found</p>
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredStocks.map((stock) => (
                        <tr key={stock.id} className="hover:bg-orange-50 dark:hover:bg-neutral-700/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{stock.productName}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStockBadgeColor(stock.stocks)}`}>
                              {stock.stocks}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400 uppercase">{stock.units}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">₱{stock.costPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-neutral-900 dark:text-white">₱{(stock.stocks * stock.costPrice).toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{stock.supplierName}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{stock.branch.branchName}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                            {stock.cashier ? (
                              <span>{stock.cashier.firstName || ''} {stock.cashier.lastName || ''}</span>
                            ) : (
                              <span className="text-neutral-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{formatDate(stock.transactionDate)}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleUpdate(stock.id)}
                                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                title="Edit"
                              >
                                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(stock.id)}
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                title="Delete"
                              >
                                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                              </button>
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

export default InventoryPage;
