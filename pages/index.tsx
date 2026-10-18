import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Compass,
  MapPin,
  Mountain,
  Search,
  Sparkles,
} from "lucide-react";
import Layout from "@/components/Layout";
import DestinationExplorer from "@/components/DestinationExplorer";
import lake from "@/assets/photos/braies-hero.webp";
import view from "@/assets/photos/lake-braies-card.webp";
import { photoQuality, photoSizes } from "@/lib/image-config";
export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  function search(e: FormEvent) {
    e.preventDefault();
    void router.push({
      pathname: "/map",
      query: query.trim() ? { q: query.trim() } : {},
    });
  }
  return (
    <Layout title="A world of possibility">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow light">
              <span className="tiny-line" /> FOR THE BEAUTIFULLY CURIOUS
            </span>
            <h1>
              A little curiosity.
              <br />A world of <em>possibility.</em>
            </h1>
            <p>
              Some places stay with you. Discover the hidden corners, wide-open
              spaces, and little escapes worth going out for.
            </p>
            <form className="hero-search" onSubmit={search}>
              <MapPin size={21} />
              <label className="sr-only" htmlFor="hero-search">
                Where would you like to go?
              </label>
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Where does your mind wander?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                maxLength={100}
              />
              <button type="submit" aria-label="Search destinations">
                <Search size={21} />
              </button>
            </form>
            <div className="hero-suggestions">
              <span>A little inspiration:</span>
              {["Italy", "Thailand", "Adventure"].map((item) => (
                <Link href={`/map?q=${item}`} key={item}>
                  {item} <ArrowUpRight size={11} />
                </Link>
              ))}
            </div>
            <a className="hero-bottom-link" href="#destinations">
              <span>
                <ArrowDown size={16} />
              </span>{" "}
              Your next adventure is a little further down
            </a>
          </div>
          <div className="hero-visual">
            <Image
              className="hero-image"
              src={lake}
              alt="A wooden boathouse reflected in Lake Braies beneath the Dolomites"
              fill
              priority
              sizes={photoSizes.hero}
              quality={photoQuality}
            />
            <div className="image-shade" />
            <div className="hero-photo-top">
              <span className="photo-pill">
                <Compass size={14} /> TAKE THE SCENIC ROUTE
              </span>
              <Sparkles size={26} strokeWidth={1.2} />
            </div>
            <div className="hero-photo-caption">
              <div>
                <span>
                  <MapPin size={14} /> SOUTH TYROL, ITALY
                </span>
                <h2>
                  A different kind
                  <br />
                  of everyday.
                </h2>
              </div>
              <Link
                href="/destinations/lake-braies"
                aria-label="Discover Lake Braies"
              >
                <ArrowUpRight size={27} />
              </Link>
            </div>
            <div className="coordinate">46°41′39.5″N &nbsp; 12°05′08.2″E</div>
          </div>
        </div>
      </section>
      <div className="discovery-strip">
        <div className="container">
          <span>
            <Compass size={19} /> Follow your curiosity
          </span>
          <span className="strip-dot">✳</span>
          <span>
            <Mountain size={19} /> Find your kind of escape
          </span>
          <span className="strip-dot">✳</span>
          <span>
            <Bookmark size={18} /> Keep the places you love
          </span>
          <span className="strip-dot">✳</span>
          <span className="strip-last">
            A world waiting to be found <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
      <DestinationExplorer />
      <section className="how-section container">
        <div className="how-intro">
          <span className="eyebrow">LESS PLANNING. MORE POSSIBILITY.</span>
          <h2>
            A good day out
            <br />
            starts right here.
          </h2>
          <p>
            No endless tabs. Just a few simple ways to find your next favourite
            place.
          </p>
          <Link className="text-link" href="/about-us">
            A little about us <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="steps">
          {[
            {
              number: "01",
              icon: Compass,
              title: "Find what moves you",
              text: "A mountain morning or a slow day by the sea. Explore places that match your mood.",
            },
            {
              number: "02",
              icon: Bookmark,
              title: "Make it your collection",
              text: "See something you love? Tap the heart and keep your favourites together on this device.",
            },
            {
              number: "03",
              icon: MapPin,
              title: "Go a little further",
              text: "Find your place on the map, open directions, and turn a little inspiration into a day out.",
            },
          ].map(({ number, icon: Icon, title, text }) => (
            <div className="step" key={number}>
              <span className="step-number">{number}</span>
              <div className="step-icon">
                <Icon size={23} strokeWidth={1.6} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="container journal-section">
        <div className="journal-image">
          <Image
            src={view}
            alt="Sunset over the boathouse and mountain peaks at Lake Braies"
            fill
            sizes={photoSizes.journal}
            quality={photoQuality}
          />
        </div>
        <div className="journal-copy">
          <span className="eyebrow">THE ART OF GETTING A LITTLE LOST</span>
          <h2>
            The best moments
            <br />
            aren’t always <em>planned.</em>
          </h2>
          <p>
            Take the turn you haven’t taken. Stay a little longer. Trade the
            familiar for a new view. Sometimes, that’s all it takes to find
            something wonderful.
          </p>
          <Link href="/map" className="button">
            Find a new perspective <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <span className="eyebrow">
              GO ON. THERE’S A WHOLE WORLD OUT THERE.
            </span>
            <h2>
              Where to <em>next?</em>
            </h2>
          </div>
          <Link href="/map" className="button">
            Let curiosity lead <ArrowRight size={19} />
          </Link>
          <Compass className="cta-compass" size={190} strokeWidth={0.5} />
        </div>
      </section>
    </Layout>
  );
}
