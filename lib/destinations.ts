import type { StaticImageData } from "next/image";
import braiesCard from "@/assets/photos/lake-braies-card.webp";
import gardaCard from "@/assets/photos/lake-garda-card.webp";
import lipeCard from "@/assets/photos/koh-lipe-card.webp";
import cappadociaCard from "@/assets/photos/cappadocia-card.webp";
import braiesDetail from "@/assets/photos/lake-braies-detail.webp";
import gardaDetail from "@/assets/photos/lake-garda-detail.webp";
import lipeDetail from "@/assets/photos/koh-lipe-detail.webp";
import cappadociaDetail from "@/assets/photos/cappadocia-detail.webp";

export type DestinationRecord = {
  id: string;
  name: string;
  region: string;
  country: string;
  category: string;
  photoKey: string;
  imageAlt: string;
  latitude: number;
  longitude: number;
  tagline: string;
  description: string;
  highlights: string[];
  tip: string;
};
export type Destination = DestinationRecord & {
  cardImage?: StaticImageData;
  detailImage?: StaticImageData;
};

// Only photo assets live in the frontend. Catalogue content comes from Django.
const photos: Record<
  string,
  { cardImage: StaticImageData; detailImage: StaticImageData }
> = {
  "lake-braies": { cardImage: braiesCard, detailImage: braiesDetail },
  "lake-garda": { cardImage: gardaCard, detailImage: gardaDetail },
  "koh-lipe": { cardImage: lipeCard, detailImage: lipeDetail },
  cappadocia: { cardImage: cappadociaCard, detailImage: cappadociaDetail },
};
export function withPhotos(record: DestinationRecord): Destination {
  return {
    ...record,
    ...(record.photoKey === record.id ? photos[record.photoKey] : undefined),
  };
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
