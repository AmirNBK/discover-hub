import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Marker, Popup } from 'react-leaflet';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function MapContainerDynamic() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userLoc);
        },
        (error) => {
          console.error('Error fetching user location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'fsq3W5+PONjEU/U4flpxxnxZlx85DL2PdVcUSa0/B76dyf4='
        }
      };

      fetch('https://api.foursquare.com/v3/places/search', options)
        .then(response => response.json())
        .then(data => {
          const locations = data.results; // Assuming the response structure contains "results"
          setNearbyLocations(locations);
          console.log(locations);
        })
        .catch(err => console.error('Error fetching nearby locations:', err));
    }
  }, [userLocation]);

  return (
    <div>
      {typeof window !== 'undefined' && userLocation ? (
        <Map width={800} height={400} center={userLocation} zoom={12}>
          {({ TileLayer }) => (
            <>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
              />
              {nearbyLocations.map(location => (
                <Marker
                  position={[location.geocodes.main.latitude, location.geocodes.main.longitude]}
                >
                  <Popup>
                    {location.name}
                  </Popup>
                </Marker>
              ))}
            </>
          )}
        </Map>
      ) : (
        <p>Loading user location...</p>
      )}
    </div>
  );
}
