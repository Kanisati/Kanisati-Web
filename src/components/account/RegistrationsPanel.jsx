import { Badge, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useRegistrations } from '../../contexts/RegistrationsContext';
import { formatDate } from '../../utils/formatDate';
import { Button, ContentCard, Feedback, LoadMoreButton, RequestState, SelectInput } from '../ui';

export default function RegistrationsPanel() {
  const registrations = useRegistrations();
  const [cancelId, setCancelId] = useState(null);
  const busy = registrations.action.busy || registrations.status === 'loading' || registrations.loadingMore;
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Stack gap={4}>
          <Text component="h3" m={0} size="lg" fw={600}>My registrations</Text>
          <Text size="sm" c="dimmed">Events you have registered to attend.</Text>
        </Stack>
        <Button variant="default" disabled={busy} onClick={registrations.refresh}>Refresh</Button>
      </Group>
      <SelectInput label="Show events" disabled={registrations.action.busy} value={registrations.scope} onChange={(value) => { setCancelId(null); registrations.setScope(value || 'upcoming'); }} allowDeselect={false} data={[{ value: 'upcoming', label: 'Upcoming events' }, { value: 'all', label: 'All registrations' }]} />
      <Feedback message={registrations.action.message} tone="success" />
      <Feedback message={registrations.action.error} />
      <RequestState {...registrations} isEmpty={!registrations.items.length} loadingMessage="Loading registrations…" emptyMessage={registrations.scope === 'upcoming' ? 'You have no upcoming registrations.' : 'You have no registrations yet.'} />
      {registrations.status === 'error' && <Button variant="default" onClick={registrations.refresh}>Retry</Button>}
      {registrations.items.map((registration) => {
        const event = registration.event;
        if (!event) return <ContentCard key={registration.id}><Text size="sm">Event details are unavailable.</Text></ContentCard>;
        const timezone = event.church?.timezone;
        return (
          <ContentCard key={registration.id ?? event.id}>
            <Stack gap="xs">
              <Group justify="space-between" align="start">
                <Text fw={600} style={{ overflowWrap: 'anywhere' }}>{event.title}</Text>
                {event.status && <Badge color={event.status === 'CANCELLED' ? 'red' : 'blue'} variant="light">{({ PUBLISHED: 'Published', CANCELLED: 'Cancelled', DRAFT: 'Draft' })[event.status] || event.status}</Badge>}
              </Group>
              {event.church?.name && <Text size="sm">{event.church.name}</Text>}
              <Text size="sm">{formatDate(event.startAt, timezone)}{timezone ? ` (${timezone})` : ''}</Text>
              {event.endAt && <Text size="sm" c="dimmed">Ends {formatDate(event.endAt, timezone)}</Text>}
              {event.location && <Text size="sm">{event.location}</Text>}
              {event.id && new Date(event.startAt).getTime() > Date.now() && (
                cancelId === event.id ? (
                  <Stack gap="xs">
                    <Text size="sm">Cancel your registration for {event.title}? Your place will be released.</Text>
                    <Group>
                      <Button color="red" disabled={busy} onClick={async () => {
                        if (await registrations.cancelRegistration(event)) setCancelId(null);
                      }}>Confirm cancellation</Button>
                      <Button variant="default" disabled={busy} onClick={() => setCancelId(null)}>Keep registration</Button>
                    </Group>
                  </Stack>
                ) : <Button variant="subtle" color="red" disabled={busy} onClick={() => setCancelId(event.id)}>Cancel registration</Button>
              )}
            </Stack>
          </ContentCard>
        );
      })}
      <LoadMoreButton hasMore={registrations.hasMore && !registrations.action.busy} loading={registrations.loadingMore} onClick={registrations.loadMore}>Load more registrations</LoadMoreButton>
    </Stack>
  );
}
