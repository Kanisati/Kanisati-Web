import { apiRequest } from './client';

export async function findChurches(query, position) {
  const params = new URLSearchParams({ page: '1', limit: '50', sort: position ? 'distance' : 'name' });
  if (query.trim()) params.set('q', query.trim());
  if (position) {
    params.set('latitude', String(position[0]));
    params.set('longitude', String(position[1]));
    params.set('radiusKm', '25');
  }
  const response = await apiRequest(`/churches${position ? '/nearby' : ''}?${params}`);
  return response.data?.items ?? [];
}

export async function getChurch(churchId) {
  const response = await apiRequest(`/churches/${encodeURIComponent(churchId)}`);
  return response.data;
}
