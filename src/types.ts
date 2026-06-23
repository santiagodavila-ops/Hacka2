// Tipos compartidos de TropelCare. Sin "any": todo estrictamente tipado.
// Integrantes B y C pueden ampliar este archivo con sus propios tipos
// (Tropel, SignalFeedItem, SectorStory, etc.).

export interface User {
  id: string;
  email: string;
  teamCode: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardSummary {
  totalTropels: number;
  activeSignals: number;
  attendedSignals: number;
  sectorsAtRisk: number;
}

export type SignalStatus = "PENDIENTE" | "PROCESANDO" | "ATENDIDA";

export type Species = "EQUINO" | "BOVINO" | "CAPRINO" | "OVINO" | "OTRO";

export type VitalState = "ESTABLE" | "CRITICO" | "EN_RIESGO";

export interface Signal {
  id: string;
  title: string;
  description: string;
  species: Species;
  vitalState: VitalState;
  sectorId: string;
  status: SignalStatus;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Tipos compartidos B (Checkpoints 2 y 3). Se centralizan aquí porque los
// hooks usePaginatedTropels / useSignalsFeed los consumen. Si la API real usa
// otros nombres de campo, ajustar solo aquí.
// ---------------------------------------------------------------------------

// Checkpoint 2: paginación clásica por página/tamaño.
export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export interface Tropel {
  id: string;
  title: string;
  description: string;
  riskLevel: "ALTO" | "MEDIO" | "BAJO";
  activeAlerts: number;
  temperature: number;
  humidity: number;
  visualStyles: {
    glowColor: string;
    accentColor: string;
  };
}

// Checkpoint 3: paginación por cursor para el feed infinito.
export interface FeedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface SignalFeedItem {
  id: string;
  title: string;
  signalType?: string;
  severity?: string;
  species: Species;
  vitalState: VitalState;
  sectorId: string;
  status: SignalStatus;
  createdAt: string;
}

<<<<<<< HEAD
// ---------------------------------------------------------------------------
// Tipos C (Checkpoint 5): Sector Story Engine.
// GET /sectors/{id}/story devuelve una narrativa por etapas: cada etapa tiene
// texto (panel izquierdo, scroll) y métricas/acento (panel visual derecho).
// ---------------------------------------------------------------------------

export interface SectorStoryMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export type StoryAccent = "calm" | "warning" | "danger" | "critical";

export interface SectorStoryStage {
  id: string;
  title: string;
  body: string;
  accent?: StoryAccent;
  metrics: SectorStoryMetric[];
=======
export type SignalSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
// ============================================================
// Tipos CP5 - Sector Story
// ============================================================
export interface SectorStoryStage {
  id: string;
  title: string;
  narrative: string;
  metrics: Record<string, number | string>;
  accent?: string;
>>>>>>> RamaSandra
}

export interface SectorStory {
  sectorId: string;
  sectorName: string;
  intro: string;
  stages: SectorStoryStage[];
<<<<<<< HEAD
}
=======
}
>>>>>>> RamaSandra
