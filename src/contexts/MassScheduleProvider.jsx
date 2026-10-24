import { useCallback } from 'react';
import { listMassOccurrences } from '../api/massSchedules';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { useDiscovery } from './DiscoveryContext';
import { MassScheduleContext } from './MassScheduleContext';

export default function MassScheduleProvider({ children }) {
  const { massQuery } = useDiscovery();
  const loadPage = useCallback((page) => listMassOccurrences(massQuery, page), [massQuery]);
  const occurrences = usePaginatedResource(loadPage, massQuery, Boolean(massQuery));
  return <MassScheduleContext.Provider value={occurrences}>{children}</MassScheduleContext.Provider>;
}
