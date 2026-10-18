import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Coordinates, MapPlace } from "@/lib/places";

const icon = L.divIcon({
  className: "destination-marker",
  html: "<span></span>",
  iconSize: [32, 40],
  iconAnchor: [16, 36],
  popupAnchor: [0, -34],
});
const activeIcon = L.divIcon({
  className: "destination-marker selected",
  html: "<span></span>",
  iconSize: [38, 46],
  iconAnchor: [19, 42],
  popupAnchor: [0, -40],
});
function Viewport({
  places,
  selected,
  location,
}: {
  places: MapPlace[];
  selected: string | null;
  location: Coordinates | null;
}) {
  const map = useMap();
  const place = places.find((p) => p.id === selected);
  const lat = place?.latitude,
    lng = place?.longitude;
  const userLat = location?.[0],
    userLng = location?.[1];
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      map.flyTo([lat, lng], 12, { duration: 0.6 });
    } else if (userLat !== undefined && userLng !== undefined) {
      map.flyTo([userLat, userLng], 13, { duration: 0.6 });
    } else if (places.length)
      map.fitBounds(
        L.latLngBounds(places.map((p) => [p.latitude, p.longitude])),
        { padding: [60, 60], maxZoom: 11 },
      );
  }, [map, lat, lng, userLat, userLng, places]);
  return null;
}
export default function ExplorerMap({
  places,
  selected,
  onSelect,
  location,
}: {
  places: MapPlace[];
  selected: string | null;
  onSelect: (id: string) => void;
  location: Coordinates | null;
}) {
  const [tileError, setTileError] = useState(false);
  const [tileLoaded, setTileLoaded] = useState(false);
  useEffect(() => {
    if (tileLoaded) return;
    const timer = setTimeout(() => setTileError(true), 12000);
    return () => clearTimeout(timer);
  }, [tileLoaded]);
  return (
    <div className="map-canvas">
      <MapContainer
        center={[46.6943, 12.0856]}
        zoom={6}
        className="leaflet-map"
        scrollWheelZoom
        attributionControl
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => {
              setTileError(false);
              setTileLoaded(true);
            },
          }}
        />
        <Viewport places={places} selected={selected} location={location} />
        {location && (
          <CircleMarker
            center={location}
            radius={8}
            pathOptions={{
              color: "#fff",
              fillColor: "#2774e8",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>Your location</Popup>
          </CircleMarker>
        )}
        {places.map((place) => (
          <Marker
            key={place.id}
            title={place.name}
            position={[place.latitude, place.longitude]}
            icon={place.id === selected ? activeIcon : icon}
            eventHandlers={{ click: () => onSelect(place.id) }}
          >
            <Popup>
              <div className="map-popup">
                <span>{place.category}</span>
                <h3>{place.name}</h3>
                <p>{place.address}</p>
                {place.curated && (
                  <Link href={`/destinations/${place.id}`}>
                    Discover this place →
                  </Link>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open directions ↗
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {tileError && (
        <div className="tile-error" role="status">
          Map tiles could not load. Place details and directions are still
          available.
        </div>
      )}
    </div>
  );
}
