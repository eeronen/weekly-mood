import { createSignal, Show } from 'solid-js';
import { DrawingCanvas } from './DrawingCanvas';
import { ImageUpload } from './ImageUpload';

interface ImageInputProps {
    onDone: (imageData: string | null, imageType: 'drawing' | 'upload' | null) => void;
    submitting: boolean;
    error: string | null;
    onBack: () => void;
}

type Tab = 'draw' | 'upload' | 'skip';

export function ImageInput(props: ImageInputProps) {
    const [tab, setTab] = createSignal<Tab>('draw');
    const [drawingData, setDrawingData] = createSignal<string | null>(null);
    const [uploadData, setUploadData] = createSignal<string | null>(null);

    const handleSubmit = () => {
        if (tab() === 'draw') {
            props.onDone(drawingData(), 'drawing');
        } else if (tab() === 'upload') {
            props.onDone(uploadData(), 'upload');
        } else {
            props.onDone(null, null);
        }
    };

    return (
        <div class="step-container">
            <h2>Add a picture</h2>
            <p class="step-description">Draw something or upload an image — or skip it entirely.</p>

            <div class="image-tabs">
                <button
                    type="button"
                    class="tab-btn"
                    classList={{ active: tab() === 'draw' }}
                    onClick={() => setTab('draw')}
                >
                    ✏️ Draw
                </button>
                <button
                    type="button"
                    class="tab-btn"
                    classList={{ active: tab() === 'upload' }}
                    onClick={() => setTab('upload')}
                >
                    📁 Upload
                </button>
                <button
                    type="button"
                    class="tab-btn"
                    classList={{ active: tab() === 'skip' }}
                    onClick={() => setTab('skip')}
                >
                    ⏭️ Skip
                </button>
            </div>

            <Show when={tab() === 'draw'}>
                <DrawingCanvas onImageChange={setDrawingData} />
            </Show>

            <Show when={tab() === 'upload'}>
                <ImageUpload onImageChange={setUploadData} />
            </Show>

            <Show when={tab() === 'skip'}>
                <div class="skip-message">
                    <span class="skip-icon">😊</span>
                    <p>No image? That's totally fine!</p>
                </div>
            </Show>

            <Show when={props.error}>
                <p class="error-text">{props.error}</p>
            </Show>

            <div class="image-step-actions">
                <button
                    type="button"
                    class="btn-secondary"
                    onClick={props.onBack}
                    disabled={props.submitting}
                >
                    ← Back
                </button>
                <button
                    type="button"
                    class="btn-primary"
                    onClick={handleSubmit}
                    disabled={props.submitting}
                >
                    {props.submitting ? '⏳ Submitting…' : 'Submit Mood 🚀'}
                </button>
            </div>
        </div>
    );
}
