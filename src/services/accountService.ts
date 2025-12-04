import { API_BASE_URL } from '../config/api';

export const getTotalUsers = async (token?: string): Promise<number> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/Auth/total-users`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch total users: ${response.status}`);
  }

  const data = await response.json();
  console.log('Total Users API Response:', data);
  
  // Handle different possible response formats
  if (typeof data === 'number') {
    return data;
  }
  
  // Try different possible property names (case-insensitive)
  return data?.TotalUsers ?? data?.totalUsers ?? data?.count ?? data?.Count ?? 0;
};

export const getTotalBranches = async (token?: string): Promise<number> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/Branch/GetAllBranch`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: ${response.status}`);
  }

  const data = await response.json();
  console.log('Branches API Response:', data);
  
  // If response is an array, return its length
  if (Array.isArray(data)) {
    return data.length;
  }
  
  // If response has a count property
  return data?.count ?? data?.Count ?? data?.totalBranches ?? data?.TotalBranches ?? 0;
};

export const getTotalRevenue = async (token?: string): Promise<number> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/OverAllSales/AdminOverAllSales`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch total revenue: ${response.status}`);
  }

  const data = await response.json();
  console.log('Overall Sales API Response:', data);
  
  // If response is an array, sum all 'total' values for completed transactions
  if (Array.isArray(data)) {
    const totalRevenue = data
      .filter((transaction: any) => 
        transaction.status?.toLowerCase() === 'completed' || 
        !transaction.status // Include if no status field (assume completed)
      )
      .reduce((sum: number, transaction: any) => sum + (transaction.total || 0), 0);
    
    console.log('Calculated Total Revenue from Completed Sales:', totalRevenue);
    return totalRevenue;
  }
  
  // Fallback to single object response
  return data?.total ?? data?.Total ?? 0;
};
