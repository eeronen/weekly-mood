export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Very Bad",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Great",
};

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "🤩",
};

export const MOOD_COLORS: Record<MoodLevel, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

export interface MoodEntry {
  id?: number;
  name: string;
  mood: MoodLevel;
  image_data?: string | null;
  image_type?: "drawing" | "upload" | null;
  created_at?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  id?: number;
  error?: string;
}
