import { Divider, Stack, Text } from '@mantine/core';
import { useChurchSchedules } from '../../contexts/ChurchSchedulesContext';
import { Button, ContentCard, LoadMoreButton, RequestState, Section } from '../ui';

export default function ChurchSchedulesSection({ timezone }) {
  const schedules = useChurchSchedules();
  return (
    <>
      <Divider my="md" />
      <Section title="Mass schedule">
        <Text size="sm" c="dimmed">Recurring services. Times are local to the church{timezone ? ` (${timezone})` : ''}. Dated changes may apply.</Text>
        <RequestState {...schedules} isEmpty={!schedules.items.length} loadingMessage="Loading Mass schedules…" emptyMessage="No active Mass schedules are available for this church." />
        {schedules.status === 'error' && <Button variant="default" onClick={schedules.refresh}>Retry schedules</Button>}
        <Stack gap="xs">
          {schedules.items.map((schedule) => (
            <ContentCard key={schedule.id} padding="sm">
              <Stack gap={4}>
                <Text fw={600}>{schedule.dayOfWeek ? schedule.dayOfWeek.charAt(0) + schedule.dayOfWeek.slice(1).toLowerCase() : 'Service'} · {schedule.startTime}{schedule.endTime ? `–${schedule.endTime}` : ''}</Text>
                {(schedule.serviceType || schedule.language) && <Text size="sm">{[schedule.serviceType, schedule.language].filter(Boolean).join(' · ')}</Text>}
                {schedule.notes && <Text size="sm" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{schedule.notes}</Text>}
              </Stack>
            </ContentCard>
          ))}
        </Stack>
        <LoadMoreButton hasMore={schedules.hasMore} loading={schedules.loadingMore} onClick={schedules.loadMore}>Load more schedules</LoadMoreButton>
      </Section>
    </>
  );
}
