import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faBuilding, faUsers, faMapMarkerAlt, faSearch, faPlus, faEdit, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
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
    const branchData: BranchResponse = {
      id: branch.id,
      branchName: branch.branchName,
      location: branch.location,
      staff: branch.manager,
      status: branch.status
    };
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
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-stone-50 to-orange-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      <div className="relative z-10 flex h-screen overflow-hidden">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isExpanded={sidebarExpanded} />
      
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'}`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-all duration-200 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hidden lg:flex h-11 w-11 items-center justify-center rounded-lg border border-stone-200 dark:border-neutral-700 bg-stone-50 dark:bg-neutral-700 hover:bg-stone-100 dark:hover:bg-neutral-600 text-orange-600 dark:text-orange-400 transition-all duration-200 active:scale-95"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-neutral-900 dark:text-white">Branch Management</h1>
            </div>
            <LogoutPanel />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50/50 to-orange-50/30 dark:from-neutral-900 dark:to-neutral-800/50">
            <div className="w-full px-4 sm:px-5 md:px-6 py-5 sm:py-6">
              {/* Page Header */}
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                    <FontAwesomeIcon icon={faBuilding} className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white mb-2">
                      Branch Locations
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                      Manage all branch locations and their staff members
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border-2 border-stone-200 dark:border-neutral-700 p-6 mb-6 shadow-lg">
                <div className="flex flex-col gap-6">
                  {/* Search Bar */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                      <label className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Search Branches
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by branch name, location, or manager..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Filters Row */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                      <label className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Filter Options
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Location Filter */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full appearance-none pl-12 pr-12 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <option value="all">All Locations</option>
                            {locations.filter(loc => loc !== 'all').map(location => (
                              <option key={location} value={location}>
                                {location}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                          Status
                        </label>
                        <div className="relative">
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full appearance-none pl-12 pr-12 py-3.5 rounded-xl border-2 border-stone-200 dark:border-neutral-700 bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-800 dark:to-orange-950/20 text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <option value="all">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <FontAwesomeIcon icon={faBuilding} className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Branch Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-stone-200 dark:border-neutral-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                        Showing <span className="text-orange-600 dark:text-orange-400 font-black">{filteredBranches.length}</span> of <span className="font-black">{branches.length}</span> branches
                      </p>
                    </div>
                    <button 
                      onClick={() => setIsAddBranchOpen(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm uppercase tracking-wide hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                      Add Branch
                    </button>
                  </div>
                </div>
              </div>

              {/* Branches Table */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl border-2 border-stone-200 dark:border-neutral-700 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
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
          </main>
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
