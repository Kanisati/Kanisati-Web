import { createContext, useContext } from 'react';

export const ChurchSchedulesContext = createContext(null);

export function useChurchSchedules() {
  const context = useContext(ChurchSchedulesContext);
  if (!context) throw new Error('useChurchSchedules must be used inside ChurchSchedulesProvider');
  return context;
}
