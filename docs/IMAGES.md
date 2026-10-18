# Image quality and delivery

The original active photographs were 400–518 pixels wide and were enlarged in cards, heroes, and detail pages. They have been replaced with high-resolution photographs from 3,072–5,928-pixel originals. Sources and licenses are recorded in [the asset credits](../assets/photos/CREDITS.md) and on `/photo-credits`.

## Delivery

- All photographs are local assets. The browser does not depend on the original photo hosts.
- Next.js negotiates AVIF with WebP fallback, using quality 80 and a bounded set of responsive widths.
- `lib/image-config.ts` matches requested widths to the actual layout rather than requesting full-screen images for mobile cards.
- Card crops are square, detail crops are wide, and a native `picture` element selects the square variant for tall mobile detail covers. Both picture sources use the Next.js image optimizer.
- Heroes are eager/high priority. Cards, journal images, and map thumbnails keep lazy loading. Static import hashes and cache headers allow browsers/CDNs to reuse the results.
- Raster source metadata is removed during preparation. SVG interface icons remain vectors.

## Measured results

Measured against a production build in Chromium. These are the compressed AVIF response bodies of **all six homepage photographs after scrolling the complete page**, including the journal image, not just the initially visible hero. Figures exclude HTML, JavaScript, map tiles, and protocol headers.

| Profile              | Viewport width | Device pixel ratio | All homepage photos | Largest individual photo across tested pages |
| -------------------- | -------------- | ------------------ | ------------------- | -------------------------------------------- |
| Desktop              | 1280 px        | 1×                 | 89 KiB              | 54 KiB                                       |
| High-density desktop | 1440 px        | 2×                 | 275 KiB             | 182 KiB                                      |
| Phone                | 390 px         | 3×                 | 232 KiB             | 110 KiB                                      |

Measurements vary with browser format support, viewport, density, and future asset changes. The image tests decode the actual optimized response and verify enough pixels in **both dimensions** for the screen density, accounting for `object-fit: cover`. They also check image budgets, mobile crop selection, AVIF negotiation, WebP fallback, and cache headers across the homepage, all four destination pages, about page, and both account pages.

Run:

```powershell
npm run build
$env:PLAYWRIGHT_CHANNEL='chrome'
npm test -- tests/images.spec.ts
```

The runner uses port 3100. Reports are written to `artifacts/image-delivery-*.json`, with screenshots beside them. The source images are prepared separately with `npm run images:prepare`; that command is not part of a normal build and never runs on a visitor request. Keep the adjacent credits when copying the photo assets.
