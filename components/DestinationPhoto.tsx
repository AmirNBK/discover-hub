import { getImageProps } from "next/image";
import type { Destination } from "@/lib/destinations";
import { photoQuality, photoSizes } from "@/lib/image-config";

export default function DestinationPhoto({ place }: { place: Destination }) {
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
