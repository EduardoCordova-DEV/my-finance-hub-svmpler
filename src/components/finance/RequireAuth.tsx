import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/local-auth";

/** Bloquea el contenido hasta confirmar que hay sesión guardada; si no, manda a /auth. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/auth", replace: true });
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="h-8 w-8 animate-pulse rounded-2xl"
          style={{ backgroundColor: "var(--card-elevated)" }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
