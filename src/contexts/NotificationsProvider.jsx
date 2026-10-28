import { useReducer, useRef } from 'react';
import { deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { useAuth } from './AuthContext';
import { NotificationsContext } from './NotificationsContext';

export default function NotificationsProvider({ children }) {
  const { accountKey, isSignedIn } = useAuth();
  const notifications = usePaginatedResource(listNotifications, accountKey, isSignedIn);
  const locked = useRef(false);
  const [action, setAction] = useReducer((state, update) => ({ ...state, ...update }), { busy: false, error: null, message: '' });
  const mutate = async (request, message) => {
    if (locked.current || notifications.status === 'loading' || notifications.loadingMore) return false;
    locked.current = true;
    setAction({ busy: true, error: null, message: '' });
    try {
      await request();
      notifications.refresh();
      setAction({ message });
      return true;
    } catch (error) {
      setAction({ error });
      return false;
    } finally {
      locked.current = false;
      setAction({ busy: false });
    }
  };
  return <NotificationsContext.Provider value={{
    ...notifications,
    action,
    markRead: (id) => mutate(() => markNotificationRead(id), 'Notification marked as read.'),
    markAllRead: () => mutate(markAllNotificationsRead, 'All notifications marked as read.'),
    remove: (id) => mutate(() => deleteNotification(id), 'Notification deleted.'),
  }}>{children}</NotificationsContext.Provider>;
}
