import { authenticatedApiRequest } from './auth';

export async function deactivateAccount() {
  await authenticatedApiRequest('/accounts/me', { method: 'DELETE' });
}

export async function changeAccountPassword({ currentPassword, newPassword }) {
  await authenticatedApiRequest('/accounts/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return 'Your password was changed.';
}

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
