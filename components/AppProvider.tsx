import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

type User = { id: string; name: string; email: string };
type Session = { user: User | null; saved: string[] };
type Context = {
  user: User | null;
  loading: boolean;
  sessionError: boolean;
  saved: string[];
  guestSaved: string[];
  importing: boolean;
  saveDisabled: (id: string) => boolean;
  setSession: (session: Session) => void;
  toggleSaved: (id: string) => Promise<void>;
  importGuestSaved: () => Promise<void>;
  refreshSession: () => Promise<void>;
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
function parseSaved(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === "string" &&
                id.length <= 80 &&
                /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id),
            ),
          ),
        ].slice(0, 200)
      : [];
  } catch {
    return [];
  }
}
function storeGuest(ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
  window.dispatchEvent(new Event("dh:saved"));
}
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
  const [session, updateSession] = useState<Session>({ user: null, saved: [] });
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [notice, notify] = useState("");
  const [pending, setPending] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const current = useRef(session);
  const epoch = useRef(0);
  const identityRevision = useRef(0);
  const locks = useRef(new Set<string>());
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const guestSaved = useMemo(() => parseSaved(raw), [raw]);
  const setSession = useCallback((value: Session) => {
    epoch.current++;
    identityRevision.current++;
    current.current = value;
    updateSession(value);
    setSessionError(false);
    setLoading(false);
  }, []);
  const refreshSession = useCallback(async () => {
    if (locks.current.size) return;
    const revision = epoch.current;
    try {
      const response = await fetch("/api/auth/me", {
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      if (!response.ok) throw new Error();
      const data: Session = await response.json();
      if (revision === epoch.current) setSession(data);
    } catch {
      if (revision === epoch.current) {
        setSessionError(true);
        setLoading(false);
      }
    }
  }, [setSession]);
  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshSession();
    }, 0);
    const focus = () => {
      void refreshSession();
    };
    window.addEventListener("focus", focus);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", focus);
    };
  }, [refreshSession]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => notify(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  const saveDisabled = (id: string) =>
    loading || sessionError || importing || pending.includes(id);
  const toggleSaved = async (id: string) => {
    if (saveDisabled(id) || locks.current.has(id)) return;
    const owner = current.current.user;
    if (!owner) {
      const ids = parseSaved(snapshot());
      const exists = ids.includes(id);
      if (!exists && ids.length >= 200) {
        notify("Your guest collection is full. Sign in to save more places.");
        return;
      }
      try {
        storeGuest(exists ? ids.filter((item) => item !== id) : [...ids, id]);
        notify(
          exists
            ? "Place removed from your collection."
            : "Place saved to your collection on this device.",
        );
      } catch {
        notify(
          "Your browser could not save this place. Please allow local storage.",
        );
      }
      return;
    }
    locks.current.add(id);
    setPending([...locks.current]);
    epoch.current++;
    const identity = identityRevision.current;
    const enabled = !current.current.saved.includes(id);
    try {
      await requestJSON("/api/saved", {
        id,
        saved: enabled,
        accountId: owner.id,
      });
      // Different destination writes can finish in either order. Apply only this ID.
      if (
        current.current.user?.id === owner.id &&
        identityRevision.current === identity
      ) {
        const ids = current.current.saved;
        const next = {
          ...current.current,
          saved: enabled
            ? [...new Set([...ids, id])]
            : ids.filter((item) => item !== id),
        };
        current.current = next;
        updateSession(next);
        notify(
          enabled
            ? "Place saved to your account."
            : "Place removed from your collection.",
        );
      }
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not sync this place. Please try again.",
      );
    } finally {
      locks.current.delete(id);
      setPending([...locks.current]);
    }
  };
  const importGuestSaved = async () => {
    const owner = current.current.user;
    if (!owner || loading || sessionError || locks.current.size || importing)
      return;
    locks.current.add("import");
    setImporting(true);
    epoch.current++;
    const identity = identityRevision.current;
    const ids = parseSaved(snapshot());
    try {
      const result = await requestJSON("/api/saved/import", {
        ids,
        accountId: owner.id,
      });
      if (
        current.current.user?.id === owner.id &&
        identityRevision.current === identity
      ) {
        const next = { ...current.current, saved: result.saved as string[] };
        current.current = next;
        updateSession(next);
        storeGuest(
          parseSaved(snapshot()).filter((id) => !result.accepted.includes(id)),
        );
        notify(
          result.accepted.length === ids.length
            ? "Your device collection is now saved to your account."
            : "Available places copied. Some device saves are no longer in the catalogue.",
        );
      }
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Could not copy your places. Please try again.",
      );
    } finally {
      locks.current.delete("import");
      setImporting(false);
    }
  };
  const logout = async () => {
    if (locks.current.has("logout")) return;
    locks.current.add("logout");
    epoch.current++;
    identityRevision.current++;
    setLoading(true);
    try {
      await requestJSON("/api/auth/logout", {});
      setSession({ user: null, saved: [] });
      notify("You have signed out.");
    } catch {
      setLoading(false);
      notify("Could not sign out. Please try again.");
    } finally {
      locks.current.delete("logout");
    }
  };
  return (
    <AppContext.Provider
      value={{
        user: session.user,
        loading,
        sessionError,
        saved: session.user ? session.saved : guestSaved,
        guestSaved,
        importing,
        saveDisabled,
        setSession,
        toggleSaved,
        importGuestSaved,
        refreshSession,
        notify,
        logout,
      }}
    >
      {children}
      {sessionError && (
        <div className="connection-warning" role="alert">
          <span>We couldn’t check your account. Reconnect to save places.</span>
          <button className="text-link" onClick={() => void refreshSession()}>
            Retry connection
          </button>
        </div>
      )}
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
