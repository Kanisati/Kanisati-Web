import Button from './Button';

export default function LoadMoreButton({ hasMore, loading, onClick, children }) {
  if (!hasMore) return null;
  return <Button variant="light" onClick={onClick} loading={loading} disabled={loading}>{children}</Button>;
}
