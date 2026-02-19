interface ApiResponse<T = any> {
  data: T;
  ret: number;
  msg: string;
  timestamp: number;
}

/**
 * API request wrapper with error handling.
 * In development, requests are proxied to the Fastify server via Vite proxy.
 */
export async function request<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  const json: ApiResponse<T> = await response.json();

  if (json.ret !== 0) {
    throw new Error(json.msg || 'Request failed');
  }

  return json;
}

/**
 * POST request shorthand
 */
export async function post<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
  return request<T>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Raw POST for endpoints that don't use the { data, ret, msg } wrapper.
 */
export async function postRaw<T = any>(
  url: string,
  body: any,
  options: RequestInit = {},
): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
