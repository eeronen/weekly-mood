import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { MoodEntry, MoodLevel, Reaction } from "../types";
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from "../types";
import { addReaction, removeReaction } from "../api";

interface MoodEntryCardProps {
  entry: MoodEntry;
  reactions: Reaction[];
  onReactionsChange?: () => void;
  onClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "💯"];

export function MoodEntryCard(props: MoodEntryCardProps) {
  const level = () => props.entry.mood as MoodLevel;
  const [showReactionPicker, setShowReactionPicker] = createSignal(false);
  const currentUserName = localStorage.getItem("sprintMoodName") ?? "";

  const reactionData = () => props.reactions;

  const handleReaction = async (emoji: string) => {
    if (!props.entry.id || !currentUserName) return;

    const existing = reactionData().find(
      (r) => r.emoji === emoji && r.users.split(",").includes(currentUserName),
    );

    try {
      if (existing) {
        await removeReaction(props.entry.id, emoji, currentUserName);
      } else {
        await addReaction(props.entry.id, emoji, currentUserName);
      }
      props.onReactionsChange?.();
    } catch {
      // silently ignore errors
    }
    setShowReactionPicker(false);
  };

  let cardRef: HTMLDivElement | undefined;

  const handleClickOutside = (e: MouseEvent) => {
    if (showReactionPicker() && cardRef && !cardRef.contains(e.target as Node)) {
      setShowReactionPicker(false);
    }
  };

  onMount(() => document.addEventListener("click", handleClickOutside));
  onCleanup(() => document.removeEventListener("click", handleClickOutside));

  return (
    <div
      ref={cardRef}
      class="mood-entry-card"
      style={{ "--mood-color": MOOD_COLORS[level()] }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".card-reactions, .btn-delete-card")) return;
        props.onClick?.();
      }}
    >
      <div class="card-header">
        <span class="card-name">{props.entry.name}</span>
        <div class="card-header-right">
          <span class="card-emoji">{MOOD_EMOJIS[level()]}</span>
          <Show when={props.onEdit}>
            <button
              type="button"
              class="btn-delete-card"
              onClick={(e) => { e.stopPropagation(); props.onEdit?.(); }}
              title="Edit entry"
              aria-label="Edit entry"
            >
              ✏️
            </button>
          </Show>
          <Show when={props.onDelete}>
            <button
              type="button"
              class="btn-delete-card"
              onClick={props.onDelete}
              title="Delete entry"
              aria-label="Delete entry"
            >
              🗑️
            </button>
          </Show>
        </div>
      </div>
      <div class="card-mood">
        <span class="card-mood-number">{props.entry.mood}</span>
        <span class="card-mood-label">{MOOD_LABELS[level()]}</span>
      </div>
      <Show when={props.entry.image_data}>
        {(imageData) => (
          <img
            src={imageData()}
            alt={`${props.entry.name}'s mood`}
            class="card-image"
          />
        )}
      </Show>

      <div class="card-reactions">
        <Show when={reactionData().length > 0}>
          <div class="reactions-display">
            <For each={reactionData()}>
              {(reaction: Reaction) => {
                const userReacted = () =>
                  currentUserName &&
                  reaction.users.split(",").includes(currentUserName);
                return (
                  <button
                    type="button"
                    class={`reaction-btn ${userReacted() ? "user-reacted" : ""}`}
                    onClick={() => handleReaction(reaction.emoji)}
                    title={`${reaction.users.split(",").join(", ")}`}
                  >
                    {reaction.emoji} {reaction.count}
                  </button>
                );
              }}
            </For>
          </div>
        </Show>

        <Show when={currentUserName}>
          <div class="reaction-controls">
            <button
              type="button"
              class="add-reaction-btn"
              onClick={() => setShowReactionPicker(!showReactionPicker())}
            >
              😊+
            </button>

            <Show when={showReactionPicker()}>
              <div class="reaction-picker">
                <For each={REACTION_EMOJIS}>
                  {(emoji) => (
                    <button
                      type="button"
                      class="reaction-option"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
