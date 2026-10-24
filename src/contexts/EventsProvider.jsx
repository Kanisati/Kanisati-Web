import { useCallback, useState } from 'react';
import { getEvent, listEvents } from '../api/events';
import { useApiResource } from '../hooks/useApiResource';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { EventsContext } from './EventsContext';

export default function EventsProvider({ children }) {
  const events = usePaginatedResource(listEvents, 'events');
  const [selectedEventId, selectEvent] = useState(null);
  const loadDetail = useCallback(() => getEvent(selectedEventId), [selectedEventId]);
  const detail = useApiResource(loadDetail, selectedEventId, Boolean(selectedEventId));
  return <EventsContext.Provider value={{ events, detail, selectedEventId, selectEvent, closeEvent: () => selectEvent(null) }}>{children}</EventsContext.Provider>;
}
