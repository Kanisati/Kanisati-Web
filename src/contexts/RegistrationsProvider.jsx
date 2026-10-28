import { useCallback, useReducer, useRef, useState } from 'react';
import { cancelEventRegistration, listRegistrations } from '../api/registrations';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { useAuth } from './AuthContext';
import { RegistrationsContext } from './RegistrationsContext';

export default function RegistrationsProvider({ children }) {
  const { accountKey, canUseUserFeatures } = useAuth();
  const [scope, setScope] = useState('upcoming');
  const loadPage = useCallback((page) => listRegistrations(page, scope === 'upcoming'), [scope]);
  const registrations = usePaginatedResource(loadPage, [accountKey, scope], canUseUserFeatures);
  const locked = useRef(false);
  const [action, setAction] = useReducer((state, update) => ({ ...state, ...update }), { busy: false, error: null, message: '' });
  const cancelRegistration = async (event) => {
    if (locked.current || registrations.loadingMore || registrations.status === 'loading') return false;
    if (!event.id || !(new Date(event.startAt).getTime() > Date.now())) {
      setAction({ error: 'Registration can only be cancelled before the event starts.', message: '' });
      return false;
    }
    locked.current = true;
    setAction({ busy: true, error: null, message: '' });
    try {
      await cancelEventRegistration(event.id);
      registrations.refresh();
      setAction({ message: 'Your registration was cancelled.' });
      return true;
    } catch (error) {
      setAction({ error });
      return false;
    } finally {
      locked.current = false;
      setAction({ busy: false });
    }
  };
  return <RegistrationsContext.Provider value={{ ...registrations, scope, setScope, action, cancelRegistration }}>{children}</RegistrationsContext.Provider>;
}
