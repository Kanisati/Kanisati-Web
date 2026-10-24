import { authenticatedApiRequest } from './auth';

export async function getAccountProfile() {
  const response = await authenticatedApiRequest('/accounts/me');
  return response.data;
}

export async function updateAccountProfile(changes) {
  await authenticatedApiRequest('/accounts/me', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}
