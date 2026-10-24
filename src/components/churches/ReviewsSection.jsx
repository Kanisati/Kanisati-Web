import { Divider, Stack, Text } from '@mantine/core';
import { useAuth } from '../../contexts/AuthContext';
import { useReviews } from '../../contexts/ReviewsContext';
import { formatDate } from '../../utils/formatDate';
import { ContentCard, LoadMoreButton, RequestState, Section } from '../ui';
import ReviewForm from './ReviewForm';

export default function ReviewsSection() {
  const reviews = useReviews();
  const { canUseUserFeatures, accountKey } = useAuth();
  return (
    <>
      <Divider my="sm" />
      <Section title="Reviews">
        {reviews.summary != null && <Text size="sm" c="dimmed">Average rating: {Number(reviews.summary).toFixed(1)} / 5</Text>}
        <RequestState {...reviews} isEmpty={!reviews.items.length} loadingMessage="Loading reviews…" emptyMessage="No published reviews yet." />
        <Stack gap="xs">
          {reviews.items.map((review) => <ContentCard key={review.id} padding="sm" radius="sm">
            <Text size="sm" fw={600}>{review.rating} / 5</Text>
            {review.comment && <Text size="sm">{review.comment}</Text>}
            {review.createdAt && <Text size="xs" c="dimmed">{formatDate(review.createdAt)}</Text>}
          </ContentCard>)}
        </Stack>
        <LoadMoreButton hasMore={reviews.hasMore} loading={reviews.loadingMore} onClick={reviews.loadMore}>Load more reviews</LoadMoreButton>
        {canUseUserFeatures ? <ReviewForm key={accountKey} /> : <Text size="sm" c="dimmed">Sign in with a user account to write a review.</Text>}
      </Section>
    </>
  );
}
