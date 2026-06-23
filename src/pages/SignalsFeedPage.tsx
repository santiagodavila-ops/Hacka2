import { useEffect, useMemo, useRef } from "react";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useSignalsFeed, type FeedFilters } from "../hooks/useSignalsFeed";
import { Spinner } from "../components/Spinner";
import type { SignalStatus } from "../types";

export function SignalsFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const signalType = searchParams.get("signalType");
  const severity = searchParams.get("severity");
  const status = searchParams.get("status");
  const q = searchParams.get("q") ?? "";

  const debouncedQ = useDebouncedValue(q, 300);

  const filters: FeedFilters = useMemo(
    () => ({ signalType, severity, status, q: debouncedQ }),
    [signalType, severity, status, debouncedQ],
  );

  const {
    items,
    hasMore,
    loadingInitial,
    loadingMore,
    error,
    totalEstimate,
    loadMore,
    retry,
  } = useSignalsFeed(filters);

  function updateParam(key: string, value: string): void {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "") next.delete(key);
      else next.set(key, value);
      return next;
    });
  }

  // IntersectionObserver para infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreRef.current();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const inputClass =
    "rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500";

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-white">Feed de Señales</h1>
        <p className="mt-1 text-sm text-slate-400">
          {totalEstimate > 0 ? `~${totalEstimate} señales en total` : "Sincronizando..."}
        </p>
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => updateParam("q", e.target.value)}
          className={`${inputClass} col-span-2 md:col-span-1`}
        />
        <input
          type="text"
          placeholder="Tipo"
          value={signalType ?? ""}
          onChange={(e) => updateParam("signalType", e.target.value)}
          className={inputClass}
        />
        <select
          value={severity ?? ""}
          onChange={(e) => updateParam("severity", e.target.value)}
          className={inputClass}
        >
          <option value="">Severidad</option>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Crítica</option>
        </select>
        <select
          value={status ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className={inputClass}
        >
          <option value="">Estado</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="PROCESANDO">Procesando</option>
          <option value="ATENDIDA">Atendida</option>
        </select>
      </div>

      {/* Carga inicial */}
      {loadingInitial && (
        <div className="mt-4">
          <Spinner label="Cargando señales..." />
        </div>
      )}

      {/* Lista */}
      {!loadingInitial && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.id}
                className="block rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      {item.severity && (
                        <span className={severityBadgeClass(item.severity)}>
                          {item.severity}
                        </span>
                      )}
                      {item.signalType && (
                        <span className="text-xs text-slate-500">{item.signalType}</span>
                      )}
                    </div>
                    <p className="truncate text-sm text-slate-200">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.species} · {item.vitalState} · {item.sectorId} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={statusBadgeClass(item.status)}>{item.status}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Estado vacío */}
      {!loadingInitial && items.length === 0 && !error && (
        <div className="mt-12 text-center text-slate-500">
          No hay señales que coincidan con estos filtros.
        </div>
      )}

      {/* Sentinel para IntersectionObserver */}
      <div ref={sentinelRef} className="h-1" aria-hidden />

      {/* Footer: loading more / error / fin */}
      <div className="py-6 text-center text-sm">
        {loadingMore && <Spinner label="Cargando más..." />}
        {error && !loadingMore && (
          <div className="space-y-2">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={retry}
              className="rounded-md border border-red-700 px-4 py-1.5 text-sm text-red-200 hover:bg-red-900/40"
            >
              Reintentar
            </button>
          </div>
        )}
        {!hasMore && !loadingInitial && items.length > 0 && (
          <span className="text-slate-500">— fin del feed —</span>
        )}
      </div>

      {/* Detalle de señal renderizado aquí cuando la ruta sea /signals/feed/:id */}
      <Outlet />
    </div>
  );
}

function severityBadgeClass(s: string): string {
  const base = "rounded-full border px-2 py-0.5 text-xs font-medium ";
  switch (s) {
    case "CRITICAL":
      return base + "border-red-700 bg-red-950/40 text-red-300";
    case "HIGH":
      return base + "border-orange-700 bg-orange-950/40 text-orange-300";
    case "MEDIUM":
      return base + "border-amber-700 bg-amber-950/40 text-amber-300";
    case "LOW":
      return base + "border-blue-700 bg-blue-950/40 text-blue-300";
    default:
      return base + "border-slate-700 bg-slate-900 text-slate-300";
  }
}

function statusBadgeClass(s: SignalStatus | string): string {
  const base = "shrink-0 rounded-full border px-3 py-1 text-xs font-medium ";
  switch (s) {
    case "ATENDIDA":
      return base + "border-emerald-700 bg-emerald-950/40 text-emerald-300";
    case "PROCESANDO":
      return base + "border-cyan-700 bg-cyan-950/40 text-cyan-300";
    case "PENDIENTE":
      return base + "border-amber-700 bg-amber-950/40 text-amber-300";
    default:
      return base + "border-slate-700 bg-slate-900 text-slate-300";
  }
}