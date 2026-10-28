import { authenticatedApiRequest } from './auth';

export function markNotificationRead(id) {
  return authenticatedApiRequest(`/accounts/me/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return authenticatedApiRequest('/accounts/me/notifications/read-all', { method: 'PATCH' });
}

export function deleteNotification(id) {
  return authenticatedApiRequest(`/accounts/me/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function listNotifications(page = 1) {
  const response = await authenticatedApiRequest(`/accounts/me/notifications?page=${page}&limit=20`);
  return {
    items: Array.isArray(response.data) ? response.data : response.data?.items ?? response.data?.notifications ?? [],
    pagination: response.meta,
    summary: response.meta?.unreadCount ?? null,
  };
}
