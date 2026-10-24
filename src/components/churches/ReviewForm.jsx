import { useState } from 'react';
import { Group, Stack, Text } from '@mantine/core';
import { useFormState } from '../../hooks/useFormState';
import { useReviews } from '../../contexts/ReviewsContext';
import { Button, Input, SelectInput, Feedback } from '../ui';

export default function ReviewForm() {
  const { saveReview, deleteReview } = useReviews();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const form = useFormState({ rating: '5', comment: '' });
  const submit = form.submit(async (values) => {
    if (confirmDelete) return;
    const message = await saveReview(values);
    form.setValue('comment', '');
    return message;
  });
  const remove = form.submit(async () => {
    let message;
    try {
      message = await deleteReview();
    } catch (error) {
      if (error.status === 404) throw new Error('No review was found to delete for your account at this church.', { cause: error });
      throw error;
    }
    form.setValue('comment', '');
    form.setValue('rating', '5');
    setConfirmDelete(false);
    return message;
  });
  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <Text fw={600}>Write a review</Text>
        <Feedback message={form.message} tone="success" />
        <Feedback message={form.error} />
        <SelectInput label="Rating" data={['5', '4', '3', '2', '1']} value={form.values.rating} error={form.errors.rating} onChange={(value) => form.setValue('rating', value || '5')} allowDeselect={false} required />
        <Input kind="textarea" label="Comment" {...form.field('comment')} maxLength={1000} autosize minRows={3} description={`${form.values.comment.length}/1000 characters`} />
        <Button type="submit" loading={form.submitting && !confirmDelete} disabled={form.submitting || confirmDelete}>Submit review</Button>
        {confirmDelete ? (
          <Stack gap="xs">
            <Text size="sm">Delete your review for this church? This cannot be undone.</Text>
            <Group>
              <Button color="red" loading={form.submitting} onClick={remove}>Confirm deletion</Button>
              <Button variant="default" disabled={form.submitting} onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </Group>
          </Stack>
        ) : (
          <Button variant="subtle" color="red" disabled={form.submitting} onClick={() => setConfirmDelete(true)}>Delete my review</Button>
        )}
      </Stack>
    </form>
  );
}
