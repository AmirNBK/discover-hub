import React, { useState, useEffect } from 'react';
import Map from '../../components/Map';

const DEFAULT_CENTER: [number, number] = [38.907132, -77.036546];

export default function MapContainer() {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            },
            (error) => {
                console.error('Error fetching user location:', error);
            }
        );
    }, []);

    return (
        <div>
            {userLocation ? (
                <Map width={800} height={400} center={userLocation} zoom={12}>
                    {({ TileLayer, Marker, Popup }) => (
                        <>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                            />
                            <Marker position={userLocation}>
                                <Popup>
                                    Your current location
                                </Popup>
                            </Marker>
                        </>
                    )}
                </Map>
            ) : (
                <p>Loading user location...</p>
            )}
        </div>
    );
}
