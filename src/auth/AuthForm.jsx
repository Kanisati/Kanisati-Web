import { Group, Stack, Text } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useFormState } from '../hooks/useFormState';
import { Button, Input, Feedback } from '../components/ui';

export default function AuthForm({ mode, onSuccess, onModeChange }) {
  const auth = useAuth();
  const form = useFormState({ firstName: '', lastName: '', email: '', password: '' });
  const registering = mode === 'register';
  const submit = form.submit(async (values) => {
    if (registering) await auth.registerUser(values);
    else await auth.signIn({ email: values.email, password: values.password });
    onSuccess();
  });

  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <Feedback message={form.error} title="Authentication failed" />
        {registering && <Group grow align="start">
          <Input label="First name" {...form.field('firstName')} required autoComplete="given-name" />
          <Input label="Last name" {...form.field('lastName')} required autoComplete="family-name" />
        </Group>}
        <Input label="Email" type="email" {...form.field('email')} required autoComplete="email" />
        <Input kind="password" label="Password" {...form.field('password')} required minLength={registering ? 8 : undefined} autoComplete={registering ? 'new-password' : 'current-password'} />
        {registering && <Text size="xs" c="dimmed">Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.</Text>}
        <Button type="submit" loading={form.submitting}>{registering ? 'Create account' : 'Sign in'}</Button>
        <Button variant="subtle" disabled={form.submitting} onClick={() => onModeChange(registering ? 'login' : 'register')}>
          {registering ? 'Already have an account? Sign in' : 'Create a user account'}
        </Button>
      </Stack>
    </form>
  );
}
