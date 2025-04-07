/**
 * CSRF protection utilities - SIMPLIFIED FOR DEBUGGING
 */

import { apiRequest } from "./queryClient";

// Cache for the CSRF token
let debugCsrfToken: string | null = 'debug-csrf-token';

/**
 * Fetches a CSRF token from the server - simplified for debugging
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    console.log("Fetching CSRF token - debug mode");
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    debugCsrfToken = data.csrfToken;
    console.log("Using debug CSRF token:", debugCsrfToken);
    return debugCsrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return 'debug-csrf-token';
  }
};

/**
 * Gets the current CSRF token
 */
export const getCsrfToken = async (): Promise<string> => {
  if (!debugCsrfToken) {
    await fetchCsrfToken();
  }
  return debugCsrfToken || 'debug-csrf-token';
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
 * Makes an API request with CSRF protection - debug version
 */
export const csrfRequest = async (
  method: string,
  url: string,
  data?: any,
  extraHeaders?: Record<string, string>
): Promise<Response> => {
  try {
    // Add CSRF token for everything except exempt endpoints
    if (method.toUpperCase() !== 'GET' && !isCsrfExempt(url)) {
      console.log(`Adding debug CSRF token to ${method} ${url}`);
      const headers = {
        ...(extraHeaders || {}),
        'X-CSRF-Token': await getCsrfToken(),
      };
      return apiRequest(method, url, data, headers);
    }
    
    return apiRequest(method, url, data, extraHeaders);
  } catch (error) {
    console.error(`Error in ${method} request to ${url}:`, error);
    throw error;
  }
};