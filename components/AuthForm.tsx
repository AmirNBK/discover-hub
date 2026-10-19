import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import Layout from "./Layout";
import { requestJSON, useApp } from "./AppProvider";
import lake from "@/assets/photos/braies-hero.webp";
import { photoQuality, photoSizes } from "@/lib/image-config";

export default function AuthForm({ register = false }: { register?: boolean }) {
  const { user, setSession, notify } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await requestJSON(
        `/api/auth/${register ? "register" : "login"}`,
        data,
      );
      setSession(result);
      notify(
        register
          ? "Your account is ready. Let’s explore."
          : "Welcome back. A new adventure awaits.",
      );
      await router.push("/");
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
    <Layout title={register ? "Create your account" : "Welcome back"}>
      <section className="auth-layout container">
        <div className="auth-art">
          <Image
            src={lake}
            alt="A wooden boathouse and mountain peaks at Lake Braies"
            fill
            priority
            sizes={photoSizes.half}
            quality={photoQuality}
          />
          <div className="image-shade" />
          <div>
            <span className="eyebrow light">A WORLD WAITING TO BE FOUND</span>
            <h2>
              Good to have
              <br />
              you <em>here.</em>
            </h2>
            <p>A little curiosity. A new perspective.</p>
          </div>
        </div>
        <div className="auth-form">
          {user ? (
            <>
              <span className="eyebrow">YOU’RE ALL SET</span>
              <h1>Hello, {user.name.split(" ")[0]}.</h1>
              <p>You’re already signed in.</p>
              <Link href="/map" className="button">
                Go explore <ArrowUpRight size={18} />
              </Link>
            </>
          ) : (
            <>
              <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
              <h1>{register ? "A fresh start." : "Welcome back."}</h1>
              <p>
                {register
                  ? "Create your DiscoverHub account."
                  : "Sign in and see where today takes you."}
              </p>
              <form onSubmit={submit} className="stack-form">
                {register && (
                  <label>
                    Your name
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      placeholder="Your name"
                    />
                  </label>
                )}
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Password
                  <span className="password-field">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        register ? "new-password" : "current-password"
                      }
                      required
                      minLength={8}
                      maxLength={128}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="button" type="submit" disabled={busy}>
                  {busy
                    ? "Just a moment…"
                    : register
                      ? "Create account"
                      : "Sign in"}
                  <ArrowUpRight size={18} />
                </button>
              </form>
              <p className="auth-switch">
                {register
                  ? "Already part of the adventure? "
                  : "New around here? "}
                <Link href={register ? "/login" : "/sign-up"}>
                  {register ? "Sign in" : "Create an account"}
                </Link>
              </p>
              <p className="privacy-note">
                <LockKeyhole size={14} /> Your account belongs to this
                DiscoverHub installation.
              </p>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
