/**
 * CSRF protection utilities
 * This module provides functions to fetch and use CSRF tokens for form submissions
 * Implements industry-standard CSRF protection patterns
 */

import { apiRequest } from "./queryClient";

// Cache for the CSRF token
let csrfToken: string | null = null;
let tokenExpiryTime: number | null = null;
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Fetches a fresh CSRF token from the server
 * @returns Promise with the CSRF token
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    console.log("Fetching new CSRF token");
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch CSRF token: ${response.status}`);
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Received new CSRF token");
    
    // Set token and expiry time
    csrfToken = data.csrfToken;
    tokenExpiryTime = Date.now() + TOKEN_LIFETIME;
    
    return csrfToken as string;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

/**
 * Returns the current CSRF token or fetches a new one if needed
 * @param forceRefresh - Force refresh the token even if the current one is valid
 * @returns Promise with the CSRF token
 */
export const getCsrfToken = async (forceRefresh = false): Promise<string> => {
  // If token doesn't exist, is expired, or force refresh is requested
  if (forceRefresh || !csrfToken || !tokenExpiryTime || Date.now() > tokenExpiryTime) {
    return fetchCsrfToken();
  }
  
  return csrfToken;
};

/**
 * Adds CSRF token to the request headers
 * @param headers - The headers object to add the CSRF token to
 * @returns Promise with the updated headers
 */
export const addCsrfHeader = async (headers: Record<string, string> = {}): Promise<Record<string, string>> => {
  try {
    const token = await getCsrfToken();
    // Include token in multiple header formats for maximum compatibility
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  } catch (error) {
    console.error('Error adding CSRF header:', error);
    throw error;
  }
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
 * Makes an API request with CSRF protection
 * @param method - The HTTP method
 * @param url - The URL to request
 * @param data - Optional data to send
 * @param extraHeaders - Optional extra headers
 * @returns Promise with the response
 */
export const csrfRequest = async (
  method: string,
  url: string,
  data?: any,
  extraHeaders?: Record<string, string>
): Promise<Response> => {
  try {
    // Only add CSRF tokens to non-GET requests that need protection
    if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
      console.log(`Adding CSRF protection to ${method} ${url}`);
      const csrfHeaders = await addCsrfHeader(extraHeaders || {});
      return apiRequest(method, url, data, csrfHeaders);
    }
    
    // No CSRF token needed for GET requests or exempt endpoints
    return apiRequest(method, url, data, extraHeaders);
  } catch (error) {
    // If we get a 403 error, it might be a CSRF token issue
    if (error instanceof Error && error.message.includes('403')) {
      console.warn("CSRF token might be invalid or expired, refreshing token and retrying request");
      
      // Get a fresh token
      await fetchCsrfToken();
      
      // Retry the request with the new token
      if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
        const csrfHeaders = await addCsrfHeader(extraHeaders || {});
        return apiRequest(method, url, data, csrfHeaders);
      }
    }
    
    // Log all errors for debugging
    console.error(`Error in ${method} request to ${url}:`, error);
    throw error;
  }
};