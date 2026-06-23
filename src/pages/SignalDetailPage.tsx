import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import { withViewTransition } from "../lib/viewTransition";
import { Spinner } from "../components/Spinner";
import type { Signal, SignalStatus } from "../types";

const STATUS_STYLE: Record<SignalStatus, string> = {
  PENDIENTE: "border-amber-700 bg-amber-950/40 text-amber-300",
  PROCESANDO: "border-cyan-700 bg-cyan-950/40 text-cyan-300",
  ATENDIDA: "border-emerald-700 bg-emerald-950/40 text-emerald-300",
};

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Estado de la acción PATCH (independiente de la carga del detalle).
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Carga del detalle: GET /signals/:id
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    api
      .get<Signal>(`/signals/${id}`)
      .then((res) => {
        if (!cancelled) setSignal(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  // Acción del Checkpoint 4: PATCH /signals/{id}/status
  async function changeStatus(next: SignalStatus): Promise<void> {
    if (!id) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const res = await api.patch<Signal>(`/signals/${id}/status`, { status: next });
      // Reflejamos el cambio inmediatamente en pantalla.
      setSignal(res.data);
    } catch (err: unknown) {
      setUpdateError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* navigate(-1) = volver SPA sin recargar: el feed conserva scroll y estado */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <span aria-hidden="true">&larr;</span> Volver al feed
      </button>

      {loading && <Spinner label="Cargando señal..." />}

      {!loading && loadError && (
        <div className="rounded-xl border border-red-900 bg-red-950/50 p-5">
          <p className="text-sm text-red-300">{loadError}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 rounded-md border border-red-700 px-3 py-1.5 text-sm text-red-200 hover:bg-red-900/40"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && signal && (
        <article className="rounded-xl border border-slate-800 bg-slate-950 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-slate-500">#{signal.id}</p>
              <h1 className="mt-1 text-xl font-semibold text-white">{signal.title}</h1>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLE[signal.status]}`}>
              {signal.status}
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-300">{signal.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-sm">
            <div>
              <dt className="text-slate-500">Especie</dt>
              <dd className="text-slate-200">{signal.species}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Estado vital</dt>
              <dd className="text-slate-200">{signal.vitalState}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Sector</dt>
              <dd className="text-slate-200">
                <button
                  onClick={() =>
                    withViewTransition(() => navigate(`/sectors/${signal.sectorId}/story`))
                  }
                  className="text-cyan-400 underline-offset-2 hover:underline"
                >
                  {signal.sectorId}
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Registrada</dt>
              <dd className="text-slate-200">{new Date(signal.createdAt).toLocaleString()}</dd>
            </div>
          </dl>

          {/* --- Acciones de atención --- */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <p className="mb-3 text-sm font-medium text-slate-300">Atender señal</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => changeStatus("PROCESANDO")}
                disabled={updating || signal.status === "PROCESANDO"}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updating ? "Aplicando..." : "Marcar PROCESANDO"}
              </button>
              <button
                onClick={() => changeStatus("ATENDIDA")}
                disabled={updating || signal.status === "ATENDIDA"}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {updating ? "Aplicando..." : "Marcar ATENDIDA"}
              </button>
            </div>

            {updateError && (
              <div className="mt-3 rounded-md border border-red-900 bg-red-950/50 px-3 py-2" role="alert">
                <p className="text-sm text-red-300">{updateError}</p>
                <p className="mt-1 text-xs text-red-400">
                  El estado no cambió. Revisa tu conexión y vuelve a intentar.
                </p>
              </div>
            )}
          </div>
        </article>
      )}
    </div>
  );
}
