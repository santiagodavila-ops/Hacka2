import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SectorStory, StoryStage } from "../types";

// Datos Simulados (Simula la respuesta de GET /sectors/{id}/story)
const MOCK_STORY_DATA: Record<string, SectorStory> = {
  "sector-alpha": {
    id: "sector-alpha",
    sectorName: "Sector Alpha - Valle Norte",
    stages: [
      {
        id: "stage-1",
        title: "01. Condición Inicial Estable",
        description: "El sector inicia la jornada bajo parámetros óptimos. Los sensores de biometría en el tropel equino reportan constantes estables. El pastoreo se realiza en zonas de baja radiación térmica sin alertas activas.",
        riskLevel: "BAJO",
        activeAlerts: 0,
        temperature: 22,
        humidity: 65,
        visualStyles: { glowColor: "rgba(34, 197, 94, 0.2)", accentColor: "text-green-400" }
      },
      {
        id: "stage-2",
        title: "02. Anomalía Térmica Detectada",
        description: "A las 14:00 hrs se registra un incremento abrupto de temperatura en el cuadrante de abrevaderos. Los algoritmos de TropelCare detectan dispersión errática en el grupo bovino, sugiriendo estrés hídrico incipiente.",
        riskLevel: "MEDIO",
        activeAlerts: 2,
        temperature: 31,
        humidity: 40,
        visualStyles: { glowColor: "rgba(245, 158, 11, 0.2)", accentColor: "text-amber-400" }
      },
      {
        id: "stage-3",
        title: "03. Estado de Emergencia y Dispersión",
        description: "Alerta Crítica. Varias señales vitales entran en estado de riesgo simultáneo. Se confirma la pérdida de conectividad con dos collares de monitorización. Se activa el protocolo de contingencia para resguardo de biomasa.",
        riskLevel: "ALTO",
        activeAlerts: 7,
        temperature: 38,
        humidity: 18,
        visualStyles: { glowColor: "rgba(239, 68, 68, 0.3)", accentColor: "text-red-400" }
      }
    ]
  }
};

export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<SectorStory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStageId, setActiveStageId] = useState<string>("");
  const [cssScrollSupported, setCssScrollSupported] = useState<boolean>(false);

  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // 1. Simulación de carga de la API
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // Usamos datos mockeados o fallback si el ID no existe para no romper la app
      const data = MOCK_STORY_DATA[id || ""] || MOCK_STORY_DATA["sector-alpha"];
      
      // Aplicación de View Transition API al montar los datos
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          setStory(data);
          if (data?.stages.length) setActiveStageId(data.stages[0].id);
          setLoading(false);
        });
      } else {
        setStory(data);
        if (data?.stages.length) setActiveStageId(data.stages[0].id);
        setLoading(false);
      }
    }, 600);

    // Detección de soporte nativo para CSS Scroll-driven Animations
    const supported = CSS.supports && (CSS.supports("animation-timeline: scroll()") || CSS.supports("animation-timeline: view()"));
    setCssScrollSupported(supported);
  }, [id]);

  // 2. Fallback de JavaScript: IntersectionObserver (Para navegadores no soportados)
  useEffect(() => {
    if (cssScrollSupported || loading || !story) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -40% 0px", // Evalúa los elementos en el centro de la pantalla
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stageId = entry.target.getAttribute("data-stage-id");
          if (stageId) {
            // Transición suave de datos en el panel con View Transition API si está disponible
            if (document.startViewTransition && !prefersReduced) {
              document.startViewTransition(() => {
                setActiveStageId(stageId);
              });
            } else {
              setActiveStageId(stageId);
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll("[data-stage-id]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [cssScrollSupported, loading, story]);

  // 3. Manejo de Navegación por Teclado Asequible
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!story) return;
    let nextIndex = index;

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = Math.min(index + 1, story.stages.length - 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = Math.max(index - 1, 0);
    } else {
      return;
    }

    const targetId = story.stages[nextIndex].id;
    const element = document.getElementById(`card-${targetId}`);
    if (element) {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
      element.focus();
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0b1120] text-[#e2e8f0]">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-slate-400 font-mono">Cargando Sector Story Engine...</p>
        </div>
      </div>
    );
  }

  if (!story) return <div className="p-8 text-red-400">Error al inicializar la historia del sector.</div>;

  // Renderizado dinámico del panel visual correspondiente al estado activo (Modo Fallback JS)
  const currentFallbackStage = story.stages.find((s) => s.id === activeStageId) || story.stages[0];

  return (
    <div className="min-h-screen bg-[#0b1120] text-[#e2e8f0] px-4 py-6 md:p-8 relative">
      {/* Estilos CSS Inyectados dinámicamente para CSS Scroll-driven Animations */}
      {cssScrollSupported && (
        <style>{`
          @supports (animation-timeline: view()) {
            /* Animación de opacidad en tarjetas de texto izquierdas */
            .scrolly-card {
              animation: fadeCard linear both;
              animation-timeline: view();
              animation-range: entry 10% exit 90%;
            }
            @keyframes fadeCard {
              0% { opacity: 0.2; transform: scale(0.96); }
              40%, 60% { opacity: 1; transform: scale(1); }
              100% { opacity: 0.2; transform: scale(0.96); }
            }

            /* Vinculación de Timelines individuales para el Panel de Control Derecho */
            ${story.stages
              .map(
                (stage) => `
              #card-${stage.id} {
                view-timeline-name: --timeline-${stage.id};
                view-timeline-axis: block;
              }
              #visual-${stage.id} {
                animation: displayVisual panelLinear both;
                animation-timeline: --timeline-${stage.id};
                animation-range: entry 20% exit 80%;
              }
            `
              )
              .join("\n")}

            @keyframes displayVisual {
              0% { opacity: 0; transform: translateY(10px) scale(0.98); pointer-events: none; }
              20%, 80% { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
              100% { opacity: 0; transform: translateY(-10px) scale(0.98); pointer-events: none; }
            }
          }

          /* Soporte estricto de accesibilidad a nivel de sistema operativo */
          @media (prefers-reduced-motion: reduce) {
            .scrolly-card, [id^="visual-"] {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}</style>
      )}

      {/* Header Fijo */}
      <header className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-indigo-400 hover:underline mb-1 flex items-center gap-1 font-mono"
          >
            &larr; Volver al Dashboard
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100">{story.sectorName}</h1>
        </div>
        <div className="text-right">
          <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
            Modo: {cssScrollSupported ? "CSS Animation-Timeline" : "JS Fallback Active"}
          </span>
        </div>
      </header>

      {/* Layout de Doble Columna Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
        
        {/* Columna Izquierda: Bloques de Texto Desplazables */}
        <div ref={cardsContainerRef} className="space-y-[40vh] pb-[30vh]">
          {story.stages.map((stage, index) => (
            <div
              key={stage.id}
              id={`card-${stage.id}`}
              data-stage-id={stage.id}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`scrolly-card p-6 rounded-xl border bg-slate-900/60 backdrop-blur-sm shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${
                !cssScrollSupported && activeStageId === stage.id
                  ? "border-slate-600 opacity-100 ring-1 ring-slate-700"
                  : "border-slate-800 opacity-40"
              }`}
            >
              <h3 className="text-lg font-bold text-slate-100 mb-3 font-mono">{stage.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">{stage.description}</p>
              
              <div className="flex gap-2 flex-wrap text-xs font-mono">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  stage.riskLevel === "ALTO" ? "bg-red-950 text-red-400 border border-red-800" :
                  stage.riskLevel === "MEDIO" ? "bg-amber-950 text-amber-400 border border-amber-800" :
                  "bg-green-950 text-green-400 border border-green-800"
                }`}>
                  RIESGO {stage.riskLevel}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Alertas: {stage.activeAlerts}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 block md:hidden font-mono">
                Desplaza hacia abajo para ver cambios &darr;
              </p>
            </div>
          ))}
        </div>

        {/* Columna Derecha: Panel Visual Estacionario / Fijo */}
        <div className="sticky top-6 md:top-24 h-[50vh] md:h-[70vh] rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl overflow-hidden z-10">
          
          {/* RENDER CUANDO CSS SCROLL ESTÁ SOPORTADO (Múltiples capas animadas nativamente por CSS) */}
          {cssScrollSupported ? (
            story.stages.map((stage) => (
              <div
                key={stage.id}
                id={`visual-${stage.id}`}
                className="absolute inset-0 p-6 flex flex-col justify-between transition-colors duration-500 pointer-events-none opacity-0"
                style={{ backgroundColor: stage.visualStyles.glowColor }}
              >
                <VisualPanelContent stage={stage} />
              </div>
            ))
          ) : (
            /* RENDER FALLBACK JAVASCRIPT (Una sola capa reactiva al estado de React) */
            <div
              className="w-full h-full p-6 flex flex-col justify-between transition-all duration-500"
              style={{
                backgroundColor: currentFallbackStage.visualStyles.glowColor,
                viewTransitionName: "fallback-panel-engine" // Soporte de View Transition nativo inter-estados
              }}
            >
              <VisualPanelContent stage={currentFallbackStage} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Componente Interno para pintar las métricas y gráficos simulados dentro del Panel Fijo
function VisualPanelContent({ stage }: { stage: StoryStage }) {
  return (
    <>
      {/* Header Interno del Panel */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <p className="text-xs text-slate-400 font-mono tracking-widest">TELEMETRÍA EN TIEMPO REAL</p>
          <h4 className="text-base font-bold text-slate-200 mt-0.5">Indicadores Críticos de Zona</h4>
        </div>
        <div className="flex h-2.5 w-2.5 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            stage.riskLevel === "ALTO" ? "bg-red-400" : stage.riskLevel === "MEDIO" ? "bg-amber-400" : "bg-green-400"
          }`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            stage.riskLevel === "ALTO" ? "bg-red-500" : stage.riskLevel === "MEDIO" ? "bg-amber-500" : "bg-green-500"
          }`}></span>
        </div>
      </div>

      {/* Grid Central de Métricas Reactivas */}
      <div className="grid grid-cols-2 gap-4 my-auto">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">TEMPERATURA</p>
          <p className={`text-2xl md:text-3xl font-black mt-1 ${stage.visualStyles.accentColor}`}>
            {stage.temperature}°C
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                stage.riskLevel === "ALTO" ? "bg-red-500" : stage.riskLevel === "MEDIO" ? "bg-amber-500" : "bg-green-500"
              }`}
              style={{ width: `${(stage.temperature / 50) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <p className="text-xs text-slate-400 font-mono">HUMEDAD AMBIENTAL</p>
          <p className="text-2xl md:text-3xl font-black mt-1 text-blue-400">
            {stage.humidity}%
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${stage.humidity}%` }}
            ></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 font-mono">ALERTAS EN COLA</p>
            <p className="text-xl font-bold mt-0.5 text-slate-200">{stage.activeAlerts} Incidentes</p>
          </div>
          <div className={`text-xs px-3 py-1.5 rounded font-mono font-bold ${
            stage.riskLevel === "ALTO" ? "bg-red-500/20 text-red-400" :
            stage.riskLevel === "MEDIO" ? "bg-amber-500/20 text-amber-400" :
            "bg-green-500/20 text-green-400"
          }`}>
            STATUS: {stage.riskLevel}
          </div>
        </div>
      </div>

      {/* Footer Gráfico del Panel */}
      <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono">Motor de Simulación v1.2</span>
        <div className="flex gap-1">
          {/* Barras de ecualizador simulado reactivas al nivel de peligro */}
          {[1, 2, 3, 4, 5].map((bar) => (
            <div
              key={bar}
              className={`w-1 rounded-full transition-all duration-300 ${
                stage.riskLevel === "ALTO" ? "bg-red-500 h-6 animate-pulse" :
                stage.riskLevel === "MEDIO" ? "bg-amber-500 h-4" : "bg-green-500 h-2"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}