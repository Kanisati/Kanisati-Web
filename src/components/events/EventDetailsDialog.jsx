import { Stack, Text } from '@mantine/core';
import { useEvents } from '../../contexts/EventsContext';
import { useAuth } from '../../contexts/AuthContext';
import EventRegistration from './EventRegistration';
import { formatDate } from '../../utils/formatDate';
import { Button, Dialog, RequestState } from '../ui';

export default function EventDetailsDialog() {
  const { selectedEventId, closeEvent, detail } = useEvents();
  const { canUseUserFeatures, isSignedIn, accountKey } = useAuth();
  const event = detail.data;
  return (
    <Dialog opened={Boolean(selectedEventId)} onClose={closeEvent} title={event?.title || 'Event details'} size="md">
      <RequestState {...detail} loadingMessage="Loading event details…" isEmpty={!event} emptyMessage="Event details are unavailable." />
      {event && <Stack gap="sm">
        {event.church?.name && <Text fw={600}>{event.church.name}</Text>}
        <Text>{formatDate(event.startAt, event.church?.timezone)}</Text>
        {event.endAt && <Text size="sm" c="dimmed">Ends {formatDate(event.endAt, event.church?.timezone)}</Text>}
        {event.location && <Text>{event.location}</Text>}
        {event.description && <Text>{event.description}</Text>}
        {event.capacity != null && <Text size="sm">{event.remainingCapacity === 0 ? 'This event is full.' : `${event.remainingCapacity} of ${event.capacity} places remaining`}</Text>}
        {event.registrationUrl && <Button component="a" href={event.registrationUrl} target="_blank" rel="noreferrer">Registration information</Button>}
      </Stack>}
      {selectedEventId && canUseUserFeatures && <EventRegistration key={`${accountKey}:${selectedEventId}`} eventId={selectedEventId} event={event} />}
      {event && !isSignedIn && <Text size="sm" c="dimmed" mt="md">Sign in with a user account to register for this event.</Text>}
      {detail.error && <Button variant="default" mt="sm" onClick={detail.refresh}>Retry event details</Button>}
    </Dialog>
  );
}
