import { apiRequest } from './client';

export async function listChurchSchedules(churchId, page = 1) {
  const response = await apiRequest(`/mass-schedules/churches/${encodeURIComponent(churchId)}?page=${page}&limit=20`);
  return {
    items: Array.isArray(response.data) ? response.data : response.data?.items ?? response.data?.schedules ?? [],
    pagination: response.pagination ?? response.meta,
  };
}

export async function listMassOccurrences(query, page = 1) {
  const params = new URLSearchParams({ ...query, page: String(page), limit: '20' });
  const response = await apiRequest(`/mass-schedules/search?${params}`);
  return { items: response.data ?? [], pagination: response.pagination };
}
