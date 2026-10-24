import { useCallback, useEffect, useReducer, useRef } from 'react';
import { findChurches, getChurch } from '../api/churches';
import { useApiResource } from '../hooks/useApiResource';
import { BEIRUT, coordinatesOf } from '../utils/coordinates';
import { DiscoveryContext } from './DiscoveryContext';

const initialState = {
  query: '', churches: [], position: null, center: BEIRUT, zoom: 12,
  status: 'idle', error: null, resultLabel: '', selectedChurchId: null, massQuery: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'query': return { ...state, query: action.query };
    case 'start': return { ...state, status: action.status, error: null };
    case 'location': return { ...state, position: action.position, center: action.position, zoom: 14, massQuery: action.massQuery, status: 'loading' };
    case 'results': return { ...state, ...action.view, churches: action.churches, resultLabel: action.label, status: 'success', error: null };
    case 'error': return { ...state, status: 'error', error: action.error };
    case 'select': return { ...state, selectedChurchId: action.church.id, ...(coordinatesOf(action.church) ? { center: coordinatesOf(action.church), zoom: 15 } : {}) };
    case 'close': return { ...state, selectedChurchId: null };
    default: return state;
  }
}

export default function DiscoveryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current += 1; }, []);
  const loadDetail = useCallback(() => getChurch(state.selectedChurchId), [state.selectedChurchId]);
  const detail = useApiResource(loadDetail, state.selectedChurchId, Boolean(state.selectedChurchId));

  const searchChurches = async (event) => {
    event.preventDefault();
    const id = ++requestId.current;
    const query = state.query.trim();
    dispatch({ type: 'start', status: 'loading' });
    try {
      const churches = await findChurches(query);
      if (requestId.current !== id) return;
      const located = churches.find((church) => coordinatesOf(church));
      dispatch({
        type: 'results', churches, label: query ? `Results for “${query}”` : 'All churches',
        view: { position: null, massQuery: null, ...(located ? { center: coordinatesOf(located), zoom: churches.length === 1 ? 14 : 11 } : {}) },
      });
    } catch (error) {
      if (requestId.current === id) dispatch({ type: 'error', error });
    }
  };

  const requestLocation = () => {
    const id = ++requestId.current;
    if (!navigator.geolocation) {
      dispatch({ type: 'error', error: 'Location is not supported by this browser. You can search by church name or city.' });
      return;
    }
    dispatch({ type: 'start', status: 'locating' });
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      if (requestId.current !== id) return;
      const position = [coords.latitude, coords.longitude];
      const from = new Date();
      // Reuse this window on every page so occurrences do not shift while paging.
      const massQuery = {
        latitude: String(coords.latitude), longitude: String(coords.longitude), radiusKm: '25',
        from: from.toISOString(), to: new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      dispatch({ type: 'location', position, massQuery });
      try {
        const churches = await findChurches(state.query, position);
        if (requestId.current === id) dispatch({ type: 'results', churches, label: 'Nearby churches' });
      } catch (error) {
        if (requestId.current === id) dispatch({ type: 'error', error });
      }
    }, (error) => {
      if (requestId.current !== id) return;
      dispatch({ type: 'error', error: error.code === 1 ? 'Location access was denied. You can search by church name or city.' : 'Could not get your location. Please try again or search by city.' });
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  };

  return (
    <DiscoveryContext.Provider value={{
      ...state, detail, searchChurches, requestLocation,
      setQuery: (query) => dispatch({ type: 'query', query }),
      selectChurch: (church) => dispatch({ type: 'select', church }),
      closeChurch: () => dispatch({ type: 'close' }),
    }}>
      {children}
    </DiscoveryContext.Provider>
  );
}
