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
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }
    
    const data = await response.json();
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
  // At this point csrfToken is guaranteed to be a string
  return csrfToken as string;
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
  // Only add CSRF tokens to non-GET requests
  if (method.toUpperCase() !== 'GET') {
    const csrfHeaders = await addCsrfHeader(extraHeaders);
    return apiRequest(method, url, data, csrfHeaders);
  }
  
  return apiRequest(method, url, data, extraHeaders);
};