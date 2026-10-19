import type { GetServerSideProps } from "next";
import { backendHeaders, backendURL } from "@/lib/backend";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Heart, MapPin, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { useApp } from "@/components/AppProvider";
import { withPhotos, type DestinationRecord } from "@/lib/destinations";
import DestinationPhoto from "@/components/DestinationPhoto";

type Props = { record: DestinationRecord | null };
export default function DestinationPage({ record }: Props) {
  const { saved, toggleSaved, saveDisabled } = useApp();
  if (!record)
    return (
      <Layout title="Destination temporarily unavailable">
        <section className="container section">
          <h1>A little pause in the journey.</h1>
          <p>We couldn’t load this destination. Please try again shortly.</p>
          <button className="button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </section>
      </Layout>
    );
  const place = withPhotos(record);
  const id = place.id;
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
            disabled={saveDisabled(id)}
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Place saved" : "Save this place"}
          </button>
        </div>
        <div className="destination-cover">
          <DestinationPhoto place={place} />
          {place.detailImage && (
            <span className="destination-photo-note">
              Illustrative photography
            </span>
          )}
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
export const getServerSideProps: GetServerSideProps<Props> = async ({
  params,
  res,
}) => {
  res.setHeader("Cache-Control", "no-store");
  const slug = params?.slug;
  if (
    typeof slug !== "string" ||
    slug.length > 80 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
    return { notFound: true };
  try {
    const response = await fetch(backendURL(`/api/destinations/${slug}`), {
      headers: backendHeaders(),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
      redirect: "manual",
    });
    if (response.status === 404) return { notFound: true };
    if (!response.ok) throw new Error("Catalogue unavailable");
    const data = await response.json();
    return { props: { record: data.destination } };
  } catch {
    res.statusCode = 503;
    return { props: { record: null } };
  }
};
