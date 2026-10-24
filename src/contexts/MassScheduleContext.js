import { createContext, useContext } from 'react';

export const MassScheduleContext = createContext(null);
export function useMassSchedule() {
  const context = useContext(MassScheduleContext);
  if (!context) throw new Error('useMassSchedule must be used inside MassScheduleProvider');
  return context;
}
