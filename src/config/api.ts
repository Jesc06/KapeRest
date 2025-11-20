// API Base URL Configuration
// Use proxy in development, full URL in production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? '/api' : 'https://localhost:7214/api'
);
