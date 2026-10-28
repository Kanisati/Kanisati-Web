import { ApiError, apiRequest } from './client';

const SESSION_KEY = 'kanisati.session';
let refreshPromise = null;

export function readSession() {
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event('kanisati:session-change'));
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('kanisati:session-change'));
}

export async function signIn(credentials) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return response.data;
}

export async function registerUser(details) {
  const response = await apiRequest('/auth/register/user', {
    method: 'POST',
    body: JSON.stringify(details),
  });
  return response.data;
}

export async function signOut(refreshToken) {
  if (!refreshToken) return;
  await apiRequest('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function signOutAllDevices() {
  await authenticatedApiRequest('/auth/logout-all', { method: 'POST' });
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const currentSession = readSession();
      if (!currentSession?.refreshToken) {
        throw new ApiError('Your session has expired. Please sign in again.', { status: 401 });
      }

      try {
        const response = await apiRequest('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: currentSession.refreshToken }),
        });
        const nextSession = {
          ...currentSession,
          ...response.data,
          account: response.data?.account ?? currentSession.account,
          user: response.data?.user ?? currentSession.user,
        };
        saveSession(nextSession);
        return nextSession;
      } catch (error) {
        clearSession();
        throw error;
      }
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/** Retry an authenticated request once after a coordinated refresh-token rotation. */
export async function authenticatedApiRequest(path, init = {}) {
  const session = readSession();
  if (!session?.accessToken) {
    throw new ApiError('Please sign in to continue.', { status: 401 });
  }

  try {
    return await apiRequest(path, { ...init, accessToken: session.accessToken });
  } catch (error) {
    if (error.status !== 401 || !session.refreshToken) throw error;
    const latestSession = readSession();
    if (latestSession?.accessToken && latestSession.accessToken !== session.accessToken) {
      return apiRequest(path, { ...init, accessToken: latestSession.accessToken });
    }
    const refreshedSession = await refreshSession();
    return apiRequest(path, { ...init, accessToken: refreshedSession.accessToken });
  }
}
