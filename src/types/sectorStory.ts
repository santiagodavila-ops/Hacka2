export type StorySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MetricTrend = "up" | "down" | "stable";

export interface SectorStoryMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend?: MetricTrend;
}

export interface SectorStoryStage {
  id: string;
  title: string;
  description: string;
  severity: StorySeverity;
  metrics: SectorStoryMetric[];
  visualLabel?: string;
}

export interface SectorStoryResponse {
  sectorId: string;
  sectorName: string;
  summary: string;
  updatedAt: string;
  stages: SectorStoryStage[];
}