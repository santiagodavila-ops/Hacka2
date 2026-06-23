import type { SectorStoryResponse } from "../types/sectorStory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

function getBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL environment variable");
  }

  return API_BASE_URL;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  if (!token) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getSectorStory(
  sectorId: string,
  signal?: AbortSignal,
): Promise<SectorStoryResponse> {
  const response = await fetch(`${getBaseUrl()}/sectors/${sectorId}/story`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Could not load sector story. Status: ${response.status}`);
  }

  const data: SectorStoryResponse = await response.json();
  return data;
}