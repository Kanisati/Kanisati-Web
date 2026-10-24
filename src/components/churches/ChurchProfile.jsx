import { Group, Stack, Text } from '@mantine/core';
import { useFavorites } from '../../contexts/FavoritesContext';
import { formatDate } from '../../utils/formatDate';
import { Feedback } from '../ui';
import FavoriteButton from './FavoriteButton';

const items = (value) => Array.isArray(value) ? value : [];

export default function ChurchProfile({ church }) {
  const favorites = useFavorites();
  return (
    <Stack gap="sm">
      <FavoriteButton church={church} fullLabel />
      <Feedback message={favorites.error} title="Saved churches" />
      <Text c="dimmed">{[church.denomination, church.city, church.formattedAddress].filter(Boolean).join(' · ')}</Text>
      {church.description && <Text>{church.description}</Text>}
      {(church.phone || church.website) && (
        <Group gap="md">
          {church.phone && <Text component="a" href={`tel:${church.phone}`}>{church.phone}</Text>}
          {church.website && <Text component="a" href={church.website} target="_blank" rel="noreferrer">Website</Text>}
        </Group>
      )}
      {items(church.amenities).length > 0 && (
        <section><Text fw={600} mb={4}>Amenities</Text><Text size="sm">{church.amenities.map((amenity) => amenity.name || amenity.slug).filter(Boolean).join(' · ')}</Text></section>
      )}
      {items(church.openingHours).length > 0 && (
        <section>
          <Text fw={600} mb={4}>Opening hours</Text>
          <Stack gap={2}>{church.openingHours.map((hours) => <Text size="sm" key={hours.id || hours.dayOfWeek}>{hours.dayOfWeek}: {hours.isClosed ? 'Closed' : `${hours.opensAt}–${hours.closesAt}`}</Text>)}</Stack>
        </section>
      )}
      {items(church.massSchedules).length > 0 && (
        <section>
          <Text fw={600} mb={4}>Mass schedule</Text>
          <Stack gap={2}>{church.massSchedules.map((schedule) => <Text size="sm" key={schedule.id}>{[schedule.dayOfWeek, schedule.startTime, schedule.serviceType, schedule.language].filter(Boolean).join(' · ')}</Text>)}</Stack>
        </section>
      )}
      {items(church.events).length > 0 && (
        <section>
          <Text fw={600} mb={4}>Upcoming events</Text>
          <Stack gap={2}>{church.events.map((event) => <Text size="sm" key={event.id}>{event.title} · {formatDate(event.startAt, church.timezone)}</Text>)}</Stack>
        </section>
      )}
    </Stack>
  );
}
