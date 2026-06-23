// Tipos compartidos de TropelCare. Sin "any": todo estrictamente tipado.
// Integrantes B y C pueden ampliar este archivo con sus propios tipos
// (Tropel, SignalFeedItem, SectorStory, etc.).

export interface User {
  id: string;
  name?: string;
  email: string;
  teamCode?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardSummary {
  totalTropels: number;
  totalSignals: number;
  pendingSignals: number;
  criticalSignals: number;
  activeSignals: number;
  attendedSignals: number;
  sectorsAtRisk: number;
  activeSectors?: number;
  updatedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  page?: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type VitalState =
  | "SANO"
  | "OBSERVACION"
  | "CRITICO"
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "UNKNOWN"
  | "DECEASED";

export interface Tropel {
  id: string;
  name: string;
  species: string;
  vitalState: VitalState;
  sectorId: string;
  sectorName?: string;
  chaosIndex?: number;
  lastSignalAt?: string;
  updatedAt: string;
}

export type SignalSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SignalStatus = "PENDIENTE" | "PROCESANDO" | "ATENDIDA";

export interface SignalFeedItem {
  id: string;
  title: string;
  tropelId: string;
  tropelName?: string;
  species: string;
  vitalState: VitalState;
  sectorId: string;
  sectorName?: string;
  signalType: string;
  severity: SignalSeverity;
  status: SignalStatus;
  message?: string;
  createdAt: string;
}

export interface FeedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface Signal {
  id: string;
  title: string;
  description?: string;
  message?: string;
  tropelId: string;
  tropelName?: string;
  species?: string;
  vitalState?: VitalState;
  sectorId: string;
  sectorName?: string;
  signalType: string;
  severity: SignalSeverity;
  status: SignalStatus;
  createdAt: string;
  updatedAt?: string;
}
