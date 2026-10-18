import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Heart,
  Mountain,
  Search,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { filterDestinations } from "@/lib/destinations";
import { useApp } from "./AppProvider";
import PlaceCard from "./PlaceCard";

const categories = [
  { label: "All places", icon: Compass },
  { label: "Nature", icon: Mountain },
  { label: "Coast", icon: Waves },
  { label: "Adventure", icon: Wind },
  { label: "Saved", icon: Heart },
];
export default function DestinationExplorer({
  initialQuery = "",
  initialCategory = "All places",
}: {
  initialQuery?: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const { saved } = useApp();
  const places = filterDestinations(query, category, saved);
  return (
    <section
      className="section container"
      id="destinations"
      aria-labelledby="destinations-title"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">A PLACE FOR EVERY KIND OF YOU</span>
          <h2 id="destinations-title">Where will curiosity take you?</h2>
        </div>
        <Link className="text-link" href="/map">
          Explore the map <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="explorer-toolbar">
        <div
          className="filter-tabs"
          role="group"
          aria-label="Destination category"
        >
          {categories.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setCategory(label)}
              aria-pressed={category === label}
              className={category === label ? "active" : ""}
            >
              <Icon size={16} />
              {label}
              {label === "Saved" && saved.length > 0 && (
                <span className="count">{saved.length}</span>
              )}
            </button>
          ))}
        </div>
        <label className="inline-search">
          <Search size={16} />
          <span className="sr-only">Filter destinations</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find your kind of place"
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          )}
        </label>
      </div>
      <div className="result-label" role="status">
        {places.length} {places.length === 1 ? "place" : "places"} to discover
        {category === "Saved"
          ? " · Saved on this device"
          : " · A handpicked collection"}
      </div>
      {places.length ? (
        <div className="places-grid">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={32} />
          <h3>
            {category === "Saved"
              ? "Your next adventure starts with a heart."
              : "A different search, a new possibility."}
          </h3>
          <p>
            {category === "Saved"
              ? "Tap the heart on a destination to keep it in your collection."
              : "Try a destination, country, or a different category."}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setCategory("All places");
              setQuery("");
            }}
          >
            Browse all places
          </button>
        </div>
      )}
    </section>
  );
}
