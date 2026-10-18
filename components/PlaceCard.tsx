import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import { useApp } from "./AppProvider";
import { photoQuality, photoSizes } from "@/lib/image-config";

export default function PlaceCard({ place }: { place: Destination }) {
  const { saved, toggleSaved } = useApp();
  const isSaved = saved.includes(place.id);
  return (
    <article className="place-card">
      <div className="place-photo">
        <Link
          href={`/destinations/${place.id}`}
          aria-label={`Explore ${place.name}`}
        >
          <Image
            src={place.cardImage}
            alt={place.imageAlt}
            fill
            sizes={photoSizes.card}
            quality={photoQuality}
          />
        </Link>
        <span className="photo-label">{place.category}</span>
        <button
          className={`save-button ${isSaved ? "is-saved" : ""}`}
          aria-label={`${isSaved ? "Unsave" : "Save"} ${place.name}`}
          aria-pressed={isSaved}
          onClick={() => toggleSaved(place.id)}
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="place-meta">
        <span>
          <MapPin size={13} />
          {place.region}, {place.country}
        </span>
      </div>
      <Link className="place-title" href={`/destinations/${place.id}`}>
        <h3>{place.name}</h3>
        <ArrowUpRight size={21} />
      </Link>
      <p>{place.tagline}</p>
    </article>
  );
}
