import { PasswordInput, Textarea, TextInput } from '@mantine/core';
import { fieldErrorMessage } from '../../utils/errors';

/** Shared field styling and API validation messages for text, password, and multiline inputs. */
export default function Input({ kind = 'text', error, ...props }) {
  const Component = kind === 'password' ? PasswordInput : kind === 'textarea' ? Textarea : TextInput;
  return <Component radius="sm" error={fieldErrorMessage(error)} aria-invalid={error ? true : undefined} {...props} />;
}
