import Layout from "@/components/Layout";
import { photoCredits } from "@/lib/photo-credits";

export default function PhotoCredits() {
  return (
    <Layout title="Photo credits">
      <article className="container prose section">
        <span className="eyebrow">THE PEOPLE BEHIND THE PERSPECTIVE</span>
        <h1>
          A different lens.
          <br />
          <em>A little credit.</em>
        </h1>
        <p>
          Thank you to the photographers whose work brings these places to life.
          Photographs have been resized, cropped, and compressed for this
          website.
        </p>
        {photoCredits.map((photo) => (
          <section key={photo.subject}>
            <h2>{photo.subject}</h2>
            <p>
              Photo © {photo.author}.{" "}
              <a
                className="text-link"
                href={photo.source}
                target="_blank"
                rel="noopener noreferrer"
              >
                Original photograph ↗
              </a>{" "}
              ·{" "}
              <a
                className="text-link"
                href={photo.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {photo.license} ↗
              </a>
            </p>
          </section>
        ))}
      </article>
    </Layout>
  );
}
