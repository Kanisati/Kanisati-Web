import { useReducer, useRef } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import { listFavorites, setFavorite } from '../../api/favorites';
import { useAuth } from '../../contexts/AuthContext';
import { usePaginatedResource } from '../../hooks/usePaginatedResource';
import { Button, ContentCard, Feedback, LoadMoreButton, RequestState } from '../ui';

export default function SavedChurchesPanel() {
  const { accountKey, canUseUserFeatures } = useAuth();
  const favorites = usePaginatedResource(listFavorites, accountKey, canUseUserFeatures);
  const [action, updateAction] = useReducer((state, update) => ({ ...state, ...update }), { busy: false, error: null, message: '' });
  const locked = useRef(false);
  const busy = action.busy || favorites.status === 'loading' || favorites.loadingMore;
  const remove = async (id) => {
    if (locked.current || busy) return;
    locked.current = true;
    updateAction({ busy: true, error: null, message: '' });
    try {
      await setFavorite(id, false);
      favorites.refresh();
      updateAction({ message: 'Church removed from your saved list.' });
    } catch (error) {
      updateAction({ error });
    } finally {
      locked.current = false;
      updateAction({ busy: false });
    }
  };
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text component="h3" m={0} size="lg" fw={600}>Saved churches</Text>
        <Button variant="default" disabled={busy} onClick={favorites.refresh}>Refresh</Button>
      </Group>
      <Feedback message={action.error} />
      <Feedback message={action.message} tone="success" />
      <RequestState {...favorites} isEmpty={!favorites.items.length} loadingMessage="Loading saved churches…" emptyMessage="No saved churches yet. Save a church from its details to find it here." />
      {favorites.status === 'error' && <Button variant="default" onClick={favorites.refresh}>Retry</Button>}
      {favorites.items.map((favorite) => {
        const church = favorite.church ?? favorite;
        const id = favorite.churchId ?? church.id;
        return <ContentCard key={id ?? favorite.id}>
          <Stack gap="xs">
            <Text fw={600}>{church.name || 'Saved church'}</Text>
            {church.denomination && <Text size="sm" c="dimmed">{church.denomination}</Text>}
            <Text size="sm">{church.formattedAddress || [church.city, church.region, church.country].filter(Boolean).join(', ')}</Text>
            <Button variant="subtle" color="red" disabled={busy || !id} onClick={() => remove(id)}>Remove from saved</Button>
          </Stack>
        </ContentCard>;
      })}
      <LoadMoreButton hasMore={favorites.hasMore && !action.busy} loading={favorites.loadingMore} onClick={favorites.loadMore}>Load more churches</LoadMoreButton>
    </Stack>
  );
}
