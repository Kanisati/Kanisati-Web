import { useState } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import { useAccount } from '../../contexts/AccountContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, ContentCard, Feedback } from '../ui';

export default function DeactivateAccount() {
  const { deactivate } = useAccount();
  const [confirming, setConfirming] = useState(false);
  const form = useFormState({});

  return (
    <ContentCard>
      <Stack gap="sm">
        <Text component="h3" m={0} size="md" fw={600}>Deactivate account</Text>
        <Text size="sm" c="dimmed">Deactivating your account disables access and ends your account’s sessions.</Text>
        {confirming ? (
          <>
            <Text size="sm" fw={500}>Are you sure you want to deactivate your account?</Text>
            <Feedback message={form.error} />
            <Group>
              <Button color="red" loading={form.submitting} onClick={form.submit(deactivate)}>Confirm deactivation</Button>
              <Button variant="default" disabled={form.submitting} onClick={() => setConfirming(false)}>Keep my account</Button>
            </Group>
          </>
        ) : <Button color="red" variant="light" onClick={() => setConfirming(true)}>Deactivate account</Button>}
      </Stack>
    </ContentCard>
  );
}
