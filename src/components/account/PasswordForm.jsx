import { Group, Stack, Text } from '@mantine/core';
import styles from './styles.module.scss';
import { useAccount } from '../../contexts/AccountContext';
import { useFormState } from '../../hooks/useFormState';
import { Button, Feedback, Input } from '../ui';

export default function PasswordForm() {
  const { changePassword } = useAccount();
  const form = useFormState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const submit = form.submit(async (values) => {
    const errors = {};
    if (values.newPassword === values.currentPassword) {
      errors.newPassword = ['Choose a password different from your current password.'];
    }
    if (values.confirmPassword !== values.newPassword) {
      errors.confirmPassword = ['Passwords do not match.'];
    }
    if (Object.keys(errors).length) {
      throw Object.assign(new Error('Please check your password.'), { errors });
    }
    const message = await changePassword(values);
    for (const name of ['currentPassword', 'newPassword', 'confirmPassword']) form.setValue(name, '');
    return message;
  });

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <Stack gap={4}>
          <Text component="h3" m={0} size="lg" fw={600}>Change password</Text>
          <Text size="sm" c="dimmed">Keep your account secure with a password you don’t use elsewhere.</Text>
        </Stack>
        <Feedback message={form.message} tone="success" />
        <Feedback message={form.error} />
        <Input kind="password" label="Current password" {...form.field('currentPassword')} autoComplete="current-password" required disabled={form.submitting} />
        <Input kind="password" label="New password" {...form.field('newPassword')} autoComplete="new-password" maxLength={128} required disabled={form.submitting} description="Choose a different password, up to 128 characters." />
        <Input kind="password" label="Confirm new password" {...form.field('confirmPassword')} autoComplete="new-password" maxLength={128} required disabled={form.submitting} />
        <Group justify="flex-end" className={styles.actions}>
          <Button type="submit" loading={form.submitting}>Update password</Button>
        </Group>
      </Stack>
    </form>
  );
}
