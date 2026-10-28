import { createContext, useContext } from 'react';

export const ChurchEventsContext = createContext(null);

export function useChurchEvents() {
  const context = useContext(ChurchEventsContext);
  if (!context) throw new Error('useChurchEvents must be used inside ChurchEventsProvider');
  return context;
}
