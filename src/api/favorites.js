import { authenticatedApiRequest } from './auth';

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

export function setFavorite(churchId, saved) {
  return authenticatedApiRequest(`/accounts/me/favorites/${encodeURIComponent(churchId)}`, { method: saved ? 'PUT' : 'DELETE' });
}
