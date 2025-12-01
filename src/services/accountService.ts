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
  // API returns { TotalUsers: number }
  return data?.TotalUsers ?? 0;
};
