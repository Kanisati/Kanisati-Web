import { apiRequest } from './client';

export async function listChurchEvents(churchId, page = 1) {
  const response = await apiRequest(`/events/churches/${encodeURIComponent(churchId)}?page=${page}&limit=20`);
  return { items: response.data ?? [], pagination: response.pagination };
}

export async function listEvents(page = 1) {
  const response = await apiRequest(`/events?page=${page}&limit=20`);
  return { items: response.data ?? [], pagination: response.pagination };
}

export async function getEvent(eventId) {
  const response = await apiRequest(`/events/${encodeURIComponent(eventId)}`);
  return response.data;
}
