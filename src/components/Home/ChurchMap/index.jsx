import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useDiscovery } from '../../../contexts/DiscoveryContext';
import { BEIRUT, coordinatesOf } from '../../../utils/coordinates';
import { Button } from '../../ui';
import styles from './styles.module.scss';

function MapViewport({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.flyTo(center, zoom); }, [center, map, zoom]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export default function ChurchMap() {
  const { churches, position, center, zoom, selectChurch } = useDiscovery();
  return (
    <div className={styles.mapFrame}>
      <MapContainer center={BEIRUT} zoom={12} className={styles.map}>
        <MapViewport center={center} zoom={zoom} />
        <TileLayer attribution="© OpenStreetMap contributors" url="https://tile.openstreetmap.de/{z}/{x}/{y}.png" />
        {churches.map((church) => {
          const coordinates = coordinatesOf(church);
          return coordinates && (
            <Marker key={church.id} position={coordinates}>
              <Popup>
                <h3>{church.name}</h3>
                <p>{[church.city, church.formattedAddress].filter(Boolean).join(' · ')}</p>
                {Number.isFinite(church.distanceKm) && <p>{church.distanceKm.toFixed(1)} km away</p>}
                <Button size="xs" onClick={() => selectChurch(church)}>View church details</Button>
              </Popup>
            </Marker>
          );
        })}
        {position && <Marker position={position}><Popup>You are here</Popup></Marker>}
      </MapContainer>
    </div>
  );
}
