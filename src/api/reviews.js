import { apiRequest } from './client';
import { authenticatedApiRequest } from './auth';

export async function listChurchReviews(churchId, page = 1) {
  const response = await apiRequest(`/churches/${encodeURIComponent(churchId)}/reviews?page=${page}&limit=10`);
  return { items: response.data?.reviews ?? [], pagination: response.meta, summary: response.data?.church?.rating ?? null };
}

export async function deleteChurchReview(churchId) {
  await authenticatedApiRequest(`/churches/${encodeURIComponent(churchId)}/reviews/me`, { method: 'DELETE' });
  return 'Your review was deleted.';
}

export async function saveChurchReview(churchId, review) {
  const path = `/churches/${encodeURIComponent(churchId)}/reviews`;
  const body = JSON.stringify(review);
  try {
    await authenticatedApiRequest(path, { method: 'POST', body });
    return 'Your review was submitted.';
  } catch (error) {
    if (error.status !== 409) throw error;
    await authenticatedApiRequest(`${path}/me`, { method: 'PATCH', body });
    return 'Your review was updated.';
  }
}
