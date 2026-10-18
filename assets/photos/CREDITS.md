# Photograph sources and licenses

All website photographs are stored locally. Source images are cropped, resized, stripped of unnecessary metadata, and WebP-encoded by `scripts/optimize-images.mjs`. Next.js serves responsive AVIF, with WebP fallback. The photographer credits are also published at `/photo-credits` and linked from every page footer.

| Assets                                  | Photographer           | Original                                                                                                                                     | License                                                       |
| --------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `braies-hero.webp`, `lake-braies*.webp` | Luca Bravo             | [Seclusion in Lago di Braies](<https://commons.wikimedia.org/wiki/File:Seclusion_in_Lago_di_Braies_(Unsplash).jpg>)                          | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `lake-garda*.webp`                      | Henry Gressmann        | [Lake Garda at Night](<https://commons.wikimedia.org/wiki/File:Lake_Garda_at_Night_(Unsplash).jpg>)                                          | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `koh-lipe*.webp`                        | © Vyacheslav Argenberg | [Koh Lipe (island), Tropical beach 2, Thailand](<https://commons.wikimedia.org/wiki/File:Koh_Lipe_(island),_Tropical_beach_2,_Thailand.jpg>) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)     |
| `cappadocia*.webp`                      | yonatan anugerah       | [Hot air baloon](<https://commons.wikimedia.org/wiki/File:Hot_air_baloon_(Unsplash).jpg>)                                                    | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

Card variants are 1280 × 1280. Wide detail variants are 2560 × 960. The hero is 1600 × 1920. Originals are downloaded only when the preparation script is explicitly run and are cached in the Git-ignored `artifacts/photo-originals/` folder. The app does not fetch the source hosts at runtime.
