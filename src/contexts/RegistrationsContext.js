import { createContext, useContext } from 'react';

export const RegistrationsContext = createContext(null);

export function useRegistrations() {
  const context = useContext(RegistrationsContext);
  if (!context) throw new Error('useRegistrations must be used inside RegistrationsProvider');
  return context;
}
