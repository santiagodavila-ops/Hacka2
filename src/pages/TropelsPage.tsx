import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  usePaginatedTropels,
  type TropelsQuery,
  type TropelSort,
} from "../hooks/usePaginatedTropels";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Spinner } from "../components/Spinner";
import type { Tropel } from "../types";

const VALID_SIZES = [10, 20, 50] as const;
type ValidSize = (typeof VALID_SIZES)[number];

const VALID_SORTS: readonly TropelSort[] = [
  "updatedAt,desc",
  "name,asc",
  "chaosIndex,desc",
];

function parseSize(v: string | null): ValidSize {
  const n = Number(v);
  return (VALID_SIZES as readonly number[]).includes(n) ? (n as ValidSize) : 10;
}

function parseSort(v: string | null): TropelSort {
  return VALID_SORTS.includes(v as TropelSort) ? (v as TropelSort) : "updatedAt,desc";
}

const FILTER_KEYS = ["species", "vitalState", "sectorId", "q", "sort", "size"] as const;

export function TropelsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(0, Number(searchParams.get("page") ?? "0"));
  const size = parseSize(searchParams.get("size"));
  const species = searchParams.get("species");
  const vitalState = searchParams.get("vitalState");
  const sectorId = searchParams.get("sectorId");
  const q = searchParams.get("q") ?? "";
  const sort = parseSort(searchParams.get("sort"));

  const debouncedQ = useDebouncedValue(q, 300);

  const query: TropelsQuery = useMemo(
    () => ({ page, size, species, vitalState, sectorId, q: debouncedQ, sort }),
    [page, size, species, vitalState, sectorId, debouncedQ, sort],
  );

  const { data, loading, error } = usePaginatedTropels(query);

  function updateParams(updates: Record<string, string | null>): void {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(updates)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const filtersChanged = FILTER_KEYS.some((k) => k in updates);
      if (filtersChanged && !("page" in updates)) next.set("page", "0");
      return next;
    });
  }

  const inputClass =
    "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-500";

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Atlas de Tropeles</h1>
        <p className="mt-1 text-sm text-slate-400">Catálogo paginado de criaturas digitales.</p>
      </header>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:grid-cols-6">
        <input
          type="text"
          placeholder="Buscar..."
          value={q}
          onChange={(e) => updateParams({ q: e.target.value })}
          className={`${inputClass} md:col-span-2`}
        />
        <input
          type="text"
          placeholder="Especie"
          value={species ?? ""}
          onChange={(e) => updateParams({ species: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Estado vital"
          value={vitalState ?? ""}
          onChange={(e) => updateParams({ vitalState: e.target.value })}
          className={inputClass}
        />
        <input
          type="text"
          placeholder="Sector ID"
          value={sectorId ?? ""}
          onChange={(e) => updateParams({ sectorId: e.target.value })}
          className={inputClass}
        />
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className={inputClass}
        >
          <option value="updatedAt,desc">Recientes</option>
          <option value="name,asc">Nombre A-Z</option>
          <option value="chaosIndex,desc">Mayor caos</option>
        </select>
      </div>

      {/* Status bar — altura fija para no mover layout */}
      <div className="mt-4 flex h-8 items-center text-sm text-slate-400">
        {loading && <Spinner label="Cargando tropeles..." />}
        {!loading && error && <span className="text-red-400">Error: {error}</span>}
        {!loading && !error && data && (
          <span>
            {data.totalElements} resultados — página {data.currentPage + 1} de{" "}
            {data.totalPages || 1}
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="mt-3 min-h-[480px] overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/70 text-slate-300">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Especie</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Sector</th>
              <th className="px-4 py-2 text-right font-medium">Chaos</th>
              <th className="px-4 py-2 font-medium">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {data?.content.map((t: Tropel) => (
              <tr key={t.id} className="border-t border-slate-800 hover:bg-slate-900/60">
                <td className="px-4 py-2 text-white">{t.name}</td>
                <td className="px-4 py-2 text-slate-300">{t.species}</td>
                <td className="px-4 py-2 text-slate-300">{t.vitalState}</td>
                <td className="px-4 py-2 text-slate-300">{t.sectorName ?? t.sectorId}</td>
                <td className="px-4 py-2 text-right font-mono text-slate-300">{t.chaosIndex}</td>
                <td className="px-4 py-2 text-slate-400">
                  {new Date(t.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!loading && data && data.content.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No hay tropeles que coincidan con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-400">Por página:</label>
          <select
            value={size}
            onChange={(e) => updateParams({ size: e.target.value })}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-white"
          >
            {VALID_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0 || loading}
            onClick={() => updateParams({ page: String(page - 1) })}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={!data || page >= data.totalPages - 1 || loading}
            onClick={() => updateParams({ page: String(page + 1) })}
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}