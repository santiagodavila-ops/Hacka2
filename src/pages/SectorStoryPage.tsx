import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getErrorMessage } from "../lib/getErrorMessage";
import { Spinner } from "../components/Spinner";
import type { SectorStory } from "../types";

export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<SectorStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Etapa activa - se actualiza con scroll (fallback JS)
  const [activeStage, setActiveStage] = useState(0);

  // Mostrar intro o historia (para View Transition API)
  const [showStory, setShowStory] = useState(false);

  // Detección de reduced motion - requisito obligatorio
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Fetch
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<SectorStory>(`/sectors/${id}/story`)
      .then((res) => {
        if (!cancelled) setStory(res.data);
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
  }, [id]);

  // Refs para cada etapa (fallback IntersectionObserver)
  const stageRefs = useRef<Array<HTMLElement | null>>([]);

  // Fallback JS para detectar etapa activa via IntersectionObserver
  // (Para navegadores sin animation-timeline: scroll())
  useEffect(() => {
    if (!showStory || !story) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = stageRefs.current.indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveStage(idx);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    stageRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [showStory, story]);

  // Transición intro -> story con View Transition API + fallback
  function enterStory(): void {
    type ViewTransitionDoc = Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const doc = document as ViewTransitionDoc;
    if (doc.startViewTransition && !reducedMotion) {
      doc.startViewTransition(() => setShowStory(true));
    } else {
      setShowStory(true);
    }
  }

  function exitStory(): void {
    type ViewTransitionDoc = Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const doc = document as ViewTransitionDoc;
    if (doc.startViewTransition && !reducedMotion) {
      doc.startViewTransition(() => setShowStory(false));
    } else {
      setShowStory(false);
    }
  }

  // Navegación por teclado entre etapas
  function handleKeyDown(e: React.KeyboardEvent, idx: number): void {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const next = stageRefs.current[idx + 1];
      if (next) {
        next.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        next.focus();
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = stageRefs.current[idx - 1];
      if (prev) {
        prev.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
        prev.focus();
      }
    }
  }

  if (loading) return <Spinner label="Cargando historia del sector..." />;
  if (error)
    return (
      <div className="rounded-xl border border-red-900 bg-red-950/50 p-5">
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  if (!story) return null;

  const active = story.stages[activeStage];

  // === VISTA INTRO (antes de entrar a la historia) ===
  if (!showStory) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-slate-400 hover:text-white"
        >
          &larr; Volver
        </button>
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-8">
          <p className="font-mono text-xs tracking-widest text-cyan-400">SECTOR STORY</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{story.sectorName}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-300">{story.intro}</p>
          <p className="mt-4 text-sm text-slate-500">
            {story.stages.length} etapas — usa scroll o flechas del teclado para navegar.
          </p>
          <button
            onClick={enterStory}
            className="mt-6 rounded-md bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Entrar a la historia &rarr;
          </button>
        </div>
      </div>
    );
  }

  // === VISTA HISTORIA (scrollytelling) ===
  return (
    <div className="relative">
      {/* Barra superior con progreso */}
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={exitStory}
            className="text-sm text-slate-400 hover:text-white"
          >
            &larr; Salir
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Etapa {activeStage + 1} / {story.stages.length}
            </span>
            <div className="h-1 w-48 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-300"
                style={{
                  width: `${((activeStage + 1) / story.stages.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Layout split: texto izquierda, panel visual derecha */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
        {/* Lado izquierdo: narrativa por etapas */}
        <div className="space-y-[60vh]">
          {story.stages.map((stage, idx) => (
            <section
              key={stage.id}
              ref={(el) => {
                stageRefs.current[idx] = el;
              }}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="story-stage min-h-[40vh] rounded-xl border border-slate-800 bg-slate-950 p-6 outline-none focus:border-cyan-500"
              aria-label={`Etapa ${idx + 1}: ${stage.title}`}
            >
              <p className="font-mono text-xs text-cyan-400">
                ETAPA {idx + 1} / {story.stages.length}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">{stage.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {stage.narrative}
              </p>
            </section>
          ))}
        </div>

        {/* Lado derecho: panel visual fijo (sticky) que reacciona */}
        <div className="hidden md:block">
          <div className="sticky top-24 rounded-xl border border-slate-800 bg-slate-950 p-6">
            <p className="font-mono text-xs text-slate-500">VISUAL ACTIVO</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{active.title}</h3>
            <div
              className="mt-4 h-48 rounded-lg transition-colors duration-500"
              style={{ backgroundColor: active.accent ?? "#0891b2" }}
              aria-hidden
            />
            <dl className="mt-6 space-y-2">
              {Object.entries(active.metrics).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-slate-800 py-2"
                >
                  <dt className="text-xs uppercase text-slate-500">{k}</dt>
                  <dd className="font-mono text-sm text-cyan-300">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Panel visual para mobile (después de cada etapa) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 border-t border-slate-800 bg-slate-950/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] text-slate-500">ACTIVO</p>
              <p className="text-sm text-white">{active.title}</p>
            </div>
            <div
              className="h-10 w-10 rounded-md transition-colors duration-500"
              style={{ backgroundColor: active.accent ?? "#0891b2" }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}