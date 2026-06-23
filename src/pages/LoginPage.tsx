import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/getErrorMessage";

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();

  // Valores por defecto desde .env (gitignorado) para agilizar las pruebas.
  // Si no existen, los campos arrancan vacíos.
  const [teamCode, setTeamCode] = useState(import.meta.env.VITE_DEFAULT_TEAM_CODE ?? "");
  const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_EMAIL ?? "");
  const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_PASSWORD ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión, no mostramos el login.
  if (status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(teamCode, email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500";

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-mono text-xs tracking-widest text-cyan-400">TROPELCARE CONTROL ROOM</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Encender la consola</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-6">
          <div>
            <label htmlFor="teamCode" className="mb-1 block text-sm text-slate-300">Código de equipo</label>
            <input
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              required
              autoComplete="off"
              className={inputClass}
              placeholder="TEAM-XXXX"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className={inputClass}
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-slate-300">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Conectando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
