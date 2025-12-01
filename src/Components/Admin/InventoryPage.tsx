import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faEdit, faTrash, faBoxes, faDownload, faFilter, faTimes, faChartLine, faDollarSign, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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
  const [filterStock, setFilterStock] = useState<string>('all');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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
    
    const matchesStockLevel = filterStock === 'all' ||
      (filterStock === 'low' && stock.stocks < 100) ||
      (filterStock === 'medium' && stock.stocks >= 100 && stock.stocks < 500) ||
      (filterStock === 'high' && stock.stocks >= 500);
    
    return matchesSearch && matchesBranch && matchesStaff && matchesUnit && matchesStockLevel;
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
    if (stockLevel < 100) return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    if (stockLevel < 500) return 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
  };

  const clearFilters = () => {
    setFilterBranch('all');
    setFilterStaff('all');
    setFilterUnit('all');
    setFilterStock('all');
  };

  const activeFilters = [filterBranch, filterStaff, filterUnit, filterStock].filter(f => f !== 'all').length;

  return (
    <div className="min-h-screen w-full bg-stone-50 dark:bg-stone-900">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

        <div className={`flex h-screen flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
          {/* Premium Header with Glass Morphism */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-stone-50/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-700/50 shadow-lg shadow-black/5">
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
                  <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Search products, suppliers, branch, staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none"
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
                    className="hidden lg:flex flex-shrink-0 h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div>
                    <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Inventory Management</h1>
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Stock levels and product details</p>
                  </div>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3 bg-stone-50 dark:bg-stone-800 rounded-xl border-2 border-stone-200 dark:border-stone-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="h-5 w-5 text-stone-400 dark:text-stone-500 group-focus-within:text-orange-500 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Search products, suppliers, branch, staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-neutral-500 focus:outline-none"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-xs font-semibold mb-2 tracking-wide uppercase">Total Products</p>
                      <p className="text-4xl font-black mb-1">{totalItems}</p>
                      <p className="text-blue-200 text-xs font-medium">items in stock</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <FontAwesomeIcon icon={faBoxes} className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-xs font-semibold mb-2 tracking-wide uppercase">Total Value</p>
                      <p className="text-4xl font-black mb-1">₱{(totalValue / 1000).toFixed(1)}K</p>
                      <p className="text-green-200 text-xs font-medium">inventory worth</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <FontAwesomeIcon icon={faDollarSign} className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-xs font-semibold mb-2 tracking-wide uppercase">Low Stock</p>
                      <p className="text-4xl font-black mb-1">{lowStockItems}</p>
                      <p className="text-orange-200 text-xs font-medium">needs restock</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-xs font-semibold mb-2 tracking-wide uppercase">Filtered Results</p>
                      <p className="text-4xl font-black mb-1">{filteredStocks.length}</p>
                      <p className="text-purple-200 text-xs font-medium">items shown</p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                      <FontAwesomeIcon icon={faChartLine} className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Section */}
              <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-lg">
                <div className="p-4 border-b border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <FontAwesomeIcon icon={faFilter} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900 dark:text-white">Filters</h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400">
                          {activeFilters > 0 ? `${activeFilters} active` : 'No filters applied'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeFilters > 0 && (
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors"
                      >
                        <FontAwesomeIcon icon={showFilters ? faTimes : faFilter} className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? '' : 'hidden lg:grid'}`}>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">Branch</label>
                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
                    >
                      {branches.map(branch => (
                        <option key={branch} value={branch}>
                          {branch === 'all' ? 'All Branches' : branch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">Staff</label>
                    <select
                      value={filterStaff}
                      onChange={(e) => setFilterStaff(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
                    >
                      {staff.map(s => (
                        <option key={s} value={s}>
                          {s === 'all' ? 'All Staff' : s === 'unassigned' ? 'Unassigned' : s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">Unit</label>
                    <select
                      value={filterUnit}
                      onChange={(e) => setFilterUnit(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>
                          {unit === 'all' ? 'All Units' : unit.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wide">Stock Level</label>
                    <select
                      value={filterStock}
                      onChange={(e) => setFilterStock(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-2 border-stone-200 dark:border-stone-700 hover:border-orange-500 dark:hover:border-orange-500 font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="all">All Levels</option>
                      <option value="low">Low (&lt; 100)</option>
                      <option value="medium">Medium (100-499)</option>
                      <option value="high">High (≥ 500)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-stone-800 shadow-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-stone-50 to-orange-50/30 dark:from-stone-800 dark:to-orange-950/20 border-b border-stone-200 dark:border-stone-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <FontAwesomeIcon icon={faBoxes} className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-stone-900 dark:text-white">Inventory Records</h3>
                        <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                          Showing {filteredStocks.length} of {totalItems} products
                        </p>
                      </div>
                    </div>
                    <button className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
                      <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-500 to-amber-600 text-white sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Stock Level</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Unit</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Cost Price</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Supplier</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Staff</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-700 bg-white dark:bg-stone-800">
                      {isLoading ? (
                        <tr>
                          <td colSpan={10} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                              <p className="text-lg font-semibold text-stone-900 dark:text-white">Loading inventory...</p>
                              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Please wait</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredStocks.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="h-20 w-20 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                                <FontAwesomeIcon icon={faBoxes} className="text-4xl text-orange-600 dark:text-orange-400" />
                              </div>
                              <p className="text-lg font-semibold text-stone-900 dark:text-white">No inventory items found</p>
                              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Try adjusting your filters or search term</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredStocks.map((stock) => (
                          <tr 
                            key={stock.id} 
                            className="hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-md">
                                  {stock.productName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-stone-900 dark:text-white">{stock.productName}</p>
                                  <p className="text-xs text-stone-500 dark:text-stone-400">ID: {stock.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${getStockBadgeColor(stock.stocks)}`}>
                                {stock.stocks < 100 && <FontAwesomeIcon icon={faExclamationTriangle} />}
                                {stock.stocks}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-stone-600 dark:text-stone-400 uppercase">
                                {stock.units}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-stone-900 dark:text-white">
                                ₱{stock.costPrice.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                ₱{(stock.stocks * stock.costPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-stone-700 dark:text-stone-300">{stock.supplierName}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">{stock.branch.branchName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {stock.cashier ? (
                                <span className="text-sm text-stone-700 dark:text-stone-300">
                                  {stock.cashier.firstName || ''} {stock.cashier.lastName || ''}
                                </span>
                              ) : (
                                <span className="text-xs text-stone-400 dark:text-stone-500 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-stone-600 dark:text-stone-400">{formatDate(stock.transactionDate)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleUpdate(stock.id)}
                                  className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white transition-all duration-200 group-hover:scale-110"
                                  title="Edit"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(stock.id)}
                                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-600 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white transition-all duration-200 group-hover:scale-110"
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
