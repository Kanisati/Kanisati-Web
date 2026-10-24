import { useFavorites } from '../../contexts/FavoritesContext';
import { Button } from '../ui';

export default function FavoriteButton({ church, fullLabel = false }) {
  const { ids, toggleFavorite, pendingId, disabled } = useFavorites();
  const id = String(church.id);
  const saved = ids.has(id);
  return (
    <Button
      variant={saved ? 'filled' : 'light'}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${church.name} from saved churches` : `Save ${church.name}`}
      loading={pendingId === id}
      disabled={disabled}
      onClick={() => toggleFavorite(id)}
    >
      {fullLabel ? (saved ? 'Remove from saved churches' : 'Save church') : (saved ? 'Saved' : 'Save')}
    </Button>
  );
}
