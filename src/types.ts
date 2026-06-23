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

// ============================================================
// Tipos añadidos por Integrante B (CP2 y CP3)
// ============================================================

// Respuesta paginada estilo Spring (CP2)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Respuesta del feed cursor-based (CP3)
export interface FeedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

// Tropel (CP2) — verificar contra Swagger antes de probar
export interface Tropel {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  sectorId: string;
  sectorName?: string;
  chaosIndex: number;
  updatedAt: string;
}

// Item del feed de señales (CP3)
// NOTA: A ya definió `Signal` para el detalle (CP4). Este es el shape resumido del listado.
// Si Swagger dice que el listado devuelve el `Signal` completo, cambia esto por `Signal`.
export interface SignalFeedItem {
  id: string;
  title: string;
  species: Species;
  vitalState: VitalState;
  sectorId: string;
  status: SignalStatus;
  createdAt: string;
  severity?: SignalSeverity;
  signalType?: string;
}

export type SignalSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";