import { useReducer, useState } from 'react';
import { Group, Text } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { Button, Dialog, Feedback } from '../components/ui';
import AuthForm from './AuthForm';
import ChurchRegistrationForm from './ChurchRegistrationForm';
import AccountProvider from '../contexts/AccountProvider';
import AccountDetails from '../components/account/AccountDetails';

export default function AuthControl() {
  const auth = useAuth();
  const [accountOpened, setAccountOpened] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [dialog, setDialog] = useState({ opened: false, mode: 'login' });
  const [logout, setLogout] = useReducer((state, action) => ({ ...state, ...action }), { busy: false, error: null });
  const close = () => setDialog((current) => ({ ...current, opened: false }));

  const handleSignOut = async () => {
    if (logout.busy) return;
    setAccountOpened(false);
    setLogout({ busy: true, error: null });
    try {
      await auth.signOut();
      setLogout({ busy: false });
    } catch (error) {
      setLogout({ busy: false, error });
    }
  };

  return (
    <>
      {auth.isSignedIn ? (
        <Group gap="xs">
          <Text size="sm" visibleFrom="sm">{auth.account?.email || auth.account?.firstName || 'Signed in'}</Text>
          <Button variant="default" onClick={() => setAccountOpened(true)}>My account</Button>
          <Button variant="default" onClick={handleSignOut} loading={logout.busy}>Sign out</Button>
        </Group>
      ) : <Button variant="default" onClick={() => { setAccountMessage(''); setDialog({ opened: true, mode: 'login' }); }}>Sign in</Button>}
      <Feedback message={accountMessage} tone="success" />
      {auth.isSignedIn && (auth.session?.churchStatus ?? auth.account?.churchStatus) === 'PENDING' && <Feedback tone="warning" message="Your church is pending approval. Event publishing will be available after approval." />}
      <Feedback message={logout.error} tone="warning" />
      {auth.isSignedIn && (
        <Dialog opened={accountOpened} onClose={() => setAccountOpened(false)} title="My account" size="lg" padding="lg" radius="md">
          {accountOpened && <AccountProvider key={auth.accountKey} onDeactivated={() => {
            setAccountOpened(false);
            setAccountMessage('Your account has been deactivated. You are now signed out.');
          }} onSignedOutAll={() => {
            setAccountOpened(false);
            setAccountMessage('You are signed out here. Other devices will require sign-in when their current session expires.');
          }}><AccountDetails /></AccountProvider>}
        </Dialog>
      )}
      <Dialog opened={dialog.opened} onClose={close} title={dialog.mode === 'login' ? 'Sign in' : dialog.mode === 'registerChurch' ? 'Create a church account' : 'Create a user account'}>
        {dialog.opened && (dialog.mode === 'registerChurch' ? (
          <ChurchRegistrationForm onSuccess={(message) => { setAccountMessage(message); close(); }} onModeChange={(mode) => setDialog({ opened: true, mode })} />
        ) : <AuthForm key={dialog.mode} mode={dialog.mode} onSuccess={close} onModeChange={(mode) => setDialog({ opened: true, mode })} />)}
      </Dialog>
    </>
  );
}
