import { createResource, Show } from "solid-js";
import { getMoodsByUser } from "../../api";
import type { MoodEntry, MoodLevel } from "../../types";
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from "../../types";
import { UserMoodHistory } from "./UserMoodHistory";
import "./UserProfileModal.css";

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
  const level = () => props.entry.mood as MoodLevel;

  return (
    <div
      class="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div class="modal-content">
        <button type="button" class="modal-close" onClick={props.onClose}>
          ✕
        </button>

        <div class="modal-header">
          <span class="modal-user-emoji">{MOOD_EMOJIS[level()]}</span>
          <div>
            <h2 class="modal-user-name">{props.entry.name}</h2>
            <span
              class="modal-mood-label"
              style={{ color: MOOD_COLORS[level()] }}
            >
              {MOOD_LABELS[level()]}
            </span>
          </div>
        </div>

        <Show when={props.entry.image_data}>
          {(imageData) => (
            <img
              src={imageData()}
              alt={`${props.entry.name}'s mood`}
              class="modal-image"
            />
          )}
        </Show>

        <Show when={history.loading}>
          <div class="loading">Loading history…</div>
        </Show>

        <Show when={!history.loading && entries().length > 0}>
          <div class="modal-history-wrapper">
            <UserMoodHistory entries={entries()} />
          </div>
        </Show>
      </div>
    </div>
  );
}
