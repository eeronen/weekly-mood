import { For } from "solid-js";
import type { MoodLevel } from "../types";
import { MOOD_LABELS, MOOD_EMOJIS, MOOD_COLORS } from "../types";

interface MoodSelectorProps {
  onSelect: (mood: MoodLevel) => void;
}

const MOODS: MoodLevel[] = [1, 2, 3, 4, 5];

export default function MoodSelector(props: MoodSelectorProps) {
  return (
    <div class="step-container">
      <h2>How are you feeling?</h2>
      <p class="step-description">Select your mood for this sprint</p>
      <div class="mood-grid">
        <For each={MOODS}>
          {(level) => (
            <button
              class="mood-card"
              style={{ "--mood-color": MOOD_COLORS[level] }}
              onClick={() => props.onSelect(level)}
              title={MOOD_LABELS[level]}
            >
              <span class="mood-emoji">{MOOD_EMOJIS[level]}</span>
              <span class="mood-number">{level}</span>
              <span class="mood-label">{MOOD_LABELS[level]}</span>
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
