import { createSignal, Show } from 'solid-js';
import './ImageUpload.css';

interface ImageUploadProps {
    onImageChange: (dataUrl: string | null) => void;
}

function resizeImage(dataUrl: string, maxW: number, maxH: number): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width;
            let h = img.height;
            if (w > maxW || h > maxH) {
                const ratio = Math.min(maxW / w, maxH / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(dataUrl);
                return;
            }
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = dataUrl;
    });
}

export function ImageUpload(props: ImageUploadProps) {
    const [preview, setPreview] = createSignal<string | null>(null);
    const [dragOver, setDragOver] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);

    const MAX_FILE_SIZE = 8 * 1024 * 1024;

    const handleFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith('image/')) return;
        if (file.size > MAX_FILE_SIZE) {
            setError('File is too large (max 8 MB). Try a shorter or smaller GIF.');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            const result =
                file.type === 'image/gif' ? dataUrl : await resizeImage(dataUrl, 800, 800);
            setPreview(result);
            props.onImageChange(result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            role="none"
            class="upload-area"
            classList={{ 'drag-over': dragOver() }}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer?.files[0];
                if (file) handleFile(file);
            }}
        >
            <Show
                when={preview()}
                fallback={
                    <div class="upload-placeholder">
                        <span class="upload-icon">🖼️</span>
                        <p>Drag &amp; drop an image here</p>
                    </div>
                }
            >
                {(previewUrl) => <img src={previewUrl()} class="upload-preview" alt="Preview" />}
            </Show>
            <Show when={error()}>{(msg) => <p class="upload-error">{msg()}</p>}</Show>
            <label class="btn-secondary upload-btn">
                {preview() ? '🔄 Change file' : '📂 Choose file'}
                <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
            </label>
        </div>
    );
}
