import { createResource, For, Show } from "solid-js";
import { getMoodsByUser } from "../api";
import type { MoodEntry, MoodLevel } from "../types";
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from "../types";

interface UserProfileModalProps {
  entry: MoodEntry;
  onClose: () => void;
}

export function UserProfileModal(props: UserProfileModalProps) {
  const [history] = createResource(
    () => props.entry.name,
    (name) => getMoodsByUser(name),
  );

  const entries = () => history()?.data ?? [];

  const avgMood = () => {
    const data = entries();
    if (data.length === 0) return null;
    return (data.reduce((sum, m) => sum + m.mood, 0) / data.length).toFixed(1);
  };

  const level = () => props.entry.mood as MoodLevel;

  return (
    <div class="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) props.onClose();
    }}>
      <div class="modal-content">
        <button type="button" class="modal-close" onClick={props.onClose}>✕</button>

        <div class="modal-header">
          <span class="modal-user-emoji">{MOOD_EMOJIS[level()]}</span>
          <div>
            <h2 class="modal-user-name">{props.entry.name}</h2>
            <span class="modal-mood-label" style={{ color: MOOD_COLORS[level()] }}>
              {MOOD_LABELS[level()]}
            </span>
          </div>
        </div>

        <Show when={props.entry.image_data}>
          {(imageData) => (
            <img src={imageData()} alt={`${props.entry.name}'s mood`} class="modal-image" />
          )}
        </Show>

        <Show when={!history.loading && entries().length > 0}>
          <div class="modal-stats">
            <div class="modal-stat">
              <span class="modal-stat-number">{entries().length}</span>
              <span class="modal-stat-label">Submissions</span>
            </div>
            <div class="modal-stat">
              <span class="modal-stat-number">{avgMood()}</span>
              <span class="modal-stat-label">Avg. Mood</span>
            </div>
          </div>

          <div class="modal-history">
            <h3>Previous moods</h3>
            <div class="modal-history-list">
              <For each={entries()}>
                {(entry) => {
                  const lvl = entry.mood as MoodLevel;
                  const date = entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "";
                  return (
                    <div class="modal-history-item" style={{ "--mood-color": MOOD_COLORS[lvl] }}>
                      <span class="modal-history-emoji">{MOOD_EMOJIS[lvl]}</span>
                      <span class="modal-history-mood" style={{ color: MOOD_COLORS[lvl] }}>{MOOD_LABELS[lvl]}</span>
                      <span class="modal-history-date">{date}</span>
                      <Show when={entry.image_data}>
                        {(img) => <img src={img()} alt="" class="modal-history-thumb" />}
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>

        <Show when={history.loading}>
          <div class="loading">Loading history…</div>
        </Show>
      </div>
    </div>
  );
}
