import Layout from "@/components/Layout";
import DestinationExplorer from "@/components/DestinationExplorer";
import { useApp } from "@/components/AppProvider";
import Link from "next/link";
export default function Saved() {
  const {
    user,
    guestSaved,
    importing,
    importGuestSaved,
    loading,
    sessionError,
    refreshSession,
  } = useApp();
  return (
    <Layout title="Your saved places">
      <div className="page-intro container">
        <span className="eyebrow">KEEP A LITTLE INSPIRATION</span>
        <h1>
          Your someday <em>collection.</em>
        </h1>
        <p>
          All the places you’d love to find yourself.{" "}
          {user
            ? "Saved to your account, ready on every device where you sign in."
            : "Saved in this browser, ready when you are."}
        </p>
      </div>
      {sessionError ? (
        <div className="container collection-banner" role="alert">
          <p>We couldn’t check your account. Reconnect before saving places.</p>
          <button
            className="button secondary"
            onClick={() => void refreshSession()}
          >
            Retry connection
          </button>
        </div>
      ) : (
        !loading &&
        (user && guestSaved.length > 0 ? (
          <div className="container collection-banner">
            <div>
              <h2>Bring your device collection along.</h2>
              <p>
                {guestSaved.length} places are saved in this browser. Copy
                available places into your account?
              </p>
            </div>
            <button
              className="button"
              disabled={importing}
              onClick={() => void importGuestSaved()}
            >
              {importing ? "Copying places…" : "Copy device saves to account"}
            </button>
          </div>
        ) : !user ? (
          <div className="container collection-banner">
            <p>Sign in to keep your collection across devices.</p>
            <Link className="button secondary" href="/login">
              Sign in to sync
            </Link>
          </div>
        ) : null)
      )}
      <DestinationExplorer initialCategory="Saved" />
    </Layout>
  );
}
