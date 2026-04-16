import { For } from 'solid-js';
import type { MoodEntry, MoodLevel } from '../../types';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../../types';

interface UserMoodHistoryProps {
    entries: MoodEntry[];
}

export function UserMoodHistory(props: UserMoodHistoryProps) {
    const avgMood = () => {
        const data = props.entries;
        if (data.length === 0) return null;
        return (data.reduce((sum, m) => sum + m.mood, 0) / data.length).toFixed(1);
    };

    return (
        <>
            <div class="modal-stats">
                <div class="modal-stat">
                    <span class="modal-stat-number">{props.entries.length}</span>
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
                    <For each={props.entries}>
                        {(entry) => {
                            const lvl = entry.mood as MoodLevel;
                            const date = entry.created_at
                                ? new Date(entry.created_at).toLocaleDateString()
                                : '';
                            return (
                                <div
                                    class="modal-history-item"
                                    style={{ '--mood-color': MOOD_COLORS[lvl] }}
                                >
                                    <span class="modal-history-emoji">{MOOD_EMOJIS[lvl]}</span>
                                    <span
                                        class="modal-history-mood"
                                        style={{ color: MOOD_COLORS[lvl] }}
                                    >
                                        {MOOD_LABELS[lvl]}
                                    </span>
                                    <span class="modal-history-date">{date}</span>
                                    {entry.image_data && (
                                        <img
                                            src={entry.image_data}
                                            alt=""
                                            class="modal-history-thumb"
                                        />
                                    )}
                                </div>
                            );
                        }}
                    </For>
                </div>
            </div>
        </>
    );
}
