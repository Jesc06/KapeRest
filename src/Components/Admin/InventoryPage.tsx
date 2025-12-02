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
    <div className={`flex h-screen flex-col bg-gradient-to-br from-neutral-50 via-white to-orange-50/20 dark:bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-80' : 'lg:ml-28'}`}>
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />

      {/* Premium Top Bar with Glass Effect */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 dark:bg-neutral-900/95 border-b border-orange-200/30 dark:border-orange-900/30 shadow-xl shadow-orange-500/5 transition-all duration-300">
        <div className="px-4 sm:px-6 md:px-8 py-5">
          {/* Mobile Top Section */}
          <div className="block lg:hidden">
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 active:scale-95 hover:scale-105"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <LogoutPanel />
            </div>

            {/* Mobile Search Bar */}
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-orange-200/50 dark:border-orange-900/50 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:shadow-xl focus-within:shadow-orange-500/20 px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
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
          <div className="hidden lg:flex items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:from-neutral-800 dark:to-neutral-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-stone-700 dark:text-stone-300 hover:text-orange-600 dark:hover:text-orange-400 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-600 shadow-lg hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 active:scale-95 hover:scale-105"
                title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>

              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent tracking-tight">Inventory Management</h1>
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 mt-0.5">Stock levels and product details</p>
              </div>
            </div>

            <div className="flex-1 max-w-xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-orange-200/50 dark:border-orange-900/50 focus-within:border-orange-500 dark:focus-within:border-orange-500 focus-within:shadow-xl focus-within:shadow-orange-500/20 px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
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

          {/* Filter Buttons with Premium Design */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 via-orange-400/10 to-orange-500/10 border-2 border-orange-300/50 dark:border-orange-700/50 shadow-md">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-600 dark:bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
              <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Filters</span>
            </div>
            
            <div className="flex gap-2.5 flex-wrap">
              <div className="relative">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 rounded-2xl bg-white dark:bg-neutral-800 text-stone-700 dark:text-stone-300 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-600 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {branches.map(branch => (
                    <option key={branch} value={branch}>
                      {branch === 'all' ? 'All Branches' : branch}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 rounded-2xl bg-white dark:bg-neutral-800 text-stone-700 dark:text-stone-300 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-600 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {staff.map(s => (
                    <option key={s} value={s}>
                      {s === 'all' ? 'All Staff' : s === 'unassigned' ? 'Unassigned' : s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={filterUnit}
                  onChange={(e) => setFilterUnit(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 rounded-2xl bg-white dark:bg-neutral-800 text-stone-700 dark:text-stone-300 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-600 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit === 'all' ? 'All Units' : unit.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden flex-col gap-6 px-4 sm:px-6 md:px-8 py-6">
        
        {/* Premium Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Items Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-8 shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-3 border border-blue-400/30">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faBoxes} className="h-7 w-7 text-white" />
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-50 animate-pulse"></div>
                  <span className="text-xs font-bold text-white">Live</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Items</p>
                <p className="text-4xl font-black text-white">{totalItems}</p>
                <p className="text-xs font-medium text-white/70">unique products</p>
              </div>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-8 shadow-2xl shadow-green-500/30 hover:shadow-3xl hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-3 border border-emerald-400/30">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faDownload} className="h-7 w-7 text-white" />
                </div>
                <div className="text-xs font-bold text-white/80 px-2 py-1 rounded-lg bg-stone-50/20 backdrop-blur-sm">
                  PHP
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Total Value</p>
                <p className="text-4xl font-black text-white">₱{totalValue.toLocaleString()}</p>
                <p className="text-xs font-medium text-white/70">inventory worth</p>
              </div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-8 shadow-2xl shadow-orange-500/30 hover:shadow-3xl hover:shadow-orange-500/40 transition-all duration-500 hover:-translate-y-3 border border-orange-400/30">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-full blur-2xl transform -translate-x-4 translate-y-4"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50/20 backdrop-blur-sm shadow-lg">
                  <FontAwesomeIcon icon={faEdit} className="h-7 w-7 text-white" />
                </div>
                {lowStockItems > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/30 backdrop-blur-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                    <span className="text-xs font-bold text-white">Alert</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">Low Stock Items</p>
                <p className="text-4xl font-black text-white">{lowStockItems}</p>
                <p className="text-xs font-medium text-white/70">needs restocking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Inventory Table */}
        <div className="flex-1 min-h-0 flex flex-col rounded-3xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border-2 border-orange-200/30 dark:border-orange-900/30 transition-all duration-300">
          
          {/* Table Header with Gradient */}
          <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/30 bg-gradient-to-r from-orange-50/50 via-white to-orange-50/50 dark:from-orange-950/20 dark:via-neutral-800 dark:to-orange-950/20">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700"></div>
            
            <div className="px-8 sm:px-10 py-7">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-xl shadow-orange-500/40">
                    <FontAwesomeIcon icon={faBoxes} className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent tracking-tight">Inventory Records</h3>
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 mt-1">Complete stock management</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500/15 to-orange-600/15 border-2 border-orange-400/50 dark:border-orange-600/50 shadow-md">
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-600 dark:bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Active</span>
                  </div>
                  <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-2 border-orange-300/50 dark:border-orange-700/50 shadow-md">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Items</span>
                      <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-400 dark:to-orange-500 bg-clip-text text-transparent">{filteredStocks.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center px-4 max-w-md">
                  <div className="relative mb-8 inline-block">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/40">
                      <FontAwesomeIcon icon={faBoxes} className="h-12 w-12 text-white animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-stone-900 dark:text-white mb-3">Loading inventory...</h4>
                  <p className="text-base font-medium text-stone-600 dark:text-stone-400 leading-relaxed mb-6">Please wait while we retrieve stock data.</p>
                </div>
              </div>
            ) : filteredStocks.length === 0 ? (
              <div className="flex h-full items-center justify-center py-24">
                <div className="text-center px-4 max-w-md">
                  <div className="relative mb-8 inline-block">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-28 w-28 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 animate-ping"></div>
                    </div>
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/40">
                      <FontAwesomeIcon icon={faSearch} className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-black text-stone-900 dark:text-white mb-3">
                    No Items Found
                  </h4>
                  <p className="text-base font-medium text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
                    We couldn't find any inventory items matching your filters. Try adjusting your search criteria.
                  </p>
                  
                  <div className="flex justify-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-30"></div>
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 opacity-30"></div>
                  </div>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-stone-50 via-stone-100/80 to-stone-50 dark:from-neutral-800 dark:via-neutral-750 dark:to-neutral-800 border-b-2 border-stone-300 dark:border-stone-700 backdrop-blur-sm">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Product</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Stocks</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Units</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Cost</span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Total Value</span>
                    </th>
                    <th className="px-6 py-4 text-left hidden lg:table-cell">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Supplier</span>
                    </th>
                    <th className="px-6 py-4 text-left hidden lg:table-cell">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Branch</span>
                    </th>
                    <th className="px-6 py-4 text-left hidden sm:table-cell">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Staff</span>
                    </th>
                    <th className="px-6 py-4 text-left hidden xl:table-cell">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Date</span>
                    </th>
                    <th className="px-6 py-4 text-center">
                      <span className="text-xs font-black uppercase tracking-widest text-stone-700 dark:text-stone-300">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-neutral-700">
                  {filteredStocks.map((stock) => (
                    <tr
                      key={stock.id}
                      className="group relative bg-white dark:bg-neutral-800 hover:bg-gradient-to-r hover:from-orange-50/70 hover:via-orange-50/40 hover:to-transparent dark:hover:from-orange-950/30 dark:hover:via-orange-950/15 dark:hover:to-transparent transition-all duration-300 cursor-pointer border-b border-orange-100/50 dark:border-orange-900/30"
                    >
                      <td className="px-6 py-5 relative">
                        <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
                        <span className="text-sm font-black text-stone-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors">{stock.productName}</span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-lg transition-all duration-300 group-hover:scale-105 ${getStockBadgeColor(stock.stocks)}`}>
                          <div className={`h-2 w-2 rounded-full ${stock.stocks < 100 ? 'bg-red-600 animate-pulse' : stock.stocks < 500 ? 'bg-yellow-600' : 'bg-green-600'}`}></div>
                          {stock.stocks}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase">{stock.units}</span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-sm font-bold text-stone-900 dark:text-white tabular-nums">₱{stock.costPrice.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <span className="text-base font-black text-green-600 dark:text-green-400 tabular-nums">₱{(stock.stocks * stock.costPrice).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5 text-left hidden lg:table-cell">
                        <span className="text-sm text-stone-700 dark:text-stone-300">{stock.supplierName}</span>
                      </td>
                      <td className="px-6 py-5 text-left hidden lg:table-cell">
                        <span className="text-sm text-stone-700 dark:text-stone-300">{stock.branch.branchName}</span>
                      </td>
                      <td className="px-6 py-5 text-left hidden sm:table-cell">
                        {stock.cashier ? (
                          <span className="text-sm text-stone-700 dark:text-stone-300">{stock.cashier.firstName || ''} {stock.cashier.lastName || ''}</span>
                        ) : (
                          <span className="text-sm text-neutral-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-left hidden xl:table-cell">
                        <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">{formatDate(stock.transactionDate)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdate(stock.id)}
                            className="group/btn p-2.5 rounded-xl bg-blue-100 text-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-gradient-to-r dark:hover:from-blue-500 dark:hover:to-blue-600 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id)}
                            className="group/btn p-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-gradient-to-r dark:hover:from-red-500 dark:hover:to-red-600 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </button>
                        </div>
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
  );
};

export default InventoryPage;
