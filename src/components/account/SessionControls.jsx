import { useState } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import { useAccount } from '../../contexts/AccountContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, ContentCard, Feedback } from '../ui';

export default function SessionControls() {
  const { signOutEverywhere } = useAccount();
  const [confirming, setConfirming] = useState(false);
  const form = useFormState({});

  return (
    <ContentCard>
      <Stack gap="sm">
        <Text component="h3" m={0} size="md" fw={600}>Signed-in devices</Text>
        <Text size="sm" c="dimmed">Sign out here and require a new sign-in on your other devices when their current session expires.</Text>
        {confirming ? (
          <>
            <Text size="sm" fw={500}>Sign out of all devices, including this browser?</Text>
            <Feedback message={form.error} />
            <Group>
              <Button loading={form.submitting} onClick={form.submit(signOutEverywhere)}>Confirm sign out</Button>
              <Button variant="default" disabled={form.submitting} onClick={() => setConfirming(false)}>Cancel</Button>
            </Group>
          </>
        ) : <Button variant="light" onClick={() => setConfirming(true)}>Sign out of all devices</Button>}
      </Stack>
    </ContentCard>
  );
}
