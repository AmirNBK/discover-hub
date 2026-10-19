import { useState, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowUpRight,
  Compass,
  Heart,
  LocateFixed,
  MapPin,
  Search,
  X,
} from "lucide-react";
import Layout from "@/components/Layout";
import { useApp } from "@/components/AppProvider";
import { distanceKm } from "@/lib/destinations";
import { useDestinations } from "@/lib/catalogue";
import {
  CataloguePagination,
  CatalogueStatus,
} from "@/components/CatalogueStatus";
import type { Coordinates, MapPlace } from "@/lib/places";
import { photoQuality, photoSizes } from "@/lib/image-config";
const ExplorerMap = dynamic(() => import("@/components/Map/ExplorerMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <Compass size={32} />
      <p>Finding a new perspective…</p>
    </div>
  ),
});
const subscribeHydration = () => () => {};
export default function MapPage() {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  // Wait for router query hydration before initialising the search state.
  if (!hydrated || !router.isReady)
    return (
      <Layout title="Explore the map" compact>
        <div className="map-loading">Getting your map ready…</div>
      </Layout>
    );
  return (
    <MapExplorer
      key={router.asPath}
      initialQuery={
        typeof router.query.q === "string" ? router.query.q.slice(0, 100) : ""
      }
      initialPlace={
        typeof router.query.place === "string" ? router.query.place : null
      }
    />
  );
}
function MapExplorer({
  initialQuery,
  initialPlace,
}: {
  initialQuery: string;
  initialPlace: string | null;
}) {
  const [query, setQuery] = useState(initialQuery),
    [category, setCategory] = useState("All places");
  const [selected, setSelected] = useState<string | null>(initialPlace);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [nearby, setNearby] = useState<MapPlace[] | null>(null),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"curated" | "nearby">("curated");
  const requestId = useRef(0);
  const { saved, toggleSaved, saveDisabled, refreshSession } = useApp();
  const catalogue = useDestinations(
    mode === "curated" ? query : "",
    category,
    50,
    initialPlace,
  );
  const curated = catalogue.places;
  const places: MapPlace[] =
    mode === "nearby" && nearby !== null
      ? nearby.filter((p) =>
          `${p.name} ${p.category} ${p.address}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        )
      : curated.map((place) => ({
          id: place.id,
          name: place.name,
          category: place.category,
          latitude: place.latitude,
          longitude: place.longitude,
          address: `${place.region}, ${place.country}`,
          curated: true,
        }));
  if (location)
    places.sort(
      (a, b) =>
        distanceKm(location, [a.latitude, a.longitude]) -
        distanceKm(location, [b.latitude, b.longitude]),
    );
  async function loadNearby(coords: Coordinates, id: number) {
    try {
      const res = await fetch(`/api/places?lat=${coords[0]}&lng=${coords[1]}`, {
        signal: AbortSignal.timeout(12000),
      });
      const data = await res.json();
      if (id !== requestId.current) return;
      if (!res.ok)
        throw new Error(data.error || "Nearby search is unavailable.");
      setNearby(data.places);
      setMode("nearby");
      setQuery("");
      setCategory("All places");
      setSelected(null);
      setStatus(
        data.places.length
          ? "Nearby places from Foursquare. Distances are straight-line estimates."
          : "No nearby places were found. Try the handpicked collection.",
      );
    } catch (err) {
      if (id !== requestId.current) return;
      setStatus(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "Nearby search took too long. You can still explore the handpicked collection.",
      );
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }
  function locate() {
    if (busy) return;
    const id = ++requestId.current;
    if (!navigator.geolocation) {
      setStatus(
        "Location is not available in this browser. You can still search the collection.",
      );
      return;
    }
    setBusy(true);
    setStatus("Waiting for your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (id !== requestId.current) return;
        const coords: Coordinates = [pos.coords.latitude, pos.coords.longitude];
        setLocation(coords);
        setSelected(null);
        setStatus("Looking for places near you…");
        void loadNearby(coords, id);
      },
      (err) => {
        if (id !== requestId.current) return;
        setBusy(false);
        setStatus(
          err.code === 1
            ? "Location permission was declined. Search or choose a destination to keep exploring."
            : "We couldn’t find your location. Please try again or choose a destination.",
        );
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }
  function reset() {
    requestId.current++;
    setBusy(false);
    setMode("curated");
    setQuery("");
    setCategory("All places");
    setSelected(null);
    setStatus("");
  }
  return (
    <Layout title="Explore the map" compact>
      <div className="map-page">
        <aside className="map-sidebar" aria-label="Places to explore">
          <div className="map-sidebar-heading">
            <span className="eyebrow">LET CURIOSITY LEAD</span>
            <h1>
              Your next <em>discovery.</em>
            </h1>
            <p>Find a place. Change your perspective.</p>
          </div>
          <label className="map-search">
            <Search size={18} />
            <span className="sr-only">Search map places</span>
            <input
              type="search"
              placeholder={
                mode === "nearby"
                  ? "Search nearby results"
                  : "Search a place, country, or mood"
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              maxLength={100}
            />
            {query && (
              <button
                aria-label="Clear map search"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </label>
          <button className="location-button" onClick={locate} disabled={busy}>
            <LocateFixed size={17} />
            {busy ? "Finding your location…" : "Use my location"}
            <ArrowUpRight size={16} />
          </button>
          {status && (
            <div className="map-status" role="status">
              {status}
            </div>
          )}
          <div className="map-filters" role="group" aria-label="Map categories">
            {(mode === "nearby"
              ? ["Nearby"]
              : ["All places", ...catalogue.categories, "Saved"]
            ).map((label) => (
              <button
                key={label}
                aria-pressed={mode === "nearby" || category === label}
                onClick={() => {
                  setCategory(label);
                  setSelected(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="map-result-summary">
            <span>
              {mode === "curated" && catalogue.error
                ? "Places are temporarily unavailable"
                : mode === "curated" && catalogue.loading
                  ? "Loading places…"
                  : `${mode === "curated" ? catalogue.total : places.length} ${places.length === 1 ? "place" : "places"}`}{" "}
              · {mode === "nearby" ? "Nearby" : "Handpicked for you"}
            </span>
            <button onClick={reset}>Reset</button>
          </div>
          <div className="map-results">
            {mode === "curated" && (catalogue.loading || catalogue.error) ? (
              <CatalogueStatus
                error={catalogue.error}
                retry={() => {
                  void refreshSession();
                  catalogue.retry();
                }}
              />
            ) : places.length ? (
              places.map((place) => {
                const destination = curated.find(
                  (p) => p.id === place.id && place.curated,
                );
                return (
                  <article
                    key={place.id}
                    className={`map-result ${selected === place.id ? "selected" : ""}`}
                  >
                    <button
                      className="map-result-main"
                      onClick={() => setSelected(place.id)}
                      aria-pressed={selected === place.id}
                    >
                      {destination?.cardImage ? (
                        <div className="map-result-photo">
                          <Image
                            src={destination.cardImage}
                            alt={destination.imageAlt}
                            fill
                            sizes={photoSizes.thumbnail}
                            quality={photoQuality}
                          />
                        </div>
                      ) : (
                        <div className="map-result-placeholder">
                          <MapPin size={24} />
                        </div>
                      )}
                      <div>
                        <span className="eyebrow">{place.category}</span>
                        <h2>{place.name}</h2>
                        <p>{place.address}</p>
                        {location && (
                          <small>
                            {distanceKm(location, [
                              place.latitude,
                              place.longitude,
                            ]).toLocaleString(undefined, {
                              maximumFractionDigits: 1,
                            })}{" "}
                            km away · straight line
                          </small>
                        )}
                      </div>
                    </button>
                    <div className="map-result-actions">
                      {destination && (
                        <>
                          <Link href={`/destinations/${place.id}`}>
                            Details <ArrowUpRight size={13} />
                          </Link>
                          <button
                            aria-label={`${saved.includes(place.id) ? "Unsave" : "Save"} ${place.name}`}
                            aria-pressed={saved.includes(place.id)}
                            disabled={saveDisabled(place.id)}
                            onClick={() => toggleSaved(place.id)}
                          >
                            <Heart
                              size={15}
                              fill={
                                saved.includes(place.id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Directions <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <Compass size={28} />
                <h3>No places found.</h3>
                <p>Try a different search or explore the full collection.</p>
                <button className="text-link" onClick={reset}>
                  Show all places <ArrowUpRight size={16} />
                </button>
              </div>
            )}
          </div>
          {mode === "curated" && <CataloguePagination {...catalogue} />}
          <div className="map-sidebar-footer">
            <Compass size={14} />
            <span>
              {mode === "nearby"
                ? "Place data by Foursquare"
                : "A little inspiration. A whole new view."}
            </span>
          </div>
        </aside>
        <div className="map-panel">
          <ExplorerMap
            places={places}
            selected={selected}
            onSelect={setSelected}
            location={location}
          />
          <div className="map-legend">
            <span className="legend-pin" />
            {mode === "nearby" ? "Nearby places" : "The DiscoverHub collection"}
          </div>
        </div>
      </div>
    </Layout>
  );
}
