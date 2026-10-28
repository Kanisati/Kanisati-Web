import { useCallback } from 'react';
import { listChurchEvents } from '../api/events';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { ChurchEventsContext } from './ChurchEventsContext';

export default function ChurchEventsProvider({ churchId, children }) {
  const loadPage = useCallback((page) => listChurchEvents(churchId, page), [churchId]);
  const events = usePaginatedResource(loadPage, churchId);
  return <ChurchEventsContext.Provider value={events}>{children}</ChurchEventsContext.Provider>;
}
