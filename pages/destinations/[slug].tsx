import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Heart, MapPin, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { useApp } from "@/components/AppProvider";
import { destinations } from "@/lib/destinations";
import DestinationPhoto from "@/components/DestinationPhoto";

export default function DestinationPage({ id }: { id: string }) {
  const place = destinations.find((item) => item.id === id)!;
  const { saved, toggleSaved } = useApp();
  const isSaved = saved.includes(id);
  return (
    <Layout title={place.name} description={place.description}>
      <div className="container destination-page">
        <Link className="back-link" href="/#destinations">
          <ArrowLeft size={16} /> Back to discovering
        </Link>
        <div className="destination-heading">
          <div>
            <span className="eyebrow">
              {place.category} · {place.country}
            </span>
            <h1>
              {place.name}
              <span className="brand-dot">.</span>
            </h1>
            <p>
              <MapPin size={17} />
              {place.region}, {place.country}
            </p>
          </div>
          <button
            className="button secondary"
            onClick={() => toggleSaved(id)}
            aria-pressed={isSaved}
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Place saved" : "Save this place"}
          </button>
        </div>
        <div className="destination-cover">
          <DestinationPhoto place={place} />
          <span className="destination-photo-note">
            Illustrative photography
          </span>
        </div>
        <div className="destination-content">
          <div>
            <span className="eyebrow">A CHANGE OF SCENERY</span>
            <h2>{place.tagline}</h2>
            <p className="lead">{place.description}</p>
            <h3>A few ways to discover it</h3>
            <ul className="highlight-list">
              {place.highlights.map((item) => (
                <li key={item}>
                  <Sparkles size={17} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <aside className="visit-panel">
            <MapPin size={27} strokeWidth={1.5} />
            <h3>Put a pin in it.</h3>
            <p>{place.tip}</p>
            <Link className="button" href={`/map?place=${id}`}>
              See on the map <ArrowUpRight size={18} />
            </Link>
            <a
              className="text-link"
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open directions <ArrowUpRight size={16} />
            </a>
            <small>Directions open in Google Maps.</small>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
export const getStaticPaths: GetStaticPaths = () => ({
  paths: destinations.map((place) => ({ params: { slug: place.id } })),
  fallback: false,
});
export const getStaticProps: GetStaticProps = ({ params }) => ({
  props: { id: params!.slug },
});
