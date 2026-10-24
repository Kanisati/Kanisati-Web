import { useId } from 'react';
import { Stack, Text } from '@mantine/core';

export default function Section({ title, description, children, ...props }) {
  const titleId = useId();
  return (
    <Stack component="section" gap="sm" aria-labelledby={titleId} {...props}>
      <div>
        <Text id={titleId} component="h2" fw={700} size="lg" m={0}>{title}</Text>
        {description && <Text c="dimmed" size="sm">{description}</Text>}
      </div>
      {children}
    </Stack>
  );
}
