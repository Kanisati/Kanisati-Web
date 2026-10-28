import { Stack, Text } from '@mantine/core';
import { useEvents } from '../../contexts/EventsContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, Feedback } from '../ui';

export default function EventRegistration({ eventId, event }) {
  const { register } = useEvents();
  const form = useFormState({});
  const unavailable = event && (
    event.status !== 'PUBLISHED' ? 'Registration is unavailable for this event.'
      : !(new Date(event.startAt).getTime() > Date.now()) ? 'Registration has closed for this event.'
        : event.remainingCapacity != null && event.remainingCapacity <= 0 ? 'This event is full.' : ''
  );
  const submit = form.submit(async () => {
    if (!event || unavailable || form.message) return form.message;
    return register(eventId);
  });
  return (
    <Stack gap="sm" mt="md">
      <Feedback message={form.message} tone="success" />
      <Feedback message={form.error} />
      {!form.message && unavailable && <Text size="sm" c="dimmed">{unavailable}</Text>}
      <Button disabled={!event || Boolean(unavailable) || Boolean(form.message)} loading={form.submitting} onClick={submit}>
        {form.message ? 'Registered' : 'Register for event'}
      </Button>
    </Stack>
  );
}
