import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import type { PageResponse, Tropel } from "../types";

export type TropelSort = "name,asc" | "updatedAt,desc" | "chaosIndex,desc";

export interface TropelsQuery {
  page: number;
  size: 10 | 20 | 50;
  species: string | null;
  vitalState: string | null;
  sectorId: string | null;
  q: string;
  sort: TropelSort;
}

interface TropelsState {
  data: PageResponse<Tropel> | null;
  loading: boolean;
  error: string | null;
}

export function usePaginatedTropels(query: TropelsQuery): TropelsState {
  const [state, setState] = useState<TropelsState>({
    data: null,
    loading: true,
    error: null,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const myRequestId = ++requestIdRef.current;
    const controller = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const params: Record<string, string | number> = {
      page: query.page,
      size: query.size,
      sort: query.sort,
    };
    if (query.species) params.species = query.species;
    if (query.vitalState) params.vitalState = query.vitalState;
    if (query.sectorId) params.sectorId = query.sectorId;
    if (query.q.trim()) params.q = query.q.trim();

    api
      .get<PageResponse<Tropel>>("/tropels", {
        params,
        signal: controller.signal,
      })
      .then((res) => {
        if (myRequestId !== requestIdRef.current) return; // respuesta obsoleta
        setState({ data: res.data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (myRequestId !== requestIdRef.current) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getErrorMessage(err),
        }));
      });

    return () => controller.abort();
  }, [
    query.page,
    query.size,
    query.species,
    query.vitalState,
    query.sectorId,
    query.q,
    query.sort,
  ]);

  return state;
}