import { useCallback } from 'react';
import { listChurchSchedules } from '../api/massSchedules';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { ChurchSchedulesContext } from './ChurchSchedulesContext';

export default function ChurchSchedulesProvider({ churchId, children }) {
  const loadPage = useCallback((page) => listChurchSchedules(churchId, page), [churchId]);
  const schedules = usePaginatedResource(loadPage, churchId);
  return <ChurchSchedulesContext.Provider value={schedules}>{children}</ChurchSchedulesContext.Provider>;
}
