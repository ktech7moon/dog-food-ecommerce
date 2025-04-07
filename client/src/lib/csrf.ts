/**
 * Simple and reliable CSRF protection
 * This approach uses a double-submit pattern with both cookies and headers
 */

import { apiRequest } from "./queryClient";

// Keep the token in memory
let csrfToken = '';

/**
 * Get the CSRF token from cookies
 */
const getTokenFromCookie = (): string | null => {
  // Extract XSRF-TOKEN from cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'XSRF-TOKEN') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * Fetch a fresh CSRF token from the server
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    console.log('Fetching CSRF token from server');
    
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    csrfToken = data.csrfToken;
    
    console.log('CSRF token retrieved successfully');
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    
    // Try to use the token from cookies as fallback
    const cookieToken = getTokenFromCookie();
    if (cookieToken) {
      console.log('Using CSRF token from cookie');
      csrfToken = cookieToken;
      return cookieToken;
    }
    
    throw error;
  }
};

/**
 * Get the current CSRF token or fetch a new one
 */
export const getCsrfToken = async (): Promise<string> => {
  // If we already have a token in memory, use it
  if (csrfToken) {
    return csrfToken;
  }
  
  // Try to get token from cookies
  const cookieToken = getTokenFromCookie();
  if (cookieToken) {
    console.log('Using CSRF token from cookie');
    csrfToken = cookieToken;
    return cookieToken;
  }
  
  // If no token is available, fetch a new one
  return fetchCsrfToken();
};

/**
 * Add CSRF token to request headers
 */
export const addCsrfHeader = async (headers: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await getCsrfToken();
  return {
    ...headers,
    'X-CSRF-Token': token,
    'X-XSRF-Token': token,
  };
};

/**
 * List of endpoints that don't need CSRF protection
 */
const csrfExemptEndpoints = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/csrf-token'
];

/**
 * Check if a URL is exempt from CSRF protection
 */
const isCsrfExempt = (url: string): boolean => {
  return csrfExemptEndpoints.some(endpoint => url.endsWith(endpoint));
};

/**
 * Make a CSRF-protected API request
 */
export const csrfRequest = async (
  method: string,
  url: string,
  data?: any,
  extraHeaders?: Record<string, string>
): Promise<Response> => {
  try {
    // Only add CSRF tokens to non-GET, non-exempt requests
    if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
      console.log(`Adding CSRF protection to ${method} ${url}`);
      
      // For POST requests, always fetch a fresh token to ensure it's valid
      if (method.toUpperCase() === 'POST') {
        await fetchCsrfToken();
      }
      
      const csrfHeaders = await addCsrfHeader(extraHeaders || {});
      
      // Log the token we're using for debugging
      console.log(`Using CSRF token: ${csrfHeaders['X-CSRF-Token'].substring(0, 10)}...`);
      
      return apiRequest(method, url, data, csrfHeaders);
    }
    
    // For GET requests or exempt endpoints, don't add CSRF token
    return apiRequest(method, url, data, extraHeaders);
  } catch (error) {
    // If we get a 403 error, it might be a CSRF token issue
    if (error instanceof Error && error.message.includes('403')) {
      console.warn('CSRF token might be invalid, refreshing token and retrying');
      
      // Fetch a new token
      await fetchCsrfToken();
      
      // Retry the request with the new token
      if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
        const csrfHeaders = await addCsrfHeader(extraHeaders || {});
        return apiRequest(method, url, data, csrfHeaders);
      }
    }
    
    throw error;
  }
};