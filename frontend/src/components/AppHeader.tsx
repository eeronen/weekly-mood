import { Show } from 'solid-js';
import type { Step } from '../useSubmissionFlow';
import '../SubmitPage.css';

interface AppHeaderProps {
    name: string;
    step: Step;
    onChangeName: () => void;
    onEditMood: () => void;
    showEditMood: boolean;
}

export function AppHeader(props: AppHeaderProps) {
    return (
        <header class="app-header">
            <a href="/submit" class="app-title">
                <img src="/favicon.svg" alt="" class="app-logo" />
                <h1>Sprint Mood</h1>
            </a>
            <div class="header-actions">
                <Show when={props.name && props.step !== 'name'}>
                    <div class="current-user">
                        <span class="user-avatar">👤</span>
                        <span class="user-name">{props.name}</span>
                        <button type="button" class="btn-link" onClick={props.onChangeName}>
                            Change
                        </button>
                    </div>
                </Show>
                <Show when={props.showEditMood}>
                    <button type="button" class="btn-link" onClick={props.onEditMood}>
                        ✏️ Edit mood
                    </button>
                </Show>
                <a href="/" class="btn-link display-link">
                    View All →
                </a>
                <a
                    href="https://github.com/eeronen/weekly-mood/issues/new"
                    class="btn-link display-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    🐛 Report Issue
                </a>
            </div>
        </header>
    );
}
