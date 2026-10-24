import { Group, Loader, Stack, Text } from '@mantine/core';
import Feedback from './Feedback';

export default function RequestState({ status, error, isEmpty, loadingMessage = 'Loading…', emptyMessage = 'Nothing to show yet.' }) {
  if (status !== 'loading' && !error && !(status === 'success' && isEmpty)) return null;
  return (
    <Stack gap="xs" aria-live="polite">
      {status === 'loading' && <Group role="status" gap="xs"><Loader size="sm" /><Text size="sm">{loadingMessage}</Text></Group>}
      <Feedback message={error} />
      {status === 'success' && isEmpty && <Text size="sm" c="dimmed">{emptyMessage}</Text>}
    </Stack>
  );
}
