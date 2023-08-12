import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Marker, Popup } from 'react-leaflet';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface Venue {
  fsq_id: string;
  name: string;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
}

export default function MapContainer() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [data, setData] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'fsq3aCgzAkodfbe6Y0mhTbwzAJVr/U+Ls6sJJjujRz/EMOs='
        }
      };

      try {
        navigator.geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });

            fetch(`https://api.foursquare.com/v3/places/nearby?ll=${latitude},${longitude}`, options)
              .then(response => response.json())
              .then(responseData => {
                const venues: Venue[] = responseData.results || [];
                setData(venues);
              })
              .catch(error => {
                console.error('Error fetching data:', error);
              });
          },
          error => {
            console.error('Error getting user location:', error);
          }
        );
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  console.log(data);
  

  return (
    <Map className='' width="800" height="400" center={userLocation ? [userLocation.latitude, userLocation.longitude] : [38.907132, -77.036546]} zoom={15}>
      {({ TileLayer, Marker, Popup }) => (
        <>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {userLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]}>
              <Popup>
                Your location
              </Popup>
            </Marker>
          )}
          {data.map((item) => (
            <Marker key={item.fsq_id} position={[item.geocodes.main.latitude, item.geocodes.main.longitude]}>
              <Popup>
                {item.name}
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </Map>
  );
}
