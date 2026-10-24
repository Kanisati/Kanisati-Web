
const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_BASE_URL = `${configuredApiUrl.replace(/\/+$/, '')}/api/v1`;
const inFlightGetRequests = new Map();

/** Error returned by the Kanisati API with its HTTP status and validation details. */
export class ApiError extends Error {
  constructor(message, { status, errors, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.body = body;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

/** Make a request to the versioned API and return its endpoint envelope unchanged. */
export async function apiRequest(path, { accessToken, ...init } = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  if (init.body != null && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const method = (init.method || 'GET').toUpperCase();
  const canDeduplicate = method === 'GET' && init.body == null && !init.signal;
  const requestKey = JSON.stringify({
    url,
    headers: [...headers.entries()].sort(([left], [right]) => left.localeCompare(right)),
    credentials: init.credentials,
    cache: init.cache,
  });

  if (canDeduplicate && inFlightGetRequests.has(requestKey)) {
    return inFlightGetRequests.get(requestKey);
  }

  const request = performRequest(url, headers, init);
  if (!canDeduplicate) return request;

  inFlightGetRequests.set(requestKey, request);
  try {
    return await request;
  } finally {
    if (inFlightGetRequests.get(requestKey) === request) {
      inFlightGetRequests.delete(requestKey);
    }
  }
}

async function performRequest(url, headers, init) {
  let response;
  try {
    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch (cause) {
    throw new ApiError(cause instanceof Error ? cause.message : 'Network request failed', {
      body: cause,
    });
  }

  const body = await parseResponse(response);
  if (!response.ok) {
    throw new ApiError(
      body && typeof body === 'object' && body.message
        ? body.message
        : `Request failed with status ${response.status}`,
      { status: response.status, errors: body?.errors, body },
    );
  }

  return body;
}

export const apiBaseUrl = API_BASE_URL;
