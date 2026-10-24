import { Select } from '@mantine/core';
import { fieldErrorMessage } from '../../utils/errors';

export default function SelectInput({ error, comboboxProps, ...props }) {
  return <Select radius="sm" error={fieldErrorMessage(error)} comboboxProps={{ withinPortal: false, ...comboboxProps }} {...props} />;
}
