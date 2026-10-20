import { getImageProps } from "next/image";
import { MapPin } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import { photoQuality, photoSizes } from "@/lib/image-config";

export default function DestinationPhoto({ place }: { place: Destination }) {
  if (!place.cardImage || !place.detailImage)
    return (
      <div className="destination-placeholder">
        <MapPin size={48} />
        <span>{place.name}</span>
        <small>Photography coming soon</small>
      </div>
    );
  const shared = {
    alt: place.imageAlt,
    fill: true,
    sizes: photoSizes.detail,
    quality: photoQuality,
    loading: "eager" as const,
    fetchPriority: "high" as const,
  };
  const mobile = getImageProps({ ...shared, src: place.cardImage }).props;
  const desktop = getImageProps({ ...shared, src: place.detailImage }).props;
  return (
    <picture>
      <source
        media="(max-width: 760px)"
        srcSet={mobile.srcSet}
        sizes={mobile.sizes}
      />
      {/* Both variants use the Next.js optimizer. A picture source avoids fetching
        a desktop preload as well as a mobile photograph on narrow screens. */}
      <img {...desktop} alt={place.imageAlt} />
    </picture>
  );
}
