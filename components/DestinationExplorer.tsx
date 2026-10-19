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
import { useDestinations } from "@/lib/catalogue";
import { CataloguePagination, CatalogueStatus } from "./CatalogueStatus";
import { useApp } from "./AppProvider";
import PlaceCard from "./PlaceCard";

const icons = [
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
  const { saved, user, refreshSession } = useApp();
  const catalogue = useDestinations(query, category);
  const { places } = catalogue;
  const categories = ["All places", ...catalogue.categories, "Saved"].map(
    (label) => ({
      label,
      icon: icons.find((item) => item.label === label)?.icon || Compass,
    }),
  );
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
            maxLength={100}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          )}
        </label>
      </div>
      <div className="result-label" role="status">
        {catalogue.error
          ? "Places are temporarily unavailable"
          : catalogue.loading
            ? "Loading places…"
            : `${catalogue.total} ${catalogue.total === 1 ? "place" : "places"} to discover`}
        {category === "Saved"
          ? user
            ? " · Synced to your account"
            : " · Saved on this device"
          : " · A handpicked collection"}
      </div>
      {catalogue.loading || catalogue.error ? (
        <CatalogueStatus
          error={catalogue.error}
          retry={() => {
            void refreshSession();
            catalogue.retry();
          }}
        />
      ) : places.length ? (
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
      <CataloguePagination {...catalogue} />
    </section>
  );
}
