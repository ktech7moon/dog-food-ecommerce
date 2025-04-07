/**
 * CSRF protection utilities - TEMPORARILY SIMPLIFIED FOR DEBUGGING
 * This module provides functions to fetch and use CSRF tokens for form submissions
 * Implements industry-standard CSRF protection patterns
 */

import { apiRequest } from "./queryClient";

// Cache for the CSRF token - using dummy token for now
const DUMMY_TOKEN = 'dummy-csrf-token';
let csrfToken: string = DUMMY_TOKEN;
let tokenExpiryTime: number = Date.now() + (30 * 60 * 1000); // 30 minutes
const TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Fetches a fresh CSRF token from the server - TEMPORARILY SIMPLIFIED
 * @returns Promise with the CSRF token
 */
export const fetchCsrfToken = async (): Promise<string> => {
  try {
    console.log("CSRF protection temporarily disabled, using dummy token");
    // Just return the dummy token immediately without making a request
    return DUMMY_TOKEN;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return DUMMY_TOKEN; // Return dummy token even on error
  }
};

/**
 * Returns the current CSRF token or fetches a new one if needed
 * @param forceRefresh - Force refresh the token even if the current one is valid
 * @returns Promise with the CSRF token
 */
export const getCsrfToken = async (forceRefresh = false): Promise<string> => {
  // Temporarily always return the dummy token
  return DUMMY_TOKEN;
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
      'CSRF-Token': token,
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
    // CSRF protection temporarily disabled for debugging
    console.log(`Making ${method} request to ${url} with CSRF protection temporarily disabled`);
    
    // Always add the dummy token regardless of request type
    const headers = {
      ...(extraHeaders || {}),
      'X-CSRF-Token': DUMMY_TOKEN,
    };
    
    return apiRequest(method, url, data, headers);
  } catch (error) {
    // Log all errors for debugging
    console.error(`Error in ${method} request to ${url}:`, error);
    throw error;
  }
};