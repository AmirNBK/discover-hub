import type { NextApiRequest, NextApiResponse } from "next";
import { allowMethod, rateLimit } from "@/lib/server/http";
import type { MapPlace } from "@/lib/places";

type FoursquarePlace = {
  fsq_place_id?: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  categories?: { name?: string }[];
  distance?: number;
  location?: { formatted_address?: string };
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!allowMethod(req, res, ["GET"]) || !rateLimit(req, res, "places", 10))
    return;
  const { lat, lng } = req.query;
  if (
    typeof lat !== "string" ||
    typeof lng !== "string" ||
    !lat.trim() ||
    !lng.trim() ||
    !Number.isFinite(Number(lat)) ||
    !Number.isFinite(Number(lng)) ||
    Math.abs(Number(lat)) > 90 ||
    Math.abs(Number(lng)) > 180
  ) {
    return res
      .status(400)
      .json({ error: "Valid latitude and longitude are required." });
  }
  if (!process.env.FOURSQUARE_API_KEY)
    return res.status(503).json({
      error:
        "Live nearby discovery is not connected yet. You can still explore our handpicked destinations.",
      configured: false,
    });
  try {
    const params = new URLSearchParams({
      ll: `${Number(lat)},${Number(lng)}`,
      radius: "10000",
      limit: "20",
      sort: "DISTANCE",
      fields:
        "fsq_place_id,name,latitude,longitude,categories,location,distance",
    });
    const response = await fetch(
      `https://places-api.foursquare.com/places/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FOURSQUARE_API_KEY}`,
          Accept: "application/json",
          "X-Places-Api-Version": "2025-06-17",
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const data = (await response.json()) as { results?: FoursquarePlace[] };
    if (!Array.isArray(data.results))
      throw new Error("Invalid provider response");
    const places: MapPlace[] = data.results
      .filter(
        (p) =>
          p.fsq_place_id &&
          p.name &&
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          Number.isFinite(p.latitude) &&
          Number.isFinite(p.longitude) &&
          Math.abs(p.latitude) <= 90 &&
          Math.abs(p.longitude) <= 180,
      )
      .map((p) => ({
        id: p.fsq_place_id!,
        name: p.name!,
        latitude: p.latitude!,
        longitude: p.longitude!,
        category: p.categories?.[0]?.name || "Place",
        address: p.location?.formatted_address || "",
        distance: p.distance,
      }));
    return res.status(200).json({ places });
  } catch {
    return res.status(502).json({
      error:
        "Nearby discovery is temporarily unavailable. Your map and handpicked destinations are still here.",
    });
  }
}
