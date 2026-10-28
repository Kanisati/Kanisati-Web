import { Avatar, Badge, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import styles from './styles.module.scss';
import PasswordForm from './PasswordForm';
import LocationForm from './LocationForm';
import SavedChurchesPanel from './SavedChurchesPanel';
import DeactivateAccount from './DeactivateAccount';
import SessionControls from './SessionControls';
import NotificationsPanel from './NotificationsPanel';
import NotificationsProvider from '../../contexts/NotificationsProvider';
import RegistrationsPanel from './RegistrationsPanel';
import RegistrationsProvider from '../../contexts/RegistrationsProvider';
import { useAuth } from '../../contexts/AuthContext';
import { useAccount } from '../../contexts/AccountContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, Feedback, Input, RequestState } from '../ui';

function ProfileForm({ profile, saveProfile }) {
  const form = useFormState({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '' });
  return (
    <form onSubmit={form.submit(saveProfile)}>
      <Stack gap="md">
        <Stack gap={4}>
          <Text component="h3" m={0} size="lg" fw={600}>Personal information</Text>
          <Text size="sm" c="dimmed">Manage the name on your account.</Text>
        </Stack>
        <Feedback message={form.message} tone="success" />
        <Feedback message={form.error} />
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        <Input label="First name" {...form.field('firstName')} autoComplete="given-name" disabled={form.submitting} />
        <Input label="Last name" {...form.field('lastName')} autoComplete="family-name" disabled={form.submitting} />
        </SimpleGrid>
        <Input label="Email address" value={profile.email || ''} readOnly description="Your sign-in email cannot be changed here." />
        <Group justify="flex-end" className={styles.actions}>
          <Button type="submit" loading={form.submitting}>Save changes</Button>
        </Group>
      </Stack>
    </form>
  );
}

export default function AccountDetails() {
  const account = useAccount();
  const { canUseUserFeatures } = useAuth();
  const name = [account.data?.firstName, account.data?.lastName].filter(Boolean).join(' ') || 'Your account';
  const initials = [account.data?.firstName, account.data?.lastName].filter(Boolean).map((part) => part[0]).join('') || '?';
  return (
    <Stack>
      <RequestState {...account} isEmpty={!account.data} loadingMessage="Loading your profile…" emptyMessage="Your profile is unavailable." />
      {(account.error || (account.status === 'success' && !account.data)) && <Button variant="default" onClick={account.refresh}>Retry</Button>}
      {account.data && (
        <>
          <Group wrap="nowrap" className={styles.summary}>
            <Avatar radius="xl" size={48} color="blue">{initials}</Avatar>
            <Stack gap={4} className={styles.identity}>
              <Text fw={600} className={styles.name}>{name}</Text>
              <Badge variant="light" size="sm">{({ USER: 'Personal account', CHURCH: 'Church account', ADMIN: 'Administrator' })[account.data.role] || 'Member'}</Badge>
            </Stack>
          </Group>
          <Tabs defaultValue="profile">
            <Tabs.List grow aria-label="Account settings">
              <Tabs.Tab value="profile">Profile</Tabs.Tab>
              <Tabs.Tab value="location">Saved location</Tabs.Tab>
              <Tabs.Tab value="security">Security</Tabs.Tab>
              <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
              {canUseUserFeatures && <Tabs.Tab value="registrations">My registrations</Tabs.Tab>}
              {canUseUserFeatures && <Tabs.Tab value="favorites">Saved churches</Tabs.Tab>}
            </Tabs.List>
            <Tabs.Panel value="profile" pt="lg">
              <ProfileForm profile={account.data} saveProfile={account.saveProfile} />
            </Tabs.Panel>
            <Tabs.Panel value="location" pt="lg">
              <LocationForm />
            </Tabs.Panel>
            <Tabs.Panel value="security" pt="lg">
              <Stack gap="xl">
                <PasswordForm />
                <SessionControls />
                <DeactivateAccount />
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="notifications" pt="lg" keepMounted={false}>
              <NotificationsProvider><NotificationsPanel /></NotificationsProvider>
            </Tabs.Panel>
            {canUseUserFeatures && <Tabs.Panel value="registrations" pt="lg" keepMounted={false}>
              <RegistrationsProvider><RegistrationsPanel /></RegistrationsProvider>
            </Tabs.Panel>}
            {canUseUserFeatures && <Tabs.Panel value="favorites" pt="lg" keepMounted={false}>
              <SavedChurchesPanel />
            </Tabs.Panel>}
          </Tabs>
        </>
      )}
    </Stack>
  );
}
