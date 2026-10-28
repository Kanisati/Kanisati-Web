import { authenticatedApiRequest } from './auth';

export async function cancelEventRegistration(eventId) {
  await authenticatedApiRequest(`/events/${encodeURIComponent(eventId)}/registrations`, { method: 'DELETE' });
}

export async function registerForEvent(eventId) {
  await authenticatedApiRequest(`/events/${encodeURIComponent(eventId)}/registrations`, { method: 'POST' });
}

export async function listRegistrations(page = 1, upcomingOnly = true) {
  const query = new URLSearchParams({ page: String(page), limit: '20' });
  if (upcomingOnly) query.set('upcoming', 'true');
  const response = await authenticatedApiRequest(`/events/registrations/mine?${query}`);
  return {
    items: Array.isArray(response.data) ? response.data : response.data?.items ?? response.data?.registrations ?? [],
    pagination: response.pagination ?? response.meta,
  };
}
