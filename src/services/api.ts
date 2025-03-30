
import { getAuthToken } from '@/lib/firebase';

const API_URL = 'https://api.taskify.com'; // Mock URL

// Custom fetch with auth token
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

// Helper functions for API calls
export const api = {
  // Generic GET request
  get: async <T>(endpoint: string): Promise<T> => {
    // For demo purposes, simulate API calls with mock data
    console.log(`GET request to ${endpoint}`);
    
    // In a real application, you would do:
    // const response = await fetchWithAuth(endpoint);
    // if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // return response.json();
    
    // Mock success case
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
  
  // Generic POST request
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    console.log(`POST request to ${endpoint}`, data);
    
    // In a real application, you would do:
    // const response = await fetchWithAuth(endpoint, {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
    // if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // return response.json();
    
    // Mock success case
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
  
  // Generic PUT request
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    console.log(`PUT request to ${endpoint}`, data);
    
    // In a real application, you would do:
    // const response = await fetchWithAuth(endpoint, {
    //   method: 'PUT',
    //   body: JSON.stringify(data),
    // });
    // if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // return response.json();
    
    // Mock success case
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as T);
      }, 500);
    });
  },
  
  // Generic DELETE request
  delete: async (endpoint: string): Promise<void> => {
    console.log(`DELETE request to ${endpoint}`);
    
    // In a real application, you would do:
    // const response = await fetchWithAuth(endpoint, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    // Mock success case
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
};
