/**
 * CSRF protection utilities
 * This module provides functions to fetch and use CSRF tokens for form submissions
 */

import { apiRequest } from "./queryClient";

// Store the current CSRF token
let csrfToken: string | null = null;

/**
 * Fetches a CSRF token from the server
 * @returns Promise with the CSRF token
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    console.log("Fetching new CSRF token");
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Retrieved CSRF token");
    csrfToken = data.csrfToken;
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

/**
 * Returns the current CSRF token or fetches a new one if none exists
 * @returns Promise with the CSRF token
 */
export const getCsrfToken = async (): Promise<string> => {
  if (!csrfToken) {
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
  const token = await getCsrfToken();
  return {
    ...headers,
    'CSRF-Token': token,
    'X-CSRF-Token': token,
  };
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
    if (method.toUpperCase() !== 'GET') {
      // Skip CSRF for authentication endpoints
      const skipCsrfPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];
      const shouldAddCsrf = !skipCsrfPaths.some(path => url.endsWith(path));
      
      if (shouldAddCsrf) {
        console.log(`Adding CSRF protection to ${method} ${url}`);
        const csrfHeaders = await addCsrfHeader(extraHeaders || {});
        return apiRequest(method, url, data, csrfHeaders);
      }
    }
    
    return apiRequest(method, url, data, extraHeaders);
  } catch (error) {
    // If we get a 403 error, it might be a CSRF token issue, try to get a new token and retry
    if (error instanceof Error && error.message.includes('403')) {
      console.log("CSRF token might be invalid or expired, getting a new one");
      await fetchCsrfToken(); // Get a fresh token
      
      if (method.toUpperCase() !== 'GET') {
        // Skip CSRF for authentication endpoints
        const skipCsrfPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];
        const shouldAddCsrf = !skipCsrfPaths.some(path => url.endsWith(path));
        
        if (shouldAddCsrf) {
          const csrfHeaders = await addCsrfHeader(extraHeaders || {});
          return apiRequest(method, url, data, csrfHeaders);
        }
      }
    }
    
    throw error;
  }
};