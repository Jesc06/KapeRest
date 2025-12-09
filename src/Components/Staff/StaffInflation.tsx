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
  faFire
} from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../config/api';

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

  // Fetch inflation data from API
  useEffect(() => {
    const fetchInflationData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found');
          setIsLoading(false);
          return;
        }

        // For now, generate mock data - replace with actual API call
        const mockData = generateMockInflationData(selectedPeriod);
        setInflationData(mockData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching inflation data:', err);
        setIsLoading(false);
      }
    };

    fetchInflationData();
  }, [selectedPeriod]);

  // Generate mock data based on period
  const generateMockInflationData = (period: PeriodFilter): InflationData[] => {
    const data: InflationData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const currentRev = Math.random() * 50000 + 20000;
      const previousRev = Math.random() * 50000 + 20000;
      const growth = currentRev - previousRev;
      const growthPercent = (growth / previousRev) * 100;
      
      let periodLabel = '';
      let start = new Date(today);
      let end = new Date(today);
      
      if (period === 'daily') {
        start.setDate(today.getDate() - i);
        end = new Date(start);
        periodLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else if (period === 'weekly') {
        start.setDate(today.getDate() - (i * 7));
        end.setDate(start.getDate() + 6);
        periodLabel = `Week ${i + 1} (${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      } else if (period === 'monthly') {
        start.setMonth(today.getMonth() - i);
        start.setDate(1);
        end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        periodLabel = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (period === 'yearly') {
        start.setFullYear(today.getFullYear() - i);
        start.setMonth(0, 1);
        end.setFullYear(start.getFullYear(), 11, 31);
        periodLabel = start.getFullYear().toString();
      }
      
      data.push({
        id: i + 1,
        period: periodLabel,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        currentRevenue: currentRev,
        previousRevenue: previousRev,
        growthAmount: growth,
        growthPercent: growthPercent,
        trend: Math.abs(growthPercent) < 1 ? 'stable' : growthPercent > 0 ? 'up' : 'down'
      });
    }
    
    return data;
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
