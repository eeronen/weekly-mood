import type { MoodEntry, ApiResponse } from "./types";

const API_BASE = "/api";

export async function submitMood(
  entry: MoodEntry,
): Promise<ApiResponse<never>> {
  const response = await fetch(`${API_BASE}/moods.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok && response.status !== 400 && response.status !== 413) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
}

export async function getMoods(
  date?: string,
): Promise<ApiResponse<MoodEntry[]>> {
  const url = date
    ? `${API_BASE}/moods.php?date=${encodeURIComponent(date)}`
    : `${API_BASE}/moods.php`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  return response.json();
}
