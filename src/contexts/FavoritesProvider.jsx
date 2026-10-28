import { useEffect, useMemo, useReducer, useRef } from 'react';
import { listFavoriteIds, setFavorite } from '../api/favorites';
import { useApiResource } from '../hooks/useApiResource';
import { useAuth } from './AuthContext';
import { FavoritesContext } from './FavoritesContext';

function mutationReducer(state, action) {
  if (action.pendingId || action.type === 'error' || state.accountKey === action.accountKey) return action;
  return state;
}

export default function FavoritesProvider({ children }) {
  const { accountKey, canUseUserFeatures } = useAuth();
  const resource = useApiResource(listFavoriteIds, accountKey, canUseUserFeatures);
  const refresh = resource.refresh;
  useEffect(() => {
    window.addEventListener('kanisati:favorites-change', refresh);
    return () => window.removeEventListener('kanisati:favorites-change', refresh);
  }, [refresh]);
  const ids = useMemo(() => new Set(resource.data ?? []), [resource.data]);
  const [mutation, setMutation] = useReducer(mutationReducer, {});
  const pending = useRef(new Set());
  const currentMutation = mutation.accountKey === accountKey ? mutation : {};

  const toggleFavorite = async (churchId) => {
    if (!canUseUserFeatures) {
      setMutation({ type: 'error', accountKey, error: 'Sign in with a user account to save churches.' });
      return;
    }
    if (resource.status !== 'success' || pending.current.has(accountKey)) return;
    const id = String(churchId);
    const saved = !ids.has(id);
    pending.current.add(accountKey);
    setMutation({ accountKey, pendingId: id, error: null });
    try {
      await setFavorite(id, saved);
      resource.updateData((current) => saved ? [...current, id] : current.filter((value) => value !== id));
      setMutation({ accountKey, pendingId: null, error: null });
    } catch (error) {
      setMutation({ accountKey, pendingId: null, error });
    } finally {
      pending.current.delete(accountKey);
    }
  };

  return <FavoritesContext.Provider value={{
    ids, toggleFavorite, status: resource.status,
    error: currentMutation.error || resource.error,
    pendingId: currentMutation.pendingId,
    disabled: Boolean(currentMutation.pendingId) || (canUseUserFeatures && resource.status !== 'success'),
  }}>{children}</FavoritesContext.Provider>;
}
