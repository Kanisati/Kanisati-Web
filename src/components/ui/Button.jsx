import { Button as MantineButton } from '@mantine/core';

export default function Button({ component, ...props }) {
  return <MantineButton radius="sm" type={component ? undefined : 'button'} component={component} {...props} />;
}
