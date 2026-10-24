import { Text } from '@mantine/core';
import { useEvents } from '../../contexts/EventsContext';
import { formatDate } from '../../utils/formatDate';
import { Button, CardGrid, ContentCard, LoadMoreButton, RequestState, Section } from '../ui';

export default function EventsSection() {
  const { events, selectEvent } = useEvents();
  return (
    <Section title="Upcoming events" description="Events from approved churches" mt="md">
      <RequestState {...events} isEmpty={!events.items.length} loadingMessage="Loading events…" emptyMessage="There are no upcoming events right now." />
      <CardGrid>{events.items.map((event) => (
        <ContentCard key={event.id}>
          <Text fw={600}>{event.title}</Text>
          <Text size="sm" c="dimmed">{event.church?.name}</Text>
          <Text size="sm">{formatDate(event.startAt, event.church?.timezone)}</Text>
          {event.location && <Text size="sm">{event.location}</Text>}
          {event.description && <Text size="sm" lineClamp={3}>{event.description}</Text>}
          {event.remainingCapacity != null && <Text size="xs" c="dimmed">{event.remainingCapacity} places remaining</Text>}
          <Button variant="subtle" size="sm" onClick={() => selectEvent(event.id)}>View event</Button>
        </ContentCard>
      ))}</CardGrid>
      <LoadMoreButton hasMore={events.hasMore} loading={events.loadingMore} onClick={events.loadMore}>Load more events</LoadMoreButton>
    </Section>
  );
}
