import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import type { SectorStory } from "../types";

interface SectorStoryState {
  story: SectorStory | null;
  loading: boolean;
  error: string | null;
}

export interface UseSectorStoryResult extends SectorStoryState {
  retry: () => void;
}

// Carga GET /sectors/{id}/story de forma manual (sin React Query/SWR).
// Cancela la petición anterior si cambia el id o se desmonta el componente.
export function useSectorStory(id: string | undefined): UseSectorStoryResult {
  const [state, setState] = useState<SectorStoryState>({
    story: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const controller = new AbortController();
    setState({ story: null, loading: true, error: null });

    api
      .get<SectorStory>(`/sectors/${id}/story`, { signal: controller.signal })
      .then((res) => {
        if (!cancelled) setState({ story: res.data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled || controller.signal.aborted) return;
        setState({ story: null, loading: false, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id, reloadKey]);

  return { ...state, retry };
}
