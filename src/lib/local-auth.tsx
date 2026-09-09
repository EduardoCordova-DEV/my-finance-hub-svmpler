import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const SESSION_KEY = "myfinance.session";
const USERS_KEY = "myfinance.users";

export interface Session {
  email: string;
  name: string;
}

interface StoredUser {
  email: string;
  name: string;
  password: string;
  onboarded?: boolean;
}

interface AuthState {
  session: Session | null;
  /** true cuando ya se leyó localStorage (en el cliente). */
  ready: boolean;
  signIn: (email: string, password: string) => { ok: boolean; error?: string };
  signUp: (email: string, password: string, name?: string) => { ok: boolean; error?: string };
  signInWithProvider: (provider: "google" | "outlook") => { ok: boolean; isNew: boolean };
  signOut: () => void;
  markOnboarded: () => void;
  isOnboarded: () => boolean;
}

const AuthCtx = createContext<AuthState | null>(null);

function readUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? "{}") as Record<string, StoredUser>;
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredUser>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function nameFromEmail(email: string) {
  const raw = email.split("@")[0] ?? "Usuario";
  return raw
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((s: Session | null) => {
    setSession(s);
    if (typeof window === "undefined") return;
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      ready,
      signIn: (emailRaw, password) => {
        const email = emailRaw.trim().toLowerCase();
        if (!email || !password) return { ok: false, error: "Escribe tu correo y contraseña." };
        const users = readUsers();
        const user = users[email];
        if (!user) return { ok: false, error: "No existe una cuenta con ese correo." };
        if (user.password !== password) return { ok: false, error: "Contraseña incorrecta." };
        persist({ email: user.email, name: user.name });
        return { ok: true };
      },
      signUp: (emailRaw, password, name) => {
        const email = emailRaw.trim().toLowerCase();
        if (!email.includes("@")) return { ok: false, error: "Escribe un correo válido." };
        if (password.length < 6)
          return { ok: false, error: "La contraseña necesita al menos 6 caracteres." };
        const users = readUsers();
        if (users[email]) return { ok: false, error: "Ya existe una cuenta con ese correo." };
        const user: StoredUser = {
          email,
          name: name?.trim() || nameFromEmail(email),
          password,
          onboarded: false,
        };
        users[email] = user;
        writeUsers(users);
        persist({ email: user.email, name: user.name });
        return { ok: true };
      },
      signInWithProvider: (provider) => {
        const email = provider === "google" ? "demo@gmail.com" : "demo@outlook.com";
        const users = readUsers();
        const existing = users[email];
        if (!existing) {
          users[email] = {
            email,
            name: nameFromEmail(email),
            password: "",
            onboarded: false,
          };
          writeUsers(users);
        }
        const user = users[email]!;
        persist({ email: user.email, name: user.name });
        return { ok: true, isNew: !existing || !existing.onboarded };
      },
      signOut: () => persist(null),
      markOnboarded: () => {
        if (!session) return;
        const users = readUsers();
        const user = users[session.email];
        if (user) {
          users[session.email] = { ...user, onboarded: true };
          writeUsers(users);
        }
      },
      isOnboarded: () => {
        if (!session) return false;
        return readUsers()[session.email]?.onboarded === true;
      },
    }),
    [session, ready, persist],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
