import { useEffect, useLayoutEffect, useState } from 'react';
import styles from './styles.module.scss';

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from 'react-leaflet';
import { Box } from '@mantine/core';

export default function ChurchMap() {
    const [userPosition, setUserPosition] = useState(null);

    const churches = [
        {
            "id": 1,
            "name": "St. George Church",
            "latitude": 33.8938,
            "longitude": 35.5018,
            "city": "Beirut",
            "address": "Achrafieh"
        },
        {
            "id": 2,
            "name": "Saint Elias Church",
            "latitude": 33.9045,
            "longitude": 35.6124,
            "city": "Baabda",
            "address": "Main Road"
        }
    ]

    useEffect(() => {

        if (!navigator.geolocation) {
            console.log("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {

                setUserPosition([
                    position.coords.latitude,
                    position.coords.longitude
                ]);

            },
            (error) => {
                console.log(error.code, error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

    }, []);

    if (!userPosition) {
        return <p>Loading location...</p>;
    }

    return (
        <Box>
            <MapContainer
                center={userPosition}
                zoom={17}
                style={{
                    width: '100%',
                    height: '92vh',
                }}
            >
                <TileLayer
                    attribution='© OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                {churches.map((church) => (
                    <Marker
                        key={church.id}
                        position={[church.latitude, church.longitude]}
                    >
                        <Popup>
                            <h3>{church.name}</h3>

                            <p>{church.city}</p>

                            <p>{church.address}</p>
                        </Popup>
                    </Marker>
                ))}
                <Marker position={userPosition}>
                    <Popup>
                        You are here
                    </Popup>
                </Marker>
            </MapContainer>
        </Box>
    );
}