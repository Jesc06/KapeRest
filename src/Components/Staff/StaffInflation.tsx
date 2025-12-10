import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faSearch, 
  faArrowUp,
  faArrowDown,
  faMinus,
  faCalendarDays,
  faCalendarWeek,
  faCalendar,
  faSun,
  faFire,
  faChartArea
} from '@fortawesome/free-solid-svg-icons';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { API_BASE_URL } from '../../config/api';
import { jwtDecode } from 'jwt-decode';

interface SalesReportDTO {
  id: number;
  username: string;
  fullName: string;
  email: string;
  branchName: string;
  branchLocation: string;
  menuItemName: string;
  dateTime: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
}

interface InflationData {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  currentRevenue: number;
  previousRevenue: number;
  growthAmount: number;
  growthPercent: number;
  trend: 'up' | 'down' | 'stable';
}

type PeriodFilter = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

const StaffInflation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('daily');
  const [inflationData, setInflationData] = useState<InflationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cashierId, setCashierId] = useState<string | null>(null);

  // Get cashierId from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const payload: any = jwtDecode(token);
      const userId = payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                     payload?.uid || 
                     payload?.sub;
      
      setCashierId(userId);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  // Fetch inflation data from API
  useEffect(() => {
    const fetchInflationData = async () => {
      if (!cashierId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        // Fetch branch-specific sales data
        const salesData = await fetchBranchSalesData(selectedPeriod);
        
        // Process sales data into inflation format
        const processedData = processSalesDataToInflation(salesData, selectedPeriod);
        setInflationData(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching inflation data:', err);
        setIsLoading(false);
      }
    };

    fetchInflationData();
  }, [selectedPeriod, cashierId]);

  // Fetch branch-specific sales data based on period
  const fetchBranchSalesData = async (period: PeriodFilter): Promise<SalesReportDTO[]> => {
    const token = localStorage.getItem('accessToken');
    let endpoint = '';

    switch (period) {
      case 'daily':
        endpoint = 'CashierDailySales';
        break;
      case 'weekly':
      case 'monthly':
      case 'yearly':
        endpoint = 'CashierMonthlySales';
        break;
      case 'custom':
        endpoint = 'CashierMonthlySales';
        break;
    }

    const response = await fetch(`${API_BASE_URL}/CashierSalesReport/${endpoint}?cashierId=${cashierId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch sales data');
    return await response.json();
  };

  // Process sales data into inflation format
  const processSalesDataToInflation = (salesData: SalesReportDTO[], period: PeriodFilter): InflationData[] => {
    if (salesData.length === 0) return [];

    // Group sales by period
    const groupedData: { [key: string]: SalesReportDTO[] } = {};
    
    salesData.forEach(sale => {
      const date = new Date(sale.dateTime);
      let key = '';
      
      if (period === 'daily') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (period === 'monthly') {
        key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (period === 'yearly') {
        key = date.getFullYear().toString();
      }
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(sale);
    });

    // Convert grouped data to inflation format
    const inflationArray: InflationData[] = [];
    const periods = Object.keys(groupedData).sort((a, b) => {
      const dateA = groupedData[a][0].dateTime;
      const dateB = groupedData[b][0].dateTime;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    periods.forEach((periodKey, index) => {
      const currentSales = groupedData[periodKey];
      const currentRevenue = currentSales.reduce((sum, sale) => sum + sale.total, 0);
      
      // Get previous period for comparison
      const previousPeriodKey = periods[index + 1];
      const previousRevenue = previousPeriodKey 
        ? groupedData[previousPeriodKey].reduce((sum, sale) => sum + sale.total, 0)
        : currentRevenue * 0.85; // Default to 85% if no previous data
      
      const growthAmount = currentRevenue - previousRevenue;
      const growthPercent = previousRevenue !== 0 ? (growthAmount / previousRevenue) * 100 : 0;
      
      const firstDate = new Date(currentSales[0].dateTime);
      const lastDate = new Date(currentSales[currentSales.length - 1].dateTime);
      
      inflationArray.push({
        id: index + 1,
        period: periodKey,
        startDate: firstDate.toISOString(),
        endDate: lastDate.toISOString(),
        currentRevenue,
        previousRevenue,
        growthAmount,
        growthPercent,
        trend: Math.abs(growthPercent) < 1 ? 'stable' : growthPercent > 0 ? 'up' : 'down'
      });
    });

    return inflationArray;
  };

  // Filter data based on search and custom date range
  const filteredData = inflationData.filter(item => {
    const matchesSearch = item.period.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (selectedPeriod === 'custom' && (startDate || endDate)) {
      const itemDate = new Date(item.startDate);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return faArrowUp;
      case 'down':
        return faArrowDown;
      default:
        return faMinus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-stone-600 dark:text-stone-400';
    }
  };

  const getTrendBg = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-emerald-100 dark:bg-emerald-900/30';
      case 'down':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-stone-100 dark:bg-stone-800';
    }
  };

  const periodFilters: { label: string; value: PeriodFilter; icon: any }[] = [
    { label: 'Daily', value: 'daily', icon: faSun },
    { label: 'Weekly', value: 'weekly', icon: faCalendarWeek },
    { label: 'Monthly', value: 'monthly', icon: faCalendarDays },
    { label: 'Yearly', value: 'yearly', icon: faCalendar },
    { label: 'Custom', value: 'custom', icon: faFire }
  ];

  return (
    <div className="w-full">
      {/* Inflation Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <FontAwesomeIcon icon={faFire} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Sales Inflation
              </h3>
              <p className="text-base text-stone-600 dark:text-stone-400 font-medium">
                Revenue growth trends & analysis
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" 
              />
              <input
                type="text"
                placeholder="Search periods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-stone-100 dark:bg-neutral-700 border-2 border-transparent rounded-xl text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-neutral-600 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Period Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 via-orange-400/10 to-orange-500/10 border-2 border-orange-300/50 dark:border-orange-700/50">
            <div className="h-2.5 w-2.5 rounded-full bg-orange-600 dark:bg-orange-500 animate-pulse shadow-lg shadow-orange-500/50"></div>
            <span className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400">Period</span>
          </div>
          
          <div className="flex gap-2.5 flex-wrap">
            {periodFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedPeriod(filter.value)}
                className={`group relative flex items-center gap-2.5 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 overflow-hidden ${
                  selectedPeriod === filter.value
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white shadow-xl shadow-orange-500/50 scale-105 border-2 border-orange-400'
                      : 'bg-white dark:bg-neutral-800 text-stone-700 dark:text-stone-300 border-2 border-orange-200/50 dark:border-orange-900/50 hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg'
                  }`}
                >
                  {selectedPeriod === filter.value && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent animate-pulse"></div>
                  )}
                  <FontAwesomeIcon icon={filter.icon} className="h-4 w-4 relative z-10" />
                  <span className="relative z-10">{filter.label}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-stone-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-stone-900 dark:text-white focus:outline-none"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Revenue Trend Chart */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-white to-stone-50 dark:from-stone-800 dark:to-stone-900 shadow-lg border-2 border-orange-200/50 dark:border-orange-900/30 overflow-hidden">
        <div className="relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-orange-50 via-amber-50/30 to-orange-50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-orange-950/30">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-600"></div>
          
          <div className="px-6 sm:px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
                <FontAwesomeIcon icon={faChartArea} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">Revenue Trend Analysis</h3>
                <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Visual comparison of current vs previous revenue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                <p className="mt-4 text-sm font-semibold text-stone-600 dark:text-stone-400">Loading chart data...</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-700 mb-4">
                  <FontAwesomeIcon icon={faChartArea} className="h-8 w-8 text-stone-400 dark:text-stone-500" />
                </div>
                <p className="text-lg font-bold text-stone-700 dark:text-stone-300">No chart data available</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData.slice().reverse()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7280" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
                    stroke="#d6d3d1"
                  />
                  <YAxis 
                    tick={{ fill: '#78716c', fontSize: 12, fontWeight: 600 }}
                    stroke="#d6d3d1"
                    tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '2px solid #fed7aa',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                      padding: '12px 16px'
                    }}
                    labelStyle={{
                      color: '#1c1917',
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}
                    itemStyle={{
                      color: '#57534e',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                    formatter={(value: number) => [
                      `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      ''
                    ]}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                    iconType="circle"
                  />
                  <Area
                    type="monotone"
                    dataKey="currentRevenue"
                    name="Current Revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCurrent)"
                    animationDuration={1500}
                  />
                  <Area
                    type="monotone"
                    dataKey="previousRevenue"
                    name="Previous Revenue"
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorPrevious)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          
          {/* Quick Stats */}
          {!isLoading && filteredData.length > 0 && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 p-4 border-2 border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Avg Growth</p>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-300 mt-1">
                      {(filteredData.reduce((acc, item) => acc + item.growthPercent, 0) / filteredData.length).toFixed(2)}%
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <FontAwesomeIcon icon={faArrowUp} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 p-4 border-2 border-orange-200/50 dark:border-orange-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">Avg Revenue</p>
                    <p className="text-2xl font-black text-orange-900 dark:text-orange-300 mt-1">
                      ₱{(filteredData.reduce((acc, item) => acc + item.currentRevenue, 0) / filteredData.length / 1000).toFixed(1)}k
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-500 dark:bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <FontAwesomeIcon icon={faChartLine} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 p-4 border-2 border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Total Periods</p>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-300 mt-1">
                      {filteredData.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FontAwesomeIcon icon={faCalendar} className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inflation Table */}
      <div className="rounded-2xl bg-white dark:bg-stone-800/60 shadow-md border border-stone-200 dark:border-stone-700/60 overflow-hidden">
        <div className="relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-stone-50 via-orange-50/30 to-stone-50 dark:from-stone-800 dark:via-orange-950/20 dark:to-stone-800">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
            
            <div className="px-6 sm:px-8 py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                    <FontAwesomeIcon icon={faChartLine} className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Inflation Analysis</h3>
                    <p className="text-sm font-medium text-stone-600 dark:text-stone-400 mt-0.5">
                      {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} found
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
                  <p className="mt-4 text-sm font-semibold text-stone-600 dark:text-stone-400">Loading inflation data...</p>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-700 mb-4">
                    <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-stone-400 dark:text-stone-500" />
                  </div>
                  <p className="text-lg font-bold text-stone-700 dark:text-stone-300">No data found</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Try adjusting your filters</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-900/50 border-b-2 border-stone-200 dark:border-stone-700">
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">Period</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">Current Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">Previous Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">Growth Amount</th>
                    <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">Growth %</th>
                      <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                    {filteredData.map((item, index) => (
                      <tr 
                        key={item.id}
                        className="hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-bold text-stone-900 dark:text-white">{item.period}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-bold text-stone-900 dark:text-white">₱{item.currentRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">₱{item.previousRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`text-sm font-bold ${getTrendColor(item.trend)}`}>
                            {item.growthAmount >= 0 ? '+' : ''}₱{item.growthAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`px-3 py-1.5 rounded-lg ${getTrendBg(item.trend)} ${getTrendColor(item.trend)} font-bold text-sm`}>
                              {item.growthPercent >= 0 ? '+' : ''}{item.growthPercent.toFixed(2)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getTrendBg(item.trend)}`}>
                              <FontAwesomeIcon icon={getTrendIcon(item.trend)} className={`h-4 w-4 ${getTrendColor(item.trend)}`} />
                            </div>
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
  );
};

export default StaffInflation;
