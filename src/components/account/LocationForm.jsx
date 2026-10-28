import { Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useAccount } from '../../contexts/AccountContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, Feedback, Input } from '../ui';
import styles from './styles.module.scss';

export default function LocationForm() {
  const { data: profile, saveLocation } = useAccount();
  const form = useFormState({ latitude: String(profile.latitude ?? ''), longitude: String(profile.longitude ?? '') });
  const locate = form.submit(async () => {
    if (!navigator.geolocation) throw new Error('Location is unavailable in this browser. Enter coordinates manually.');
    const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, (error) => {
      reject(new Error(error.code === 1 ? 'Location permission was denied. You can enter coordinates manually.' : 'Could not find your location. Try again or enter coordinates manually.', { cause: error }));
    }, { timeout: 15000, maximumAge: 60000 }));
    form.setValue('latitude', String(position.coords.latitude));
    form.setValue('longitude', String(position.coords.longitude));
    return 'Coordinates filled in. Choose Save location to store them in your account.';
  });
  const clear = form.submit(async () => {
    const message = await saveLocation({ latitude: '', longitude: '' });
    form.setValue('latitude', '');
    form.setValue('longitude', '');
    return message;
  });
  return (
    <form onSubmit={form.submit(saveLocation)}>
      <Stack gap="md" aria-busy={form.submitting}>
        <Stack gap={4}>
          <Text component="h3" m={0} size="lg" fw={600}>Saved location</Text>
          <Text size="sm" c="dimmed">Store coordinates on your profile. Nearby searches still use the location you choose on the Home page.</Text>
        </Stack>
        <Feedback message={form.error} />
        <Feedback message={form.message} tone="success" />
        <Button variant="light" disabled={form.submitting} onClick={locate}>Use my location</Button>
        <SimpleGrid cols={{ base: 1, xs: 2 }}>
          <Input label="Latitude" {...form.field('latitude')} inputMode="decimal" placeholder="33.8938" disabled={form.submitting} />
          <Input label="Longitude" {...form.field('longitude')} inputMode="decimal" placeholder="35.5018" disabled={form.submitting} />
        </SimpleGrid>
        {form.submitting && <Text size="sm" role="status">Processing location…</Text>}
        <Group justify="flex-end" className={styles.actions}>
          <Button variant="default" disabled={form.submitting || (profile.latitude == null && profile.longitude == null)} onClick={clear}>Clear saved location</Button>
          <Button type="submit" disabled={form.submitting}>Save location</Button>
        </Group>
      </Stack>
    </form>
  );
}
