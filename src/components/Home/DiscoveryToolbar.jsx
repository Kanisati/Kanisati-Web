import { Group, Text } from '@mantine/core';
import AuthControl from '../../auth/AuthControl';
import { useDiscovery } from '../../contexts/DiscoveryContext';
import { Button } from '../ui';

export default function DiscoveryToolbar() {
  const { position, status, requestLocation } = useDiscovery();
  return (
    <Group justify="space-between" align="center">
      <div>
        <Text component="h1" fw={700} size="lg" m={0}>Find a church</Text>
        <Text c="dimmed" size="sm">{position ? 'Churches near your location' : 'Explore churches around Beirut'}</Text>
      </div>
      <Group gap="xs">
        <AuthControl />
        <Button onClick={requestLocation} loading={status === 'locating' || status === 'loading'}>Use my location</Button>
      </Group>
    </Group>
  );
}
