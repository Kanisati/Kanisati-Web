import DiscoveryProvider from './DiscoveryProvider';
import EventsProvider from './EventsProvider';
import FavoritesProvider from './FavoritesProvider';
import MassScheduleProvider from './MassScheduleProvider';

export default function HomeProviders({ children }) {
  return (
    <DiscoveryProvider>
      <MassScheduleProvider>
        <EventsProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </EventsProvider>
      </MassScheduleProvider>
    </DiscoveryProvider>
  );
}
