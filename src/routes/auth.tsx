import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · MyFinance" },
      { name: "description", content: "Inicia sesión o crea tu cuenta en MyFinance." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: mode === "signup" ? "/welcome" : "/" });
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-6 py-12">
        <div className="mb-10">
          <div
            className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-medium"
            style={{ backgroundColor: "#1D9E75", color: "#0B0B0D" }}
          >
            $
          </div>
          <h1 className="text-2xl font-medium text-foreground">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {mode === "login"
              ? "Entra para ver tus finanzas."
              : "Empieza a llevar el control de tu dinero."}
          </p>
        </div>

        <div className="mb-4 space-y-2">
          <SocialButton
            label="Continuar con Google"
            onClick={() => navigate({ to: mode === "signup" ? "/welcome" : "/" })}
            icon={<GoogleIcon />}
          />
          <SocialButton
            label="Continuar con Outlook"
            onClick={() => navigate({ to: mode === "signup" ? "/welcome" : "/" })}
            icon={<OutlookIcon />}
          />
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            o con email
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Field
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={setEmail}
          />
          <Field
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition-opacity active:opacity-80"
          >
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-medium"
            style={{ color: "#1D9E75" }}
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  type,
  placeholder,
  value,
  onChange,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      style={{ backgroundColor: "var(--card)" }}
    />
  );
}

function SocialButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-full border py-3.5 text-sm font-medium text-foreground transition-colors"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
    >
      {icon}
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2c-.27 1.44-1.08 2.66-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.11 0 5.71-1.03 7.62-2.8l-3.72-2.88c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.55-2.02-6.46-4.74H1.7v2.98A11.5 11.5 0 0 0 12 23.5Z"
      />
      <path
        fill="#FBBC05"
        d="M5.54 14.18a6.9 6.9 0 0 1 0-4.36V6.84H1.7a11.51 11.51 0 0 0 0 10.32l3.84-2.98Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.4 15.11.5 12 .5A11.5 11.5 0 0 0 1.7 6.84l3.84 2.98C6.45 6.77 9 4.75 12 4.75Z"
      />
    </svg>
  );
}

function OutlookIcon() {
  return <Mail size={18} color="#378ADD" strokeWidth={1.75} />;
}