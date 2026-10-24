import { Text } from '@mantine/core';
import { useMassSchedule } from '../../contexts/MassScheduleContext';
import { formatDate } from '../../utils/formatDate';
import { CardGrid, ContentCard, LoadMoreButton, RequestState, Section } from '../ui';

export default function MassScheduleSection() {
  const occurrences = useMassSchedule();
  return (
    <Section title="Mass times near you" description="Upcoming Masses within 25 km over the next seven days" mt="md">
      {occurrences.status === 'idle' && <Text size="sm" c="dimmed">Choose “Use my location” above to find nearby Mass times. Your location is requested only after you choose.</Text>}
      <RequestState {...occurrences} isEmpty={!occurrences.items.length} loadingMessage="Loading nearby Mass times…" emptyMessage="No Mass times found within 25 km in the next seven days." />
      <CardGrid>{occurrences.items.map((occurrence) => (
        <ContentCard key={`${occurrence.id ?? occurrence.schedule?.id ?? occurrence.kind}-${occurrence.startsAt}-${occurrence.church?.id}`}>
          <Text fw={600}>{occurrence.church?.name || 'Church'}</Text>
          <Text size="sm">{formatDate(occurrence.startsAt, occurrence.church?.timezone)}</Text>
          <Text size="sm" c="dimmed">{[occurrence.schedule?.serviceType, occurrence.schedule?.language, occurrence.church?.city].filter(Boolean).join(' · ')}</Text>
          {occurrence.distanceKm != null && <Text size="xs" c="dimmed">{Number(occurrence.distanceKm).toFixed(1)} km away</Text>}
        </ContentCard>
      ))}</CardGrid>
      <LoadMoreButton hasMore={occurrences.hasMore} loading={occurrences.loadingMore} onClick={occurrences.loadMore}>Load more Mass times</LoadMoreButton>
    </Section>
  );
}
