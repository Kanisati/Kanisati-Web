import { useCallback, useState } from 'react';
import { listRegistrations } from '../api/registrations';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { useAuth } from './AuthContext';
import { RegistrationsContext } from './RegistrationsContext';

export default function RegistrationsProvider({ children }) {
  const { accountKey, canUseUserFeatures } = useAuth();
  const [scope, setScope] = useState('upcoming');
  const loadPage = useCallback((page) => listRegistrations(page, scope === 'upcoming'), [scope]);
  const registrations = usePaginatedResource(loadPage, [accountKey, scope], canUseUserFeatures);
  return <RegistrationsContext.Provider value={{ ...registrations, scope, setScope }}>{children}</RegistrationsContext.Provider>;
}
