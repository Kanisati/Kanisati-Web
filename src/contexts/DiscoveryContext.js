import { createContext, useContext } from 'react';

export const DiscoveryContext = createContext(null);
export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (!context) throw new Error('useDiscovery must be used inside DiscoveryProvider');
  return context;
}
