import { apiRequest } from './client';

export async function listMassOccurrences(query, page = 1) {
  const params = new URLSearchParams({ ...query, page: String(page), limit: '20' });
  const response = await apiRequest(`/mass-schedules/search?${params}`);
  return { items: response.data ?? [], pagination: response.pagination };
}
