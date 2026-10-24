import { Stack, Text } from '@mantine/core';
import { useDiscovery } from '../../contexts/DiscoveryContext';
import FavoriteButton from './FavoriteButton';
import styles from './styles.module.scss';

export default function ChurchResults() {
  const { churches, selectChurch } = useDiscovery();
  return (
    <Stack component="ul" gap="xs" className={styles.results} aria-label="Church search results">
      {churches.map((church) => (
        <li key={church.id} className={styles.resultRow}>
          <button type="button" className={styles.resultButton} onClick={() => selectChurch(church)}>
            <Text component="span" display="block" fw={600}>{church.name}</Text>
            <Text component="span" display="block" size="sm" c="dimmed">{[church.city, church.formattedAddress, church.denomination].filter(Boolean).join(' · ') || 'Location details unavailable'}</Text>
            {Number.isFinite(church.rating) && <Text component="span" display="block" size="xs">Rating {church.rating.toFixed(1)} / 5</Text>}
          </button>
          <FavoriteButton church={church} />
        </li>
      ))}
    </Stack>
  );
}
