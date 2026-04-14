import { For } from 'solid-js';
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from '../types';
const MOODS = [1, 2, 3, 4, 5];
export function MoodSelector(props) {
    return (<div class="step-container">
            <h2>How are you feeling?</h2>
            <p class="step-description">Select your mood for this sprint</p>
            <div class="mood-grid">
                <For each={MOODS}>
                    {(level) => (<button type="button" class="mood-card" style={{ '--mood-color': MOOD_COLORS[level] }} onClick={() => props.onSelect(level)} title={MOOD_LABELS[level]}>
                            <span class="mood-emoji">{MOOD_EMOJIS[level]}</span>
                            <span class="mood-number">{level}</span>
                            <span class="mood-label">{MOOD_LABELS[level]}</span>
                        </button>)}
                </For>
            </div>
        </div>);
}
