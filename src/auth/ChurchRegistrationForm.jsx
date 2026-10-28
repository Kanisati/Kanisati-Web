import { Stack, Text } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useFormState } from '../hooks/useFormState';
import { Button, Feedback, Input } from '../components/ui';

export default function ChurchRegistrationForm({ onSuccess, onModeChange }) {
  const { registerChurch } = useAuth();
  const form = useFormState({ churchName: '', phone: '', formattedAddress: '', email: '', password: '' });
  const submit = form.submit(async (values) => {
    await registerChurch({
      churchName: values.churchName.trim(),
      phone: values.phone.trim(),
      formattedAddress: values.formattedAddress.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    onSuccess('Your church account was created. Approval is required before you can publish events.');
  });
  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">Register an account for your church. New churches are reviewed before they can publish events.</Text>
        <Feedback message={form.error} title="Registration failed" />
        <Input label="Church name" {...form.field('churchName')} required autoComplete="organization" disabled={form.submitting} />
        <Input label="Church phone" type="tel" {...form.field('phone')} required autoComplete="tel" disabled={form.submitting} />
        <Input label="Church address" {...form.field('formattedAddress')} required autoComplete="street-address" disabled={form.submitting} />
        <Input label="Account email" type="email" {...form.field('email')} required autoComplete="email" disabled={form.submitting} />
        <Input label="Password" kind="password" {...form.field('password')} required minLength={8} autoComplete="new-password" disabled={form.submitting} />
        <Text size="xs" c="dimmed">Use at least 8 characters with an uppercase letter, a lowercase letter, and a number (maximum 72 UTF-8 bytes).</Text>
        <Button type="submit" loading={form.submitting}>Create church account</Button>
        <Button variant="subtle" disabled={form.submitting} onClick={() => onModeChange('login')}>Already have an account? Sign in</Button>
        <Button variant="subtle" disabled={form.submitting} onClick={() => onModeChange('register')}>Create a personal account instead</Button>
      </Stack>
    </form>
  );
}
