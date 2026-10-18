import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type User = { id: number; name: string; email: string };
type Context = {
  user: User | null;
  loading: boolean;
  saved: string[];
  setUser: (user: User | null) => void;
  toggleSaved: (id: string) => void;
  notify: (message: string) => void;
  logout: () => Promise<void>;
};
const AppContext = createContext<Context | null>(null);
const key = "discoverhub:saved";
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener("dh:saved", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("dh:saved", listener);
  };
};
const snapshot = () => {
  try {
    return localStorage.getItem(key) || "[]";
  } catch {
    return "[]";
  }
};

export async function requestJSON(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const result = await res.json();
  if (!res.ok)
    throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, notify] = useState("");
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const saved = useMemo<string[]>(() => {
    try {
      const value: unknown = JSON.parse(raw);
      return Array.isArray(value)
        ? value.filter((id): id is string => typeof id === "string")
        : [];
    } catch {
      return [];
    }
  }, [raw]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => notify(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const toggleSaved = useCallback(
    (id: string) => {
      const next = saved.includes(id)
        ? saved.filter((item) => item !== id)
        : [...saved, id];
      try {
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event("dh:saved"));
        notify(
          saved.includes(id)
            ? "Place removed from your collection."
            : "Place saved to your collection on this device.",
        );
      } catch {
        notify(
          "Your browser could not save this place. Please allow local storage.",
        );
      }
    },
    [saved],
  );
  const logout = async () => {
    try {
      await requestJSON("/api/auth/logout", {});
      setUser(null);
      notify("You have signed out.");
    } catch {
      notify("Could not sign out. Please try again.");
    }
  };
  return (
    <AppContext.Provider
      value={{ user, loading, saved, setUser, toggleSaved, notify, logout }}
    >
      {children}
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => notify("")}>
            <X size={17} />
          </button>
        </div>
      )}
    </AppContext.Provider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider is missing");
  return value;
}
