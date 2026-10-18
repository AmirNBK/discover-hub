import Head from "next/head";
import type { ReactNode } from "react";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";

export default function Layout({
  children,
  title,
  description = "Follow your curiosity. Discover beautiful destinations, explore the map, and collect places for your next adventure.",
  compact = false,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <>
      <Head>
        <title>{`${title} | DiscoverHub`}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#123d32" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </Head>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      {!compact && <Footer />}
    </>
  );
}
