import { useCallback } from 'react';
import { deleteChurchReview, listChurchReviews, saveChurchReview } from '../api/reviews';
import { usePaginatedResource } from '../hooks/usePaginatedResource';
import { ReviewsContext } from './ReviewsContext';

export default function ReviewsProvider({ churchId, children }) {
  const loadPage = useCallback((page) => listChurchReviews(churchId, page), [churchId]);
  const reviews = usePaginatedResource(loadPage, churchId);
  const saveReview = async (values) => {
    const review = { rating: Number(values.rating) };
    if (values.comment.trim()) review.comment = values.comment.trim();
    const message = await saveChurchReview(churchId, review);
    reviews.refresh();
    return message;
  };
  const deleteReview = async () => {
    const message = await deleteChurchReview(churchId);
    reviews.refresh();
    return message;
  };
  return <ReviewsContext.Provider value={{ ...reviews, saveReview, deleteReview }}>{children}</ReviewsContext.Provider>;
}
