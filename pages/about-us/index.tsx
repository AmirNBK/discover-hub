import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, Heart, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import lake from "@/assets/photos/braies-hero.webp";
import { photoQuality, photoSizes } from "@/lib/image-config";
export default function About() {
  return (
    <Layout title="Our story">
      <section className="container about-hero">
        <div>
          <span className="eyebrow">HELLO, WE’RE DISCOVERHUB</span>
          <h1>
            For the places
            <br />
            you haven’t <em>found yet.</em>
          </h1>
          <p className="lead">
            We believe a little curiosity can turn an ordinary day into a story
            worth telling.
          </p>
          <p>
            DiscoverHub started with a simple idea: make it easier to find
            somewhere new. A quiet corner, a remarkable landscape, a destination
            you keep coming back to in your mind.
          </p>
          <p>
            Today, we’re bringing that idea to life with a thoughtful collection
            of places, a map to put them in perspective, and a space to save
            what inspires you.
          </p>
          <Link href="/map" className="button">
            See where it takes you <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="about-image">
          <Image
            src={lake}
            alt="A boathouse at sunset on Lake Braies in the Dolomites"
            fill
            sizes={photoSizes.half}
            quality={photoQuality}
            priority
          />
          <span className="photo-pill">
            <MapPin size={14} /> A LITTLE CHANGE OF SCENERY
          </span>
        </div>
      </section>
      <section className="section container">
        <span className="eyebrow">A FEW THINGS WE BELIEVE IN</span>
        <h2>Good places. Simple discoveries.</h2>
        <div className="values-grid">
          {[
            {
              icon: Compass,
              title: "Room for curiosity",
              text: "Start with a mood, a country, or a place. There’s no right way to explore.",
            },
            {
              icon: Heart,
              title: "A collection that’s yours",
              text: "Save the places that speak to you. Your collection stays in your browser, ready when you are.",
            },
            {
              icon: MapPin,
              title: "Inspiration with direction",
              text: "See the bigger picture on the map, then open directions when you’re ready to go.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon size={28} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="simple-banner container">
        <h2>A new view is a good place to start.</h2>
        <Link href="/#destinations" className="button">
          Discover your next place <ArrowUpRight size={18} />
        </Link>
      </section>
    </Layout>
  );
}
