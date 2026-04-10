import { createResource, createSignal, For, Show } from 'solid-js';
import { getMoods } from '../api';
import type { MoodEntry, MoodLevel } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../types';
import { MoodEntryCard } from './MoodEntryCard';

export function DisplayPage() {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = createSignal(today);
    const [moods, { refetch }] = createResource(date, getMoods);

    const entries = () => moods()?.data ?? [];

    const avgMood = () => {
        const data = entries();
        if (data.length === 0) return null;
        const sum = data.reduce((acc, m) => acc + m.mood, 0);
        return (sum / data.length).toFixed(1);
    };

    const moodDistribution = () => {
        const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        for (const m of entries()) dist[m.mood] = (dist[m.mood] ?? 0) + 1;
        return dist;
    };

    return (
        <div class="display-page">
            <div class="display-header">
                <h1>🎯 Sprint Review Moods</h1>
                <div class="display-controls">
                    <input
                        type="date"
                        class="date-input"
                        value={date()}
                        onInput={(e) => setDate(e.currentTarget.value)}
                        max={today}
                    />
                    <button type="button" class="btn-secondary" onClick={() => refetch()}>
                        🔄 Refresh
                    </button>
                    <a href="/" class="btn-secondary" style={{ 'text-decoration': 'none' }}>
                        ← Submit mood
                    </a>
                </div>
            </div>

            <Show when={moods.loading}>
                <div class="loading">Loading moods…</div>
            </Show>

            <Show when={moods.error}>
                <div class="error-banner">Failed to load moods. Is the backend running?</div>
            </Show>

            <Show when={!moods.loading}>
                <Show when={entries().length === 0 && !moods.error}>
                    <div class="empty-state">
                        <span class="empty-icon">🤷</span>
                        <p>No moods submitted for this date yet.</p>
                    </div>
                </Show>

                <Show when={entries().length > 0}>
                    <div class="display-summary">
                        <div class="summary-stat">
                            <span class="stat-number">{entries().length}</span>
                            <span class="stat-label">Submissions</span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-number">{avgMood()}</span>
                            <span class="stat-label">Avg. Mood</span>
                        </div>
                        <For each={[1, 2, 3, 4, 5] as MoodLevel[]}>
                            {(level) => (
                                <Show when={moodDistribution()[level] > 0}>
                                    <div
                                        class="summary-stat"
                                        style={{ '--mood-color': MOOD_COLORS[level] }}
                                    >
                                        <span
                                            class="stat-number"
                                            style={{ color: MOOD_COLORS[level] }}
                                        >
                                            {MOOD_EMOJIS[level]} {moodDistribution()[level]}
                                        </span>
                                        <span class="stat-label">{MOOD_LABELS[level]}</span>
                                    </div>
                                </Show>
                            )}
                        </For>
                    </div>

                    <div class="mood-grid-display">
                        <For each={entries()}>
                            {(entry: MoodEntry) => <MoodEntryCard entry={entry} />}
                        </For>
                    </div>
                </Show>
            </Show>
        </div>
    );
}
