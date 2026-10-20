import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { withPhotos, type DestinationRecord } from "./destinations";

type Result = {
  destinations: DestinationRecord[];
  total: number;
  offset: number;
  limit: number;
  categories: string[];
};
export function useDestinations(
  query: string,
  category: string,
  limit = 12,
  focus?: string | null,
) {
  const { user, saved, loading: sessionLoading, sessionError } = useApp();
  const ids = category === "Saved" ? saved : [];
  const base = JSON.stringify({
    q: query,
    category,
    limit,
    focus,
    accountId: user?.id || null,
    ids,
  });
  const [page, setPage] = useState({ base: "", offset: 0 });
  const [attempt, setAttempt] = useState(0);
  const offset = page.base === base ? page.offset : undefined;
  const key = JSON.stringify([base, offset, attempt]);
  const [state, setState] = useState<{
    key: string;
    result?: Result;
    error?: string;
  }>({ key: "" });
  const [categories, setCategories] = useState<string[]>([]);
  const waiting = category === "Saved" && sessionLoading;
  const authFailed = category === "Saved" && sessionError;
  useEffect(() => {
    if (waiting || authFailed) return;
    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        try {
          const parsed = JSON.parse(base);
          const response = await fetch("/api/destinations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...parsed,
              ids: parsed.accountId ? undefined : parsed.ids,
              offset,
            }),
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(15000),
            ]),
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(data.error || "Could not load destinations.");
          if (!controller.signal.aborted) {
            setState({ key, result: data });
            setCategories(data.categories);
          }
        } catch (error) {
          if (!controller.signal.aborted)
            setState({
              key,
              error:
                error instanceof Error && error.name !== "TimeoutError"
                  ? error.message
                  : "Destinations took too long to load. Please try again.",
            });
        }
      },
      query ? 180 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [base, offset, key, query, waiting, authFailed]);
  const result =
    state.key === key && !waiting && !authFailed ? state.result : undefined;
  const error = authFailed
    ? "Could not check your account. Retry your connection to see saved places."
    : state.key === key
      ? state.error
      : undefined;
  return {
    places: result?.destinations.map(withPhotos) || [],
    total: result?.total || 0,
    offset: result?.offset || 0,
    limit,
    categories,
    error,
    loading: !error && !result,
    retry: () => setAttempt((value) => value + 1),
    previous: () =>
      setPage({ base, offset: Math.max(0, (result?.offset || 0) - limit) }),
    next: () => setPage({ base, offset: (result?.offset || 0) + limit }),
  };
}
