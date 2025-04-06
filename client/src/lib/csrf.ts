/**
 * CSRF protection utilities
 * This module provides functions to fetch and use CSRF tokens for form submissions
 * 
 * NOTE: CSRF protection is temporarily disabled to fix authentication issues
 */

import { apiRequest } from "./queryClient";

// Store the current CSRF token (dummy for now)
let csrfToken: string = 'dummy-csrf-token';

/**
 * Fetches a CSRF token from the server (mocked for now)
 * @returns Promise with the CSRF token
 */
export const fetchCsrfToken = async (): Promise<string> => {
  return Promise.resolve('dummy-csrf-token');
};

/**
 * Returns the current CSRF token
 * @returns Promise with the CSRF token
 */
export const getCsrfToken = async (): Promise<string> => {
  return Promise.resolve(csrfToken);
};

/**
 * Adds CSRF token to the request headers (mocked for now)
 * @param headers - The headers object to add the CSRF token to
 * @returns Promise with the updated headers
 */
export const addCsrfHeader = async (headers: Record<string, string> = {}): Promise<Record<string, string>> => {
  return Promise.resolve(headers);
};

/**
 * Makes an API request with CSRF protection (bypassed for now)
 * Simply passes through to apiRequest while we fix authentication issues
 */
export const csrfRequest = async (
  method: string,
  url: string,
  data?: any,
  extraHeaders?: Record<string, string>
): Promise<Response> => {
  return apiRequest(method, url, data, extraHeaders);
};