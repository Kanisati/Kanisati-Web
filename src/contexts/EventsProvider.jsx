import { useCallback, useState } from 'react';
import { getEvent, listEvents } from '../api/events';
import { registerForEvent } from '../api/registrations';
import { useApiResource } from '../hooks/useApiResource';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { EventsContext } from './EventsContext';

export default function EventsProvider({ children }) {
  const events = usePaginatedResource(listEvents, 'events');
  const [selectedEventId, selectEvent] = useState(null);
  const loadDetail = useCallback(() => getEvent(selectedEventId), [selectedEventId]);
  const detail = useApiResource(loadDetail, selectedEventId, Boolean(selectedEventId));
  const register = async (eventId) => {
    await registerForEvent(eventId);
    events.refresh();
    detail.refresh();
    return 'You are registered for this event. Find it in My account → My registrations.';
  };
  return <EventsContext.Provider value={{ events, detail, selectedEventId, selectEvent, register, closeEvent: () => selectEvent(null) }}>{children}</EventsContext.Provider>;
}
