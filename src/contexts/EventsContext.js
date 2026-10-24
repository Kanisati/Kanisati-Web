import { createContext, useContext } from 'react';

export const EventsContext = createContext(null);
export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) throw new Error('useEvents must be used inside EventsProvider');
  return context;
}
