import { Text } from '@mantine/core';
import { useDiscovery } from '../../contexts/DiscoveryContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Button, Input, Feedback, RequestState } from '../ui';
import ChurchResults from '../churches/ChurchResults';
import ChurchMap from './ChurchMap';
import styles from './discovery.module.scss';

export default function ChurchDiscovery() {
  const { query, setQuery, searchChurches, status, error, churches, resultLabel } = useDiscovery();
  const favorites = useFavorites();
  return (
    <>
      <form onSubmit={searchChurches} className={styles.searchForm}>
        <Input aria-label="Search churches" placeholder="Search by church, city, or denomination" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        <Button type="submit" loading={status === 'loading'} disabled={status === 'locating'}>Search churches</Button>
      </form>
      <RequestState status={status} error={error} isEmpty={churches.length === 0} loadingMessage="Searching churches…" emptyMessage="No churches matched this search. Try another church name, city, or denomination." />
      {status === 'success' && churches.length > 0 && <Text size="sm" c="dimmed">{resultLabel} · {churches.length} shown</Text>}
      {favorites.status === 'loading' && <Text size="xs" c="dimmed" role="status">Loading saved churches…</Text>}
      <div className={churches.length ? `${styles.discoveryLayout} ${styles.withResults}` : styles.discoveryLayout}>
        <ChurchMap />
        {churches.length > 0 && <ChurchResults />}
      </div>
      <Feedback message={favorites.error} title="Saved churches" />
    </>
  );
}
