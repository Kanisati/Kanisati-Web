export function fieldErrorMessage(messages) {
  if (!messages) return undefined;
  return Array.isArray(messages) ? messages.join('. ') : messages;
}

export function errorMessage(error, fallback = 'Could not complete your request.') {
  return typeof error === 'string' ? error : error?.message || fallback;
}
