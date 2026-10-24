import { createContext, useContext } from 'react';

export const ReviewsContext = createContext(null);
export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error('useReviews must be used inside ReviewsProvider');
  return context;
}
