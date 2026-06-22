import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import { Spinner } from "../components/Spinner";
import type { DashboardSummary } from "../types";

interface MetricCardProps {
  label: string;
  value: number;
  accent: string;
}

function MetricCard({ label, value, accent }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar este número fuerza a re-ejecutar el useEffect (botón "Reintentar").
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<DashboardSummary>("/dashboard/summary")
      .then((res) => {
        if (!cancelled) setSummary(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Panel de control</h1>
      <p className="mt-1 text-sm text-slate-400">Indicadores globales en tiempo real del sistema.</p>

      <div className="mt-6">
        {loading && <Spinner label="Cargando indicadores..." />}

        {!loading && error && (
          <div className="rounded-xl border border-red-900 bg-red-950/50 p-5">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-3 rounded-md border border-red-700 px-3 py-1.5 text-sm text-red-200 hover:bg-red-900/40"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Tropeles totales" value={summary.totalTropels} accent="text-cyan-400" />
            <MetricCard label="Señales activas" value={summary.activeSignals} accent="text-amber-400" />
            <MetricCard label="Señales atendidas" value={summary.attendedSignals} accent="text-emerald-400" />
            <MetricCard label="Sectores en riesgo" value={summary.sectorsAtRisk} accent="text-red-400" />
          </div>
        )}
      </div>
    </div>
  );
}
