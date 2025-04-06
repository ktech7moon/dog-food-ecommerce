import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Throws an error if the response is not OK
 * Attempts to parse error message from JSON response
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse JSON error
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Fall back to text if not JSON or no message
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      // If JSON parsing fails, use the status text
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

/**
 * Makes an API request with proper error handling and CSRF protection
 * @param method - HTTP method 
 * @param url - API endpoint
 * @param data - Optional request data
 * @param extraHeaders - Optional additional headers
 * @returns The fetch response
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  let headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(extraHeaders || {})
  };
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
