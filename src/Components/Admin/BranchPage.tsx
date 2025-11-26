import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBuilding, faUsers, faMapMarkerAlt, faSearch, faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import LogoutPanel from '../Shared/LogoutPanel';
import AddBranch from './AddBranch';
import EditBranch from './EditBranch';
import { API_BASE_URL } from '../../config/api';

interface BranchResponse {
  id: number;
  branchName: string;
  location: string;
  staff: string;
  status: string;
}

interface Branch {
  id: number;
  branchName: string;
  location: string;
  manager: string;
  staffCount: number;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

const BranchPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }
        
        const response = await fetch(`${API_BASE_URL}/Branch/GetAllBranch`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }
        
        const data: BranchResponse[] = await response.json();
        console.log('Fetched branches:', data);
        
        // Transform API data to Branch format
        const transformedBranches: Branch[] = data.map(branch => {
          const manager = branch.staff || 'N/A';
          const status = manager === 'N/A' ? 'Inactive' : (branch.status === 'Active' ? 'Active' : 'Inactive');
          
          return {
            id: branch.id,
            branchName: branch.branchName,
            location: branch.location,
            manager: manager,
            staffCount: 0,
            status: status as 'Active' | 'Inactive',
            createdDate: new Date().toISOString().split('T')[0],
          };
        });
        
        setBranches(transformedBranches);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError(err instanceof Error ? err.message : 'Failed to load branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleAddBranch = (branchData: BranchResponse) => {
    console.log('Received branch data from API:', branchData);
    
    const manager = branchData.staff || 'N/A';
    const status = manager === 'N/A' ? 'Inactive' : (branchData.status === 'Active' ? 'Active' : 'Inactive');
    
    const newBranch: Branch = {
      id: branchData.id,
      branchName: branchData.branchName,
      location: branchData.location,
      manager: manager,
      staffCount: 0,
      status: status as 'Active' | 'Inactive',
      createdDate: new Date().toISOString().split('T')[0],
    };
    
    setBranches([...branches, newBranch]);
    console.log('Branch added to list:', newBranch);
  };

  const handleUpdateBranch = (branchData: BranchResponse) => {
    console.log('Updating branch:', branchData);
    
    const manager = branchData.staff || 'N/A';
    const status = manager === 'N/A' ? 'Inactive' : (branchData.status === 'Active' ? 'Active' : 'Inactive');
    
    setBranches(branches.map(branch => 
      branch.id === branchData.id 
        ? {
            ...branch,
            branchName: branchData.branchName,
            location: branchData.location,
            manager: manager,
            status: status as 'Active' | 'Inactive',
          }
        : branch
    ));
    setIsEditBranchOpen(false);
    setSelectedBranch(null);
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditBranchOpen(true);
  };

  const handleDeleteBranch = async (branchId: number) => {
    if (!confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found.');
      }

      const response = await fetch(`${API_BASE_URL}/Branch/DeleteBranch?id=${branchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Delete response:', responseText);

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }

      // Remove branch from list
      setBranches(branches.filter(branch => branch.id !== branchId));
      console.log('Branch deleted successfully');
      alert('Branch deleted successfully!');

    } catch (err) {
      console.error('Error deleting branch:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete branch');
    }
  };

  // Get unique locations for filter
  const locations = ['all', ...Array.from(new Set(branches.map(b => b.location)))];

  // Filter branches
  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         branch.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         branch.manager.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    const matchesLocation = filterLocation === 'all' || branch.location === filterLocation;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-50 via-stone-50 to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-stone-950">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />
      
        <div className={`flex h-screen w-full flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Premium Header with Glass Morphism */}
          <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 dark:bg-neutral-900/80 border-b border-stone-200/50 dark:border-neutral-700/50 shadow-lg shadow-black/5">
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
                    className="hidden lg:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-neutral-700 dark:to-neutral-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/40 dark:hover:to-orange-800/40 text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 border border-stone-300 dark:border-neutral-600 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 hover:scale-105"
                  >
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                  </button>

                  <div className="hidden sm:flex items-center gap-3">
                    <div>
                      <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">Branch Management</h1>
                      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Manage locations and staff</p>
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
              
              {/* Search and Add Button Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-xl border-2 border-stone-200 dark:border-neutral-700 focus-within:border-orange-500 dark:focus-within:border-orange-500 px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="h-5 w-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-orange-500 transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Search branches..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
                    />
                    {searchQuery && (
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30">
                        {filteredBranches.length} found
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => setIsAddBranchOpen(true)}
                  className="flex items-center justify-center gap-2.5 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                  <span className="text-sm">Add Branch</span>
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterStatus === 'all'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('Active')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterStatus === 'Active'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-green-500 dark:hover:border-green-500'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('Inactive')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    filterStatus === 'Inactive'
                      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-red-500 dark:hover:border-red-500'
                  }`}
                >
                  Inactive
                </button>
                
                <div className="h-8 w-px bg-stone-200 dark:bg-neutral-700 mx-2"></div>
                
                <div className="relative">
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="appearance-none px-4 py-2.5 pr-10 rounded-xl bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-2 border-stone-200 dark:border-neutral-700 hover:border-orange-500 dark:hover:border-orange-500 font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="all">All Locations</option>
                    {locations.filter(loc => loc !== 'all').map(location => (
                      <option key={location} value={location}>
                        {location}
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

              {/* Branches Table */}
              <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-neutral-800 shadow-2xl shadow-black/10 overflow-hidden border border-stone-200 dark:border-neutral-700">
                <div className="flex-shrink-0 relative overflow-hidden border-b-2 border-orange-500/20 bg-gradient-to-r from-white via-orange-50/30 to-white dark:from-neutral-800 dark:via-orange-950/20 dark:to-neutral-800">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-600"></div>
                  
                  <div className="px-6 sm:px-8 py-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                          <FontAwesomeIcon icon={faBuilding} className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Branch Locations</h3>
                          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">All branch records</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b-2 border-stone-200 dark:border-neutral-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Branch Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Location
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Manager
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-neutral-700">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent mb-4"></div>
                              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Loading branches...</p>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/30">
                                <FontAwesomeIcon icon={faBuilding} className="h-8 w-8 text-red-400 dark:text-red-500" />
                              </div>
                              <p className="text-base font-bold text-red-600 dark:text-red-400 mb-2">Failed to load branches</p>
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
                            </div>
                          </td>
                        </tr>
                      ) : filteredBranches.length > 0 ? (
                        filteredBranches.map((branch) => (
                          <tr key={branch.id} className="group hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md">
                                  <FontAwesomeIcon icon={faBuilding} className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-neutral-900 dark:text-white">{branch.branchName}</p>
                                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">ID: {branch.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="h-3.5 w-3.5 text-orange-500" />
                                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{branch.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUsers} className="h-3.5 w-3.5 text-orange-500" />
                                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{branch.manager}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                branch.status === 'Active'
                                  ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                                  : 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                              }`}>
                                {branch.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEditClick(branch)}
                                  className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors duration-200 flex items-center justify-center group/btn"
                                >
                                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteBranch(branch.id)}
                                  className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors duration-200 flex items-center justify-center group/btn"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <FontAwesomeIcon icon={faBuilding} className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
                              <p className="text-lg font-bold text-neutral-500 dark:text-neutral-400">No branches found</p>
                              <p className="text-sm text-neutral-400 dark:text-neutral-500">Try adjusting your filters or search query</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      <AddBranch
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        onSubmit={handleAddBranch}
      />

      {/* Edit Branch Modal */}
      <EditBranch
        isOpen={isEditBranchOpen}
        onClose={() => {
          setIsEditBranchOpen(false);
          setSelectedBranch(null);
        }}
        onUpdate={handleUpdateBranch}
        branch={selectedBranch ? {
          id: selectedBranch.id,
          branchName: selectedBranch.branchName,
          location: selectedBranch.location,
          staff: selectedBranch.manager,
          status: selectedBranch.status
        } : null}
      />
    </div>
  );
};

export default BranchPage;
