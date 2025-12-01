import { API_BASE_URL } from '../config/api';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Enhanced fetch wrapper that handles authentication and authorization errors
 * Automatically redirects to appropriate pages on 401/403 errors
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { skipAuth = false, ...fetchOptions } = options;

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with custom headers if provided
  if (fetchOptions.headers) {
    Object.entries(fetchOptions.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  // Add Authorization header if not skipping auth and token exists
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Construct full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    // Make the fetch request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
      console.error('Unauthorized: Invalid or expired token');
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    // Handle authorization errors (forbidden)
    if (response.status === 403) {
      console.error('Forbidden: Insufficient permissions');
      // Redirect to unauthorized page
      window.location.href = '/unauthorized';
      throw new Error('You do not have permission to access this resource.');
    }

    return response;
  } catch (error) {
    // Re-throw if it's already our custom error
    if (error instanceof Error && 
        (error.message.includes('Session expired') || 
         error.message.includes('permission'))) {
      throw error;
    }

    // Handle network errors
    console.error('Network error:', error);
    throw new Error('Network error. Please check your connection.');
  }
};

/**
 * Helper function to make GET requests
 */
export const apiGet = async (endpoint: string, options?: FetchOptions) => {
  return authenticatedFetch(endpoint, { ...options, method: 'GET' });
};

/**
 * Helper function to make POST requests
 */
export const apiPost = async (endpoint: string, data?: any, options?: FetchOptions) => {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Helper function to make PUT requests
 */
export const apiPut = async (endpoint: string, data?: any, options?: FetchOptions) => {
  return authenticatedFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Helper function to make DELETE requests
 */
export const apiDelete = async (endpoint: string, options?: FetchOptions) => {
  return authenticatedFetch(endpoint, { ...options, method: 'DELETE' });
};

/**
 * Helper function to handle API response
 * Returns parsed JSON or throws error with message
 */
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // Parse and return JSON
  try {
    return await response.json();
  } catch (e) {
    // If response is empty or not JSON, return null
    return null;
  }
};
