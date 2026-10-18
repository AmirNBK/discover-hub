import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import Layout from "@/components/Layout";
export default function NotFound() {
  return (
    <Layout title="A little off the beaten path">
      <div className="container not-found">
        <Compass size={52} strokeWidth={1.2} />
        <span className="eyebrow">404 · A LITTLE OFF THE BEATEN PATH</span>
        <h1>
          Let’s find a<br />
          <em>new direction.</em>
        </h1>
        <p>This page isn’t here, but there are plenty of places to discover.</p>
        <Link className="button" href="/">
          Back to discovering <ArrowUpRight size={18} />
        </Link>
      </div>
    </Layout>
  );
}
