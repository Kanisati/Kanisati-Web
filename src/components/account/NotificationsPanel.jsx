import { Badge, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { formatDate } from '../../utils/formatDate';
import { Button, ContentCard, Feedback, LoadMoreButton, RequestState } from '../ui';

export default function NotificationsPanel() {
  const notifications = useNotifications();
  const [deleteId, setDeleteId] = useState(null);
  const busy = notifications.action.busy || notifications.status === 'loading' || notifications.loadingMore;
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Stack gap={4}>
          <Text component="h3" m={0} size="lg" fw={600}>Notifications</Text>
          <Text size="sm" c="dimmed">Updates and reminders for your account.</Text>
        </Stack>
        <Button variant="default" disabled={busy} onClick={notifications.refresh}>Refresh</Button>
      </Group>
      {notifications.summary != null && <Text size="sm" role="status">{notifications.summary} unread</Text>}
      <Feedback message={notifications.action.error} />
      <Feedback message={notifications.action.message} tone="success" />
      <Button variant="light" disabled={busy || !(notifications.summary > 0 || notifications.items.some((item) => !item.isRead))} onClick={notifications.markAllRead}>Mark all as read</Button>
      <RequestState {...notifications} isEmpty={!notifications.items.length} loadingMessage="Loading notifications…" emptyMessage="You have no notifications yet." />
      {notifications.status === 'error' && <Button variant="default" disabled={busy} onClick={notifications.refresh}>Retry</Button>}
      <Stack gap="sm">
        {notifications.items.map((notification) => (
          <ContentCard key={notification.id}>
            <Stack gap="xs">
              <Group justify="space-between" align="start">
                <Text fw={notification.isRead ? 500 : 700} style={{ overflowWrap: 'anywhere' }}>{notification.title}</Text>
                {!notification.isRead && <Badge variant="light">Unread</Badge>}
              </Group>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{notification.message}</Text>
              {notification.createdAt && <Text component="time" dateTime={notification.createdAt} size="xs" c="dimmed">{formatDate(notification.createdAt)}</Text>}
              {deleteId === notification.id ? (
                <Stack gap="xs">
                  <Text size="sm">Delete this notification? This cannot be undone.</Text>
                  <Group>
                    <Button color="red" disabled={busy} onClick={async () => {
                      if (await notifications.remove(notification.id)) setDeleteId(null);
                    }}>Confirm deletion</Button>
                    <Button variant="default" disabled={busy} onClick={() => setDeleteId(null)}>Cancel</Button>
                  </Group>
                </Stack>
              ) : (
                <Group gap="xs">
                  {!notification.isRead && <Button variant="light" disabled={busy} onClick={() => notifications.markRead(notification.id)}>Mark as read</Button>}
                  <Button variant="subtle" color="red" disabled={busy} onClick={() => setDeleteId(notification.id)}>Delete</Button>
                </Group>
              )}
            </Stack>
          </ContentCard>
        ))}
      </Stack>
      <LoadMoreButton hasMore={notifications.hasMore && !notifications.action.busy} loading={notifications.loadingMore} onClick={notifications.loadMore}>Load more notifications</LoadMoreButton>
    </Stack>
  );
}
