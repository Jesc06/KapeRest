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
    <div className="min-h-screen w-full" style={{ backgroundColor: '#FEF7EB' }}>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header with Glass Morphism */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-stone-200/50 dark:border-neutral-700/50 shadow-lg shadow-black/5">
            <div className="px-4 sm:px-6 md:px-8 py-4">
              {/* Mobile Top Section */}
              <div className="block lg:hidden">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>
                  <LogoutPanel />
                </div>

                {/* Mobile Search Bar */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-stone-200 dark:border-neutral-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-orange-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Search products, suppliers, branch, staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
                    />
                    {searchTerm && (
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                        {filteredStocks.length} found
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Desktop Top Section */}
              <div className="hidden lg:flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 border border-stone-300 dark:border-neutral-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div>
                    <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Inventory Management</h1>
                    <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Stock levels and product details</p>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-stone-200 dark:border-neutral-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-orange-500 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Search products, suppliers, branch, staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
                      />
                      {searchTerm && (
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          {filteredStocks.length} found
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
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Items</p>
                      <p className="text-3xl font-black">{totalItems}</p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faBoxes} className="h-7 w-7" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-green-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-1">Total Value</p>
                      <p className="text-3xl font-black">₱{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faDownload} className="h-7 w-7" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg shadow-orange-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium mb-1">Low Stock</p>
                      <p className="text-3xl font-black">{lowStockItems}</p>
                    </div>
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                      <FontAwesomeIcon icon={faEdit} className="h-7 w-7" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <select
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {branches.map(branch => (
                      <option key={branch} value={branch}>
                        {branch === 'all' ? 'All Branches' : branch}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {staff.map(s => (
                      <option key={s} value={s}>
                        {s === 'all' ? 'All Staff' : s === 'unassigned' ? 'Unassigned' : s}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={filterUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit === 'all' ? 'All Units' : unit.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-neutral-700">
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-white via-orange-50/30 to-white dark:from-neutral-800 dark:via-orange-950/20 dark:to-neutral-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faBoxes} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Inventory Records</h3>
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">All stock entries and details</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
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
    </div>
  );
};

export default InventoryPage;
