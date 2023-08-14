import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Inter } from 'next/font/google'
import { Marker, Popup } from 'react-leaflet';
import Image from 'next/image';
import location from '../../assets/icons/location2.svg'
import pic from '../../assets/images/place.jpg'
import { createClient } from 'pexels';
const Map = dynamic(() => import('../../components/Map'), { ssr: false });

const inter = Inter({ subsets: ['latin'] })

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
  const [pics,setPics] = useState<any>()

  const client = createClient('XZYowhK5D5FH0PTSgEWfcbWGtK2v1gLVuROLcUowriW39LIhI1jV3qa2');
  const query = 'locations';

  useEffect(() => {
    client.photos.search({ query, per_page: 10 }).then(photos => {
      setPics(photos)
    });

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

return (
  <Map className='' width="800" height="400" center={userLocation ? [userLocation.latitude, userLocation.longitude] : [38.907132, -77.036546]} zoom={30}>
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
        {data.map((item,index) => (
          <Marker width={200} key={item.fsq_id} position={[item.geocodes.main.latitude, item.geocodes.main.longitude]}>
            <Popup>
              <Image src={pic} alt='pic' />
              <div className='px-3'>
                <div className='flex items-center'>
                  <div className='flex flex-col' style={{ margin: '10px 0px' }}>
                    <p className={`text-base font-medium ${inter.className}`} style={{ margin: '0px 0px' }}>
                      {item.name}
                    </p>
                    <p className='text-xs' style={{ margin: '0px 0px', color: 'gray' }}>
                      {item.categories[0]?.name}
                    </p>
                  </div>
                  <hr style={{ width: '34px', borderColor: 'lightgray', transform: 'rotate(90deg)' }} />
                  <div className='flex flex-col items-center gap-1'>
                    <Image src={location} alt='location' style={{ width: '20px' }} />
                    <p style={{ margin: '0', color: 'gray' }} className='text-xs'> {item?.distance} mil </p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </>
    )}
  </Map>
);
}
