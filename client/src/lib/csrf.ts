/**
 * CSRF protection utilities - Phase 1 Implementation
 * This module provides industry-standard CSRF protection
 */

import { apiRequest } from "./queryClient";

// Cache for the CSRF token
let csrfToken = ''; // Initialize with empty string instead of null
let tokenExpiryTime: number | null = null;
const TOKEN_LIFETIME = 25 * 60 * 1000; // 25 minutes in milliseconds (shorter than server to account for clock drift)

/**
 * Fetches a CSRF token from the server
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    console.log("Fetching CSRF token");
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch CSRF token: ${response.status}`);
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.warn("CSRF token generation warning:", data.error);
    }
    
    csrfToken = data.csrfToken;
    tokenExpiryTime = Date.now() + TOKEN_LIFETIME;
    
    console.log("Successfully received CSRF token");
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // In Phase 1, we'll still allow fallback to debug token
    csrfToken = 'debug-csrf-token';
    return csrfToken;
  }
};

/**
 * Gets the current CSRF token or fetches a new one if needed
 */
export const getCsrfToken = async (forceRefresh = false): Promise<string> => {
  // If token is missing, expired, or force refresh is requested
  if (forceRefresh || !csrfToken || !tokenExpiryTime || Date.now() > tokenExpiryTime) {
    return fetchCsrfToken();
  }
  
  return csrfToken;
};

/**
 * Adds CSRF headers to a request
 */
export const addCsrfHeader = async (headers: Record<string, string> = {}): Promise<Record<string, string>> => {
  const token = await getCsrfToken();
  return {
    ...headers,
    'X-CSRF-Token': token,
  };
};

/**
 * List of endpoints exempt from CSRF protection in Phase 1
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
 * Makes an API request with CSRF protection
 */
export const csrfRequest = async (
  method: string,
  url: string,
  data?: any,
  extraHeaders?: Record<string, string>
): Promise<Response> => {
  try {
    // Only add CSRF token to non-GET, non-exempt requests
    if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
      console.log(`Adding CSRF protection to ${method} ${url}`);
      const csrfHeaders = await addCsrfHeader(extraHeaders || {});
      return apiRequest(method, url, data, csrfHeaders);
    }
    
    // No CSRF token needed for GET requests or exempt endpoints
    return apiRequest(method, url, data, extraHeaders);
  } catch (error) {
    // Special handling for CSRF errors (403)
    if (error instanceof Error && error.message.includes('403')) {
      console.warn("Possible CSRF token rejection, refreshing token and retrying", error);
      
      // Get a fresh token
      await fetchCsrfToken();
      
      // Retry the request with the new token
      if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
        const csrfHeaders = await addCsrfHeader(extraHeaders || {});
        return apiRequest(method, url, data, csrfHeaders);
      }
    }
    
    // Log and rethrow all other errors
    console.error(`Error in ${method} request to ${url}:`, error);
    throw error;
  }
};