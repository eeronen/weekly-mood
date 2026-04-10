import { createSignal, Show } from "solid-js";
import DrawingCanvas from "./DrawingCanvas";

interface ImageInputProps {
  onDone: (
    imageData: string | null,
    imageType: "drawing" | "upload" | null,
  ) => void;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
}

type Tab = "draw" | "upload" | "skip";

function resizeImage(
  dataUrl: string,
  maxW: number,
  maxH: number,
): Promise<string> {
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
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });
}

export default function ImageInput(props: ImageInputProps) {
  const [tab, setTab] = createSignal<Tab>("draw");
  const [drawingData, setDrawingData] = createSignal<string | null>(null);
  const [uploadData, setUploadData] = createSignal<string | null>(null);
  const [dragOver, setDragOver] = createSignal(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const resized = await resizeImage(dataUrl, 800, 800);
      setUploadData(resized);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (tab() === "draw") {
      props.onDone(drawingData(), "drawing");
    } else if (tab() === "upload") {
      props.onDone(uploadData(), "upload");
    } else {
      props.onDone(null, null);
    }
  };

  return (
    <div class="step-container">
      <h2>Add a picture</h2>
      <p class="step-description">
        Draw something or upload an image — or skip it entirely.
      </p>

      <div class="image-tabs">
        <button
          class="tab-btn"
          classList={{ active: tab() === "draw" }}
          onClick={() => setTab("draw")}
        >
          ✏️ Draw
        </button>
        <button
          class="tab-btn"
          classList={{ active: tab() === "upload" }}
          onClick={() => setTab("upload")}
        >
          📁 Upload
        </button>
        <button
          class="tab-btn"
          classList={{ active: tab() === "skip" }}
          onClick={() => setTab("skip")}
        >
          ⏭️ Skip
        </button>
      </div>

      <Show when={tab() === "draw"}>
        <DrawingCanvas onImageChange={setDrawingData} />
      </Show>

      <Show when={tab() === "upload"}>
        <div
          class="upload-area"
          classList={{ "drag-over": dragOver() }}
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
          <Show when={uploadData()}>
            <img src={uploadData()!} class="upload-preview" alt="Preview" />
          </Show>
          <Show when={!uploadData()}>
            <div class="upload-placeholder">
              <span class="upload-icon">🖼️</span>
              <p>Drag &amp; drop an image here</p>
            </div>
          </Show>
          <label class="btn-secondary upload-btn">
            {uploadData() ? "🔄 Change file" : "📂 Choose file"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      </Show>

      <Show when={tab() === "skip"}>
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
          class="btn-secondary"
          onClick={props.onBack}
          disabled={props.submitting}
        >
          ← Back
        </button>
        <button
          class="btn-primary"
          onClick={handleSubmit}
          disabled={props.submitting}
        >
          {props.submitting ? "⏳ Submitting…" : "Submit Mood 🚀"}
        </button>
      </div>
    </div>
  );
}
