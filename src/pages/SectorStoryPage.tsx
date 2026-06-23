import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSectorStory } from "../hooks/useSectorStory";
import { withViewTransition } from "../lib/viewTransition";
import { Spinner } from "../components/Spinner";
import type { StoryAccent } from "../types";

// Estilos del panel visual según la etapa activa.
const ACCENT_PANEL: Record<StoryAccent, string> = {
  calm: "border-emerald-700 bg-emerald-950/30",
  warning: "border-amber-700 bg-amber-950/30",
  danger: "border-orange-700 bg-orange-950/30",
  critical: "border-red-700 bg-red-950/40",
};

const ACCENT_BAR: Record<StoryAccent, string> = {
  calm: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-orange-400",
  critical: "bg-red-400",
};

const ACCENT_DOT: Record<StoryAccent, string> = {
  calm: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-orange-400",
  critical: "bg-red-400",
};

// Acentos por defecto cuando la etapa no trae "accent" desde la API.
const FALLBACK_ACCENTS: StoryAccent[] = ["calm", "warning", "danger", "critical"];

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ¿El navegador soporta CSS scroll-driven animations? (Chrome 115+, etc.)
function supportsScrollTimeline(): boolean {
  return typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");
}

export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { story, loading, error, retry } = useSectorStory(id);

  const [activeStage, setActiveStage] = useState(0);
  const stageRefs = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Capacidades del navegador (se calculan una vez).
  const useCssTimeline = useMemo(
    () => supportsScrollTimeline() && !prefersReducedMotion(),
    [],
  );

  const stages = story?.stages ?? [];

  // --- Detección de la etapa activa con IntersectionObserver ---
  // Marca activa la etapa que cruza el centro del viewport. Esto alimenta el
  // panel visual fijo (métricas + estilos). Es además el fallback funcional
  // del scrollytelling para navegadores sin scroll-driven animations.
  useEffect(() => {
    if (stages.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(index)) setActiveStage(index);
          }
        }
      },
      // Solo "intersecta" la etapa que ocupa la franja central de la pantalla.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const node of stageRefs.current) {
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [stages.length]);

  // --- Barra de progreso: fallback JS cuando NO hay scroll-driven CSS ---
  useEffect(() => {
    if (useCssTimeline) return; // lo maneja CSS (animation-timeline: scroll())
    const bar = progressRef.current;
    if (!bar) return;
    function onScroll(): void {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? doc.scrollTop / max : 0;
      if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [useCssTimeline, stages.length]);

  // --- Navegación a una etapa (clic en los puntos o teclado) ---
  const goToStage = useCallback((index: number) => {
    const node = stageRefs.current[index];
    if (!node) return;
    node.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
  }, []);

  // --- Navegación por teclado: flechas / inicio / fin ---
  useEffect(() => {
    if (stages.length === 0) return;
    function onKeyDown(e: KeyboardEvent): void {
      const target = e.target as HTMLElement | null;
      // No secuestrar el teclado si el foco está en un campo de texto.
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToStage(Math.min(activeStage + 1, stages.length - 1));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToStage(Math.max(activeStage - 1, 0));
      } else if (e.key === "Home") {
        e.preventDefault();
        goToStage(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToStage(stages.length - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeStage, stages.length, goToStage]);

  function goBack(): void {
    // View Transition API con fallback funcional para el cambio de pantalla.
    withViewTransition(() => navigate(-1));
  }

  function accentFor(index: number): StoryAccent {
    return stages[index]?.accent ?? FALLBACK_ACCENTS[index % FALLBACK_ACCENTS.length];
  }

  // ----------------------------- Render -----------------------------
  if (loading) {
    return (
      <div className="py-20">
        <Spinner label="Cargando historia del sector..." />
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-900 bg-red-950/50 p-6 text-center">
        <p className="text-sm text-red-300">{error ?? "No se encontró la historia del sector."}</p>
        <button
          onClick={retry}
          className="mt-4 rounded-md border border-red-700 px-4 py-1.5 text-sm text-red-200 hover:bg-red-900/40"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const active = accentFor(activeStage);

  return (
    <div>
      <button
        onClick={goBack}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <span aria-hidden="true">&larr;</span> Volver
      </button>

      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          Sector {story.sectorId}
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-white">{story.sectorName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{story.intro}</p>
      </header>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12">
        {/* PANEL VISUAL FIJO (derecha en desktop, arriba/pegado en mobile).
            Comparte contenedor con la narrativa, así el sticky funciona en
            mobile (single column) y en desktop (grid). */}
        <div className="sticky top-16 z-0 mb-10 lg:order-2 lg:mb-0 lg:self-start lg:top-24">
          <section
            aria-live="polite"
            className={`rounded-2xl border p-6 transition-colors duration-500 ${ACCENT_PANEL[active]}`}
          >
            {/* Barra de progreso del scroll (CSS scroll-driven o fallback JS). */}
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                ref={progressRef}
                className={`story-progress h-full origin-left rounded-full ${ACCENT_BAR[active]} ${
                  useCssTimeline ? "story-progress--css" : ""
                }`}
              />
            </div>

            <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
              Etapa {activeStage + 1} / {stages.length}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {stages[activeStage]?.title}
            </h2>

            <dl className="mt-6 grid grid-cols-2 gap-4">
              {stages[activeStage]?.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                >
                  <dt className="text-xs text-slate-500">{m.label}</dt>
                  <dd className="mt-1 text-lg font-semibold text-white">
                    {m.value}
                    {m.unit ? <span className="ml-1 text-sm text-slate-400">{m.unit}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Navegación por etapas: botones reales => accesibles por teclado. */}
            <nav aria-label="Etapas de la historia" className="mt-6 flex flex-wrap gap-2">
              {stages.map((stage, index) => {
                const isActive = index === activeStage;
                return (
                  <button
                    key={stage.id}
                    onClick={() => goToStage(index)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Ir a la etapa ${index + 1}: ${stage.title}`}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      isActive
                        ? `${ACCENT_DOT[accentFor(index)]} scale-125`
                        : "bg-slate-700 hover:bg-slate-500"
                    }`}
                  />
                );
              })}
            </nav>
          </section>
        </div>

        {/* NARRATIVA (scroll) */}
        <div className="lg:order-1">
          {stages.map((stage, index) => (
            <section
              key={stage.id}
              data-index={index}
              ref={(el) => {
                stageRefs.current[index] = el;
              }}
              className="flex min-h-[70vh] flex-col justify-center border-l-2 border-slate-800 py-10 pl-6"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-2xl font-semibold text-white">{stage.title}</h3>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-slate-300">
                {stage.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
