import { Show } from 'solid-js';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../types';
export function SuccessScreen(props) {
    return (<div class="success-container">
            <div class="success-icon">🎉</div>
            <h2>Mood submitted!</h2>
            <p class="step-description">Thanks, {props.name}! Your mood has been recorded.</p>

            <div class="success-card" style={{ '--mood-color': MOOD_COLORS[props.mood] }}>
                <span class="mood-emoji large">{MOOD_EMOJIS[props.mood]}</span>
                <div class="success-mood-info">
                    <span class="success-mood-number">{props.mood}/5</span>
                    <span class="success-mood-label">{MOOD_LABELS[props.mood]}</span>
                </div>
                <Show when={props.imageData}>
                    {(imageData) => (<img src={imageData()} alt="Your submitted mood" class="success-image"/>)}
                </Show>
            </div>

            <div style={{
            display: 'flex',
            gap: '12px',
            'flex-wrap': 'wrap',
            'justify-content': 'center',
        }}>
                <button type="button" class="btn-primary" onClick={props.onNext}>
                    Submit another
                </button>
                <a href="/display" class="btn-secondary" style={{ 'text-decoration': 'none' }}>
                    View all moods →
                </a>
            </div>
        </div>);
}
