import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Layout from "@/components/Layout";
import { requestJSON } from "@/components/AppProvider";
export default function Contact() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await requestJSON("/api/contact", Object.fromEntries(data));
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "Could not connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Layout title="Get in touch">
      <section className="container contact-layout">
        <div className="contact-copy">
          <span className="eyebrow">GOOD CONVERSATIONS START HERE</span>
          <h1>
            A question?
            <br />A new <em>perspective?</em>
          </h1>
          <p className="lead">We’d love to hear it.</p>
          <p>
            Found a place we should know about? Have a suggestion, a question,
            or something that could work better? Leave us a message.
          </p>
          <div className="contact-note">
            <MessageCircle size={24} />
            <div>
              <h3>A little hello goes a long way.</h3>
              <p>
                Your message is saved securely for the DiscoverHub team to read.
              </p>
            </div>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={17} /> Your details are only used to handle your
            message.
          </div>
        </div>
        <div className="form-panel">
          {success ? (
            <div className="form-success" role="status">
              <CheckCircle2 size={46} strokeWidth={1.4} />
              <h2>Message received.</h2>
              <p>
                Thank you for sharing a little of your world with us. Your
                message is now in our inbox.
              </p>
              <button className="button" onClick={() => setSuccess(false)}>
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2>Say hello.</h2>
              <p className="muted">
                A thought, a question, a little inspiration.
              </p>
              <form onSubmit={submit} className="stack-form">
                <label>
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="How should we call you?"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                  />
                </label>
                <label>
                  Your message
                  <textarea
                    name="message"
                    placeholder="Tell us what’s on your mind…"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="button" type="submit" disabled={busy}>
                  {busy ? "Sending your message…" : "Send your message"}
                  <ArrowUpRight size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
