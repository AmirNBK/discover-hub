import type { StaticImageData } from "next/image";
import braies from "@/assets/photos/lake-braies.webp";
import garda from "@/assets/photos/lake-garda.webp";
import lipe from "@/assets/photos/koh-lipe.webp";
import cappadocia from "@/assets/photos/cappadocia.webp";
import braiesCard from "@/assets/photos/lake-braies-card.webp";
import gardaCard from "@/assets/photos/lake-garda-card.webp";
import lipeCard from "@/assets/photos/koh-lipe-card.webp";
import cappadociaCard from "@/assets/photos/cappadocia-card.webp";
import braiesDetail from "@/assets/photos/lake-braies-detail.webp";
import gardaDetail from "@/assets/photos/lake-garda-detail.webp";
import lipeDetail from "@/assets/photos/koh-lipe-detail.webp";
import cappadociaDetail from "@/assets/photos/cappadocia-detail.webp";

export type Category = "Nature" | "Coast" | "Adventure";
export type Destination = {
  id: string;
  name: string;
  region: string;
  country: string;
  category: Category;
  image: StaticImageData;
  cardImage: StaticImageData;
  detailImage: StaticImageData;
  imageAlt: string;
  latitude: number;
  longitude: number;
  tagline: string;
  description: string;
  highlights: string[];
  tip: string;
};

export const destinations: Destination[] = [
  {
    id: "lake-braies",
    name: "Lake Braies",
    region: "South Tyrol",
    country: "Italy",
    category: "Nature",
    image: braies,
    cardImage: braiesCard,
    detailImage: braiesDetail,
    imageAlt:
      "A wooden boathouse on Lake Braies beneath the Dolomites at sunset",
    latitude: 46.6943,
    longitude: 12.0856,
    tagline: "A little closer to the extraordinary.",
    description:
      "Still turquoise water. Pine-covered shores. Peaks that seem to touch the sky. Tucked into the Dolomites, Lake Braies is an invitation to slow down and take the scenic route.",
    highlights: [
      "Walk the lakeside trail",
      "Take in the Dolomite peaks",
      "Find a quiet spot by the water",
    ],
    tip: "Check local access and parking arrangements before travelling; seasonal restrictions may apply.",
  },
  {
    id: "lake-garda",
    name: "Lake Garda",
    region: "Northern Italy",
    country: "Italy",
    category: "Nature",
    image: garda,
    cardImage: gardaCard,
    detailImage: gardaDetail,
    imageAlt:
      "Mountains and distant town lights reflected in Lake Garda at night",
    latitude: 45.8834,
    longitude: 10.8437,
    tagline: "Take the long way around.",
    description:
      "Follow the shoreline past little harbours, dramatic cliffs, and colourful lakeside towns. Lake Garda brings mountain scenery and a slower Italian rhythm together in one beautiful place.",
    highlights: [
      "Explore the lakeside towns",
      "Follow a scenic walking path",
      "Watch the boats from the harbour",
    ],
    tip: "Choose a town as your base and check local ferry timetables before planning a day on the lake.",
  },
  {
    id: "koh-lipe",
    name: "Koh Lipe",
    region: "Satun",
    country: "Thailand",
    category: "Coast",
    image: lipe,
    cardImage: lipeCard,
    detailImage: lipeDetail,
    imageAlt:
      "A long-tail boat beside the white sand and turquoise water of Koh Lipe",
    latitude: 6.4877,
    longitude: 99.3054,
    tagline: "Trade your everyday for ocean blue.",
    description:
      "Long-tail boats drift over clear water, sandy paths lead to the sea, and the day follows the tide. This small island in southern Thailand is made for unhurried exploration.",
    highlights: [
      "Walk along the sandy shores",
      "Explore responsibly by boat",
      "Catch a beachside sunset",
    ],
    tip: "Boat services depend on weather and season. Check conditions locally and respect marine park rules.",
  },
  {
    id: "cappadocia",
    name: "Cappadocia",
    region: "Central Anatolia",
    country: "Türkiye",
    category: "Adventure",
    image: cappadocia,
    cardImage: cappadociaCard,
    detailImage: cappadociaDetail,
    imageAlt: "Hot-air balloons above snow-covered valleys in Cappadocia",
    latitude: 38.6431,
    longitude: 34.8289,
    tagline: "Let your curiosity take flight.",
    description:
      "Discover sculpted valleys, cave architecture, and a landscape that feels like another world. Start with a walk, follow a new trail, and leave room for a little wonder.",
    highlights: [
      "Explore the valleys on foot",
      "Discover Göreme",
      "Watch the morning balloons",
    ],
    tip: "Balloon flights are weather-dependent. Confirm availability and safety details directly with a licensed operator.",
  },
];

export function filterDestinations(
  query: string,
  category = "All places",
  saved?: string[],
) {
  const term = query.trim().toLocaleLowerCase();
  return destinations.filter(
    (place) =>
      (category === "All places" ||
        (category === "Saved"
          ? saved?.includes(place.id)
          : place.category === category)) &&
      `${place.name} ${place.region} ${place.country} ${place.category}`
        .toLocaleLowerCase()
        .includes(term),
  );
}

export function distanceKm(a: [number, number], b: [number, number]) {
  const rad = (n: number) => (n * Math.PI) / 180;
  const h =
    Math.sin(rad(b[0] - a[0]) / 2) ** 2 +
    Math.cos(rad(a[0])) *
      Math.cos(rad(b[0])) *
      Math.sin(rad(b[1] - a[1]) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
