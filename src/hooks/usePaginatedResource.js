import { useCallback, useReducer, useRef } from 'react';
import { useApiResource } from './useApiResource';

function moreReducer(state, action) {
  if (action.loading || state.version === action.version) return action;
  return state;
}

export function usePaginatedResource(loadPage, key, enabled = true) {
  const loadFirstPage = useCallback(() => loadPage(1), [loadPage]);
  const resource = useApiResource(loadFirstPage, key, enabled);
  const [more, updateMore] = useReducer(moreReducer, {});
  const pending = useRef(new Set());
  const data = resource.data;
  const hasMore = resource.status === 'success' && (data?.pagination?.page ?? 1) < (data?.pagination?.totalPages ?? 1);
  const loadingMore = more.version === resource.version && more.loading;

  const loadMore = async () => {
    const version = resource.version;
    if (!hasMore || pending.current.has(version)) return;
    pending.current.add(version);
    updateMore({ version, loading: true, error: null });
    try {
      const next = await loadPage(data.pagination.page + 1);
      resource.updateData((current) => ({ ...next, items: [...current.items, ...next.items] }));
      updateMore({ version, loading: false, error: null });
    } catch (error) {
      updateMore({ version, loading: false, error });
    } finally {
      pending.current.delete(version);
    }
  };

  return {
    items: data?.items ?? [],
    summary: data?.summary ?? null,
    pagination: data?.pagination,
    status: resource.status,
    error: resource.error || (more.version === resource.version ? more.error : null),
    hasMore,
    loadingMore: Boolean(loadingMore),
    loadMore,
    refresh: resource.refresh,
  };
}
