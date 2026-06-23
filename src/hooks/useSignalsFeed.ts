import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import type { FeedResponse, SignalFeedItem } from "../types";

export interface FeedFilters {
  signalType: string | null;
  severity: string | null;
  status: string | null;
  q: string;
}

interface FeedState {
  items: SignalFeedItem[];
  cursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
  loadingInitial: boolean;
  loadingMore: boolean;
  error: string | null;
}

const INITIAL_STATE: FeedState = {
  items: [],
  cursor: null,
  hasMore: true,
  totalEstimate: 0,
  loadingInitial: true,
  loadingMore: false,
  error: null,
};

function dedupById(items: SignalFeedItem[]): SignalFeedItem[] {
  const seen = new Map<string, SignalFeedItem>();
  for (const item of items) seen.set(item.id, item);
  return Array.from(seen.values());
}

export interface UseSignalsFeedResult extends FeedState {
  loadMore: () => void;
  retry: () => void;
}

export function useSignalsFeed(filters: FeedFilters): UseSignalsFeedResult {
  const [state, setState] = useState<FeedState>(INITIAL_STATE);

  const generationRef = useRef(0);
  const inFlightRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  function buildParams(cursor: string | null, f: FeedFilters): Record<string, string | number> {
    const params: Record<string, string | number> = { limit: 15 };
    if (cursor) params.cursor = cursor;
    if (f.signalType) params.signalType = f.signalType;
    if (f.severity) params.severity = f.severity;
    if (f.status) params.status = f.status;
    if (f.q.trim()) params.q = f.q.trim();
    return params;
  }

  const performFetch = useCallback(
    (cursor: string | null, isInitial: boolean, signal: AbortSignal): void => {
      const myGen = generationRef.current;
      inFlightRef.current = true;

      if (isInitial) {
        setState({ ...INITIAL_STATE, loadingInitial: true });
      } else {
        setState((prev) => ({ ...prev, loadingMore: true, error: null }));
      }

      api
        .get<FeedResponse<SignalFeedItem>>("/signals/feed", {
          params: buildParams(cursor, filtersRef.current),
          signal,
        })
        .then((res) => {
          if (myGen !== generationRef.current) return;
          const data = res.data;
          setState((prev) =>
            isInitial
              ? {
                  items: dedupById(data.items),
                  cursor: data.nextCursor,
                  hasMore: data.hasMore,
                  totalEstimate: data.totalEstimate,
                  loadingInitial: false,
                  loadingMore: false,
                  error: null,
                }
              : {
                  ...prev,
                  items: dedupById([...prev.items, ...data.items]),
                  cursor: data.nextCursor,
                  hasMore: data.hasMore,
                  totalEstimate: data.totalEstimate,
                  loadingMore: false,
                  error: null,
                },
          );
        })
        .catch((err: unknown) => {
          if (signal.aborted) return;
          if (myGen !== generationRef.current) return;
          // Preservar items ya cargados — requisito del checkpoint
          setState((prev) => ({
            ...prev,
            loadingInitial: false,
            loadingMore: false,
            error: getErrorMessage(err),
          }));
        })
        .finally(() => {
          if (myGen === generationRef.current) inFlightRef.current = false;
        });
    },
    [],
  );

  // Cambio de filtros -> nueva generación, abort y reset
  useEffect(() => {
    generationRef.current += 1;
    const controller = new AbortController();
    performFetch(null, true, controller.signal);
    return () => controller.abort();
  }, [filters.signalType, filters.severity, filters.status, filters.q, performFetch]);

  const loadMore = useCallback((): void => {
    const cur = stateRef.current;
    if (inFlightRef.current) return;
    if (!cur.hasMore) return;
    if (cur.loadingInitial) return;
    if (cur.error) return; // tras error, exige retry manual
    const controller = new AbortController();
    performFetch(cur.cursor, false, controller.signal);
  }, [performFetch]);

  const retry = useCallback((): void => {
    const cur = stateRef.current;
    if (inFlightRef.current) return;
    if (!cur.hasMore) return;
    const controller = new AbortController();
    performFetch(cur.cursor, false, controller.signal);
  }, [performFetch]);

  return { ...state, loadMore, retry };
}