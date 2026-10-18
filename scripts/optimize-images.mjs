// Build-time asset preparation. Visitors never contact the photo provider.
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const directory = new URL("../assets/photos/", import.meta.url);
await mkdir(directory, { recursive: true });
const photos = [
  {
    name: "braies-hero",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Seclusion_in_Lago_di_Braies_%28Unsplash%29.jpg",
    width: 1600,
    height: 1920,
    fit: "cover",
  },
  {
    name: "lake-braies",
    original: "braies-hero",
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Seclusion_in_Lago_di_Braies_%28Unsplash%29.jpg",
    width: 1920,
  },
  {
    name: "lake-garda",
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Lake_Garda_at_Night_%28Unsplash%29.jpg",
    width: 2560,
  },
  {
    name: "koh-lipe",
    url: "https://upload.wikimedia.org/wikipedia/commons/1/18/Koh_Lipe_%28island%29%2C_Tropical_beach_2%2C_Thailand.jpg",
    width: 2560,
  },
  {
    name: "cappadocia",
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Hot_air_baloon_%28Unsplash%29.jpg",
    width: 2560,
    quality: 80,
  },
];
const originals = new URL("../artifacts/photo-originals/", import.meta.url);
await mkdir(originals, { recursive: true });
// Fetch sequentially so the source host is not hit with a burst of originals.
let failed = false;
for (const photo of photos) {
  try {
    const cached = new URL(`${photo.original || photo.name}.jpg`, originals);
    let original;
    try {
      original = await readFile(cached);
    } catch {
      const response = await fetch(photo.url, {
        headers: { "User-Agent": "DiscoverHub/1.0 (photo asset preparation)" },
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok)
        throw new Error(`${photo.name}: HTTP ${response.status}`);
      original = Buffer.from(await response.arrayBuffer());
      await writeFile(cached, original);
    }
    const metadata = await sharp(original).metadata();
    if (!metadata.width || metadata.width < photo.width)
      throw new Error(`${photo.name}: source is too small`);
    const { data, info } = await sharp(original)
      .rotate()
      .resize({
        width: photo.width,
        height: photo.height,
        fit: photo.fit || "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: photo.quality || 84, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    if (data.length > 600 * 1024)
      throw new Error(`${photo.name}: exceeds the 600 KiB master budget`);
    await writeFile(new URL(`${photo.name}.webp`, directory), data);
    console.log({
      name: photo.name,
      original: `${metadata.width}×${metadata.height}`,
      output: `${info.width}×${info.height}`,
      bytes: data.length,
      kib: Math.round(data.length / 1024),
    });
    if (photo.name !== "braies-hero") {
      for (const variant of [
        { suffix: "card", width: 1280, height: 1280 },
        { suffix: "detail", width: 2560, height: 960 },
      ]) {
        const output = await sharp(original)
          .rotate()
          .resize({
            width: variant.width,
            height: variant.height,
            fit: "cover",
            withoutEnlargement: true,
          })
          .webp({ quality: 84, effort: 6 })
          .toBuffer();
        await writeFile(
          new URL(`${photo.name}-${variant.suffix}.webp`, directory),
          output,
        );
        console.log(
          `${photo.name}-${variant.suffix}: ${Math.round(output.length / 1024)} KiB`,
        );
      }
    }
  } catch (error) {
    failed = true;
    console.error(error.message);
  }
}
if (failed) process.exitCode = 1;
