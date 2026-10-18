import Layout from "@/components/Layout";
export default function Privacy() {
  return (
    <Layout title="Privacy & your data">
      <article className="container prose section">
        <span className="eyebrow">A LITTLE CLARITY</span>
        <h1>
          Your data.
          <br />
          <em>Your business.</em>
        </h1>
        <h2>Your saved places</h2>
        <p>
          Your favourites are stored in this browser’s local storage. They are
          not synced to your account or other devices. Clear the website’s
          browser data to remove them.
        </p>
        <h2>Your account</h2>
        <p>
          Your name, email, and a securely hashed password are stored in this
          installation’s database. Sign-in creates an HTTP-only session cookie
          that expires after seven days. Signing out removes your session.
        </p>
        <h2>Your messages</h2>
        <p>
          Contact form submissions are stored in the installation’s database for
          the operator to review. They are not automatically emailed. Please
          avoid sending sensitive information in the form.
        </p>
        <h2>Your location</h2>
        <p>
          Location is requested only when you press “Use my location”. If live
          nearby discovery is configured, your coordinates are sent to the
          server and Foursquare to find nearby places. Location is not stored in
          the account database.
        </p>
        <h2>Maps and directions</h2>
        <p>
          Map tiles are provided by OpenStreetMap. Loading the map sends
          requests, including your IP address and the viewed map area, to that
          service. Opening directions takes you to Google Maps and is subject to
          that provider’s privacy policy.
        </p>
        <h2>Managing your data</h2>
        <p>
          Contact the operator of this installation to request account or
          message deletion. Local development data is in the configured SQLite
          database. This project does not include advertising or analytics
          trackers.
        </p>
      </article>
    </Layout>
  );
}
