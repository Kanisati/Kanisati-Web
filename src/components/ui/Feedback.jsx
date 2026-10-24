import { Alert } from '@mantine/core';
import { errorMessage } from '../../utils/errors';

export default function Feedback({ message, tone = 'error', ...props }) {
  if (!message) return null;
  return <Alert color={tone === 'success' ? 'green' : tone === 'warning' ? 'yellow' : 'red'} role={tone === 'error' ? 'alert' : 'status'} {...props}>{errorMessage(message)}</Alert>;
}
