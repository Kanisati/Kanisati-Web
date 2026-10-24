import { Stack } from '@mantine/core';
import HomeProviders from '../../contexts/HomeProviders';
import DiscoveryToolbar from '../../components/Home/DiscoveryToolbar';
import ChurchDiscovery from '../../components/Home/ChurchDiscovery';
import ChurchDetailsDialog from '../../components/churches/ChurchDetailsDialog';
import MassScheduleSection from '../../components/massSchedules/MassScheduleSection';
import EventsSection from '../../components/events/EventsSection';
import EventDetailsDialog from '../../components/events/EventDetailsDialog';

export default function Home() {
  return (
    <HomeProviders>
      <Stack p="md" gap="sm">
        <DiscoveryToolbar />
        <ChurchDiscovery />
        <MassScheduleSection />
        <EventsSection />
        <ChurchDetailsDialog />
        <EventDetailsDialog />
      </Stack>
    </HomeProviders>
  );
}
