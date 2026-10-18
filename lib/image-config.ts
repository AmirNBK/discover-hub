// Match the CSS layout so high-density screens get enough pixels without
// downloading full-width photographs for half-width cards or small thumbnails.
export const photoQuality = 80;
export const photoSizes = {
  card: "(max-width: 760px) calc((100vw - 56px) / 2), (max-width: 950px) calc((100vw - 95px) / 2), (max-width: 1150px) calc((100vw - 123px) / 4), (max-width: 1392px) calc((100vw - 181px) / 4), 303px",
  hero: "(max-width: 520px) calc(100vw - 40px), (max-width: 760px) 480px, (max-width: 1392px) calc((100vw - 112px) / 2), 607px",
  half: "(max-width: 760px) calc(100vw - 40px), (max-width: 1392px) calc((100vw - 112px) / 2), 607px",
  journal:
    "(max-width: 760px) calc(100vw - 80px), (max-width: 1392px) calc((100vw - 200px) / 2), 570px",
  detail:
    "(max-width: 760px) calc(100vw - 40px), (max-width: 1150px) calc(100vw - 72px), (max-width: 1392px) calc(100vw - 112px), 1280px",
  thumbnail: "(max-width: 760px) 85px, (max-width: 950px) 65px, 79px",
};
