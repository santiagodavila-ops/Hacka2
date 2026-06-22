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
