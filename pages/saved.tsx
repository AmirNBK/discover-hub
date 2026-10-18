import Layout from "@/components/Layout";
import DestinationExplorer from "@/components/DestinationExplorer";
export default function Saved() {
  return (
    <Layout title="Your saved places">
      <div className="page-intro container">
        <span className="eyebrow">KEEP A LITTLE INSPIRATION</span>
        <h1>
          Your someday <em>collection.</em>
        </h1>
        <p>
          All the places you’d love to find yourself. Saved in this browser,
          ready when you are.
        </p>
      </div>
      <DestinationExplorer initialCategory="Saved" />
    </Layout>
  );
}
