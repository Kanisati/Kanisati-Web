import { authenticatedApiRequest } from './auth';

export async function listFavorites(page = 1) {
  const response = await authenticatedApiRequest(`/accounts/me/favorites?page=${page}&limit=20`);
  const data = response.data;
  return { items: Array.isArray(data) ? data : data?.items ?? data?.favorites ?? [], pagination: response.meta };
}

export async function listFavoriteIds() {
  const ids = [];
  let page = 1;
  let totalPages;
  do {
    const response = await authenticatedApiRequest(`/accounts/me/favorites?page=${page}&limit=50`);
    const data = response.data;
    const favorites = Array.isArray(data) ? data : data?.items ?? data?.favorites ?? [];
    ids.push(...favorites.map((favorite) => favorite.churchId ?? favorite.church?.id ?? favorite.id).filter(Boolean).map(String));
    totalPages = response.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);
  return ids;
}

export async function setFavorite(churchId, saved) {
  const response = await authenticatedApiRequest(`/accounts/me/favorites/${encodeURIComponent(churchId)}`, { method: saved ? 'PUT' : 'DELETE' });
  window.dispatchEvent(new Event('kanisati:favorites-change'));
  return response;
}
