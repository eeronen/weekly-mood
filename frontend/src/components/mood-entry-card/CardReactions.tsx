import { createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import type { Reaction } from '../../types';
import { addReaction, removeReaction } from '../../api';
import './CardReactions.css';

interface CardReactionsProps {
    entryId: number;
    reactions: Reaction[];
    onChange?: () => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '💯'];

export function CardReactions(props: CardReactionsProps) {
    const currentUserName = localStorage.getItem('sprintMoodName') ?? '';
    const [showPicker, setShowPicker] = createSignal(false);
    let containerRef: HTMLDivElement | undefined;

    const handleClickOutside = (e: MouseEvent) => {
        if (showPicker() && containerRef && !containerRef.contains(e.target as Node)) {
            setShowPicker(false);
        }
    };

    onMount(() => document.addEventListener('click', handleClickOutside));
    onCleanup(() => document.removeEventListener('click', handleClickOutside));

    const handleReaction = async (emoji: string) => {
        if (!currentUserName) return;
        const existing = props.reactions.find(
            (r) => r.emoji === emoji && r.users.split(',').includes(currentUserName),
        );
        try {
            if (existing) {
                await removeReaction(props.entryId, emoji, currentUserName);
            } else {
                await addReaction(props.entryId, emoji, currentUserName);
            }
            props.onChange?.();
        } catch {
            // silently ignore errors
        }
        setShowPicker(false);
    };

    return (
        <div ref={containerRef} class="card-reactions">
            <Show when={props.reactions.length > 0}>
                <div class="reactions-display">
                    <For each={props.reactions}>
                        {(reaction: Reaction) => {
                            const userReacted = () =>
                                currentUserName &&
                                reaction.users.split(',').includes(currentUserName);
                            return (
                                <button
                                    type="button"
                                    class="reaction-btn"
                                    classList={{ 'user-reacted': !!userReacted() }}
                                    onClick={() => handleReaction(reaction.emoji)}
                                    title={reaction.users.split(',').join(', ')}
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
                        onClick={() => setShowPicker(!showPicker())}
                    >
                        😊+
                    </button>
                    <Show when={showPicker()}>
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
    );
}
