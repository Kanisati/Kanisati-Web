import { Modal } from '@mantine/core';

// Leaflet controls use z-index 1000. All app dialogs share a layer above the map.
export default function Dialog(props) {
  return <Modal centered withinPortal zIndex={2000} {...props} />;
}
