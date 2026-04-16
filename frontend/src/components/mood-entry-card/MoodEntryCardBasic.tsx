import { Show } from 'solid-js';
import type { MoodEntry, MoodLevel, Reaction } from '../../types';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../../types';
import { CardReactions } from './CardReactions';
import './MoodEntryCard.css';

interface MoodEntryCardProps {
    entry: MoodEntry;
    reactions: Reaction[];
    onReactionsChange?: () => void;
    onClick?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
}

export function MoodEntryCard(props: MoodEntryCardProps) {
    const level = () => props.entry.mood as MoodLevel;

    return (
        <div
            class="mood-entry-card"
            style={{ '--mood-color': MOOD_COLORS[level()] }}
            onClick={(e) => {
                if ((e.target as HTMLElement).closest('.card-reactions, .btn-delete-card')) return;
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
                            onClick={(e) => {
                                e.stopPropagation();
                                props.onEdit?.();
                            }}
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
                    <img src={imageData()} alt={`${props.entry.name}'s mood`} class="card-image" />
                )}
            </Show>
            <Show when={props.entry.id !== undefined}>
                <CardReactions
                    entryId={props.entry.id!}
                    reactions={props.reactions}
                    onChange={props.onReactionsChange}
                />
            </Show>
        </div>
    );
}
