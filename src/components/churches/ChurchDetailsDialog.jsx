import { useDiscovery } from '../../contexts/DiscoveryContext';
import ReviewsProvider from '../../contexts/ReviewsProvider';
import { Dialog, RequestState } from '../ui';
import ChurchProfile from './ChurchProfile';
import ReviewsSection from './ReviewsSection';

export default function ChurchDetailsDialog() {
  const { selectedChurchId, closeChurch, detail } = useDiscovery();
  return (
    <Dialog opened={Boolean(selectedChurchId)} onClose={closeChurch} title={detail.data?.name || 'Church details'} size="lg">
      <RequestState {...detail} loadingMessage="Loading church details…" isEmpty={!detail.data} emptyMessage="Church details are unavailable." />
      {detail.data && <ChurchProfile church={detail.data} />}
      {selectedChurchId && (
        <ReviewsProvider key={selectedChurchId} churchId={selectedChurchId}>
          {detail.data && <ReviewsSection />}
        </ReviewsProvider>
      )}
    </Dialog>
  );
}
