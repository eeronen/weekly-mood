import { createSignal, Show } from "solid-js";
function resizeImage(dataUrl, maxW, maxH) {
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
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(dataUrl);
                return;
            }
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = dataUrl;
    });
}
export function ImageUpload(props) {
    const [preview, setPreview] = createSignal(null);
    const [dragOver, setDragOver] = createSignal(false);
    const handleFile = (file) => {
        if (!file.type.startsWith("image/")) {
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result;
            const resized = await resizeImage(dataUrl, 800, 800);
            setPreview(resized);
            props.onImageChange(resized);
        };
        reader.readAsDataURL(file);
    };
    return (<div role="none" class="upload-area" classList={{ "drag-over": dragOver() }} onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
        }} onDragLeave={() => setDragOver(false)} onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer?.files[0];
            if (file)
                handleFile(file);
        }}>
      <Show when={preview()} fallback={<div class="upload-placeholder">
            <span class="upload-icon">🖼️</span>
            <p>Drag &amp; drop an image here</p>
          </div>}>
        {(previewUrl) => (<img src={previewUrl()} class="upload-preview" alt="Preview"/>)}
      </Show>
      <label class="btn-secondary upload-btn">
        {preview() ? "🔄 Change file" : "📂 Choose file"}
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file)
                handleFile(file);
        }}/>
      </label>
    </div>);
}
