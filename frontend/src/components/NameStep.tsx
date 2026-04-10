import { createSignal } from 'solid-js';

interface NameStepProps {
    currentName: string;
    onConfirm: (name: string) => void;
}

export function NameStep(props: NameStepProps) {
    const [value, setValue] = createSignal(props.currentName);
    const [error, setError] = createSignal('');

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        const trimmed = value().trim();
        if (!trimmed) {
            setError('Please enter your name');
            return;
        }
        if (trimmed.length > 100) {
            setError('Name must be 100 characters or less');
            return;
        }
        setError('');
        props.onConfirm(trimmed);
    };

    return (
        <div class="step-container">
            <div class="step-icon">👋</div>
            <h2>What's your name?</h2>
            <p class="step-description">
                Your name is saved locally so you don't have to type it every time.
            </p>
            <form onSubmit={handleSubmit} class="name-form">
                <input
                    type="text"
                    class="name-input"
                    placeholder="Enter your name…"
                    value={value()}
                    onInput={(e) => setValue(e.currentTarget.value)}
                    maxLength={100}
                    autofocus
                />
                {error() && <p class="error-text">{error()}</p>}
                <button type="submit" class="btn-primary">
                    Continue →
                </button>
            </form>
        </div>
    );
}
