import { Show } from 'solid-js';
import type { MoodEntry } from '../../types';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../../types';
import './SuccessScreen.css';

interface AlreadySubmittedProps {
    name: string;
    entry: MoodEntry;
    onEdit: () => void;
}

export function AlreadySubmitted(props: AlreadySubmittedProps) {
    return (
        <div class="success-container">
            <div class="success-icon">✅</div>
            <h2>Already submitted today</h2>
            <p class="step-description">
                You've already submitted your mood for today, {props.name}.
            </p>
            <div class="success-card" style={{ '--mood-color': MOOD_COLORS[props.entry.mood] }}>
                <span class="mood-emoji large">{MOOD_EMOJIS[props.entry.mood]}</span>
                <div class="success-mood-info">
                    <span class="success-mood-number">{props.entry.mood}/5</span>
                    <span class="success-mood-label">{MOOD_LABELS[props.entry.mood]}</span>
                </div>
                <Show when={props.entry.image_data}>
                    {(imgData) => (
                        <img src={imgData()} alt="Your submitted mood" class="success-image" />
                    )}
                </Show>
            </div>
            <div class="success-actions">
                <button type="button" class="btn-primary" onClick={props.onEdit}>
                    ✏️ Edit entry
                </button>
                <a href="/display" class="btn-secondary" style={{ 'text-decoration': 'none' }}>
                    View all moods →
                </a>
            </div>
        </div>
    );
}
