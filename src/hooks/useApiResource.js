import { useEffect, useReducer } from 'react';

function reducer(state, action) {
  if (action.type === 'reset') {
    return { version: action.version, data: null, status: 'idle', error: null };
  }
  if (action.type === 'start') {
    return { version: action.version, data: null, status: 'loading', error: null };
  }
  if (state.version !== action.version) return state;
  switch (action.type) {
    case 'success': return { ...state, data: action.data, status: 'success' };
    case 'error': return { ...state, status: 'error', error: action.error };
    case 'update': return { ...state, data: action.update(state.data) };
    default: return state;
  }
}

/** load must be stable (a module function or useCallback). Old requests cannot replace a new selection. */
export function useApiResource(load, key, enabled = true) {
  const [revision, refresh] = useReducer((current) => current + 1, 0);
  const version = JSON.stringify([key, revision]);
  const [state, dispatch] = useReducer(reducer, { version: null, data: null, status: 'idle', error: null });

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: 'reset', version });
      return;
    }
    let active = true;
    dispatch({ type: 'start', version });
    // Keep the shared GET promise alive during Strict Mode's effect replay.
    Promise.resolve().then(load).then(
      (data) => { if (active) dispatch({ type: 'success', version, data }); },
      (error) => { if (active) dispatch({ type: 'error', version, error }); },
    );
    return () => { active = false; };
  }, [load, version, enabled]);

  const current = enabled && state.version === version
    ? state
    : { data: null, status: enabled ? 'loading' : 'idle', error: null };

  return {
    ...current,
    version,
    refresh,
    updateData: (update) => dispatch({ type: 'update', version, update }),
  };
}
