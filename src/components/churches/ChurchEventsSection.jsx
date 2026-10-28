import { Divider, Stack, Text } from '@mantine/core';
import { useChurchEvents } from '../../contexts/ChurchEventsContext';
import { useDiscovery } from '../../contexts/DiscoveryContext';
import { useEvents } from '../../contexts/EventsContext';
import { formatDate } from '../../utils/formatDate';
import { Button, ContentCard, LoadMoreButton, RequestState, Section } from '../ui';

export default function ChurchEventsSection({ timezone }) {
  const events = useChurchEvents();
  const { closeChurch } = useDiscovery();
  const { selectEvent } = useEvents();
  const openEvent = (id) => {
    closeChurch();
    selectEvent(id);
  };
  return (
    <>
      <Divider my="md" />
      <Section title="Upcoming events">
        <RequestState {...events} isEmpty={!events.items.length} loadingMessage="Loading church events…" emptyMessage="No upcoming events are published for this church." />
        {events.status === 'error' && <Button variant="default" onClick={events.refresh}>Retry events</Button>}
        <Stack gap="sm">
          {events.items.map((event) => (
            <ContentCard key={event.id} padding="sm">
              <Stack gap="xs">
                <Text fw={600} style={{ overflowWrap: 'anywhere' }}>{event.title}</Text>
                <Text size="sm">{formatDate(event.startAt, timezone)}{timezone ? ` (${timezone})` : ''}</Text>
                {event.endAt && <Text size="sm" c="dimmed">Ends {formatDate(event.endAt, timezone)}</Text>}
                {event.location && <Text size="sm">{event.location}</Text>}
                {event.remainingCapacity != null && <Text size="sm" c="dimmed">{event.remainingCapacity <= 0 ? 'This event is full.' : `${event.remainingCapacity} places remaining`}</Text>}
                <Button variant="light" onClick={() => openEvent(event.id)} aria-label={`View details for ${event.title}`}>View event</Button>
              </Stack>
            </ContentCard>
          ))}
        </Stack>
        <LoadMoreButton hasMore={events.hasMore} loading={events.loadingMore} onClick={events.loadMore}>Load more events</LoadMoreButton>
      </Section>
    </>
  );
}
