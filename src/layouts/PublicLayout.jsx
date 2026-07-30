import { AppShell, Group, Image, Text } from '@mantine/core';
import logo from '../assets/logo.png';

export function PublicLayout({ children }) {
  return (
    <AppShell header={{ height: 64 }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Image src={logo} alt="Logo" h={40} w="auto" />
          <Text size="sm" c="black.6">
            Public
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
