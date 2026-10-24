import { Stack, Text } from '@mantine/core';
import { useAccount } from '../../contexts/AccountContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, Feedback, Input, RequestState } from '../ui';

function ProfileForm({ profile, saveProfile }) {
  const form = useFormState({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '' });
  return (
    <form onSubmit={form.submit(saveProfile)}>
      <Stack gap="sm">
        <Text size="sm">Email: {profile.email || 'Unavailable'}</Text>
        <Text size="sm">Account type: {profile.role || 'Unavailable'}</Text>
        <Feedback message={form.message} tone="success" />
        <Feedback message={form.error} />
        <Input label="First name" {...form.field('firstName')} autoComplete="given-name" disabled={form.submitting} />
        <Input label="Last name" {...form.field('lastName')} autoComplete="family-name" disabled={form.submitting} />
        <Button type="submit" loading={form.submitting}>Save profile</Button>
      </Stack>
    </form>
  );
}

export default function AccountDetails() {
  const account = useAccount();
  return (
    <Stack>
      <RequestState {...account} isEmpty={!account.data} loadingMessage="Loading your profile…" emptyMessage="Your profile is unavailable." />
      {(account.error || (account.status === 'success' && !account.data)) && <Button variant="default" onClick={account.refresh}>Retry</Button>}
      {account.data && <ProfileForm profile={account.data} saveProfile={account.saveProfile} />}
    </Stack>
  );
}
