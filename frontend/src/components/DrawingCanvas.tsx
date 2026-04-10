import { createSignal, onMount, onCleanup, For } from "solid-js";

interface DrawingCanvasProps {
  onImageChange: (dataUrl: string) => void;
}

const COLORS = [
  "#1a1a1a",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function DrawingCanvas(props: DrawingCanvasProps) {
  let canvasRef!: HTMLCanvasElement;
  let containerRef!: HTMLDivElement;

  const [color, setColor] = createSignal("#1a1a1a");
  const [brushSize, setBrushSize] = createSignal(5);
  const [isDrawing, setIsDrawing] = createSignal(false);

  let lastX = 0;
  let lastY = 0;

  const getCtx = () => canvasRef.getContext("2d")!;

  const getPos = (clientX: number, clientY: number) => {
    const rect = canvasRef.getBoundingClientRect();
    const scaleX = canvasRef.width / rect.width;
    const scaleY = canvasRef.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (x: number, y: number) => {
    setIsDrawing(true);
    lastX = x;
    lastY = y;
  };

  const draw = (x: number, y: number) => {
    if (!isDrawing()) return;
    const ctx = getCtx();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color();
    ctx.lineWidth = brushSize();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastX = x;
    lastY = y;
    props.onImageChange(canvasRef.toDataURL("image/png"));
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    props.onImageChange(canvasRef.toDataURL("image/png"));
  };

  onMount(() => {
    const size = Math.min(containerRef.clientWidth, 480);
    canvasRef.width = size;
    canvasRef.height = size;
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);
    props.onImageChange(canvasRef.toDataURL("image/png"));

    const onMouseDown = (e: MouseEvent) => {
      const pos = getPos(e.clientX, e.clientY);
      startDrawing(pos.x, pos.y);
    };
    const onMouseMove = (e: MouseEvent) => {
      const pos = getPos(e.clientX, e.clientY);
      draw(pos.x, pos.y);
    };
    const onMouseUp = () => stopDrawing();

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const pos = getPos(t.clientX, t.clientY);
      startDrawing(pos.x, pos.y);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const pos = getPos(t.clientX, t.clientY);
      draw(pos.x, pos.y);
    };
    const onTouchEnd = () => stopDrawing();

    canvasRef.addEventListener("mousedown", onMouseDown);
    canvasRef.addEventListener("mousemove", onMouseMove);
    canvasRef.addEventListener("mouseup", onMouseUp);
    canvasRef.addEventListener("mouseleave", onMouseUp);
    canvasRef.addEventListener("touchstart", onTouchStart, { passive: false });
    canvasRef.addEventListener("touchmove", onTouchMove, { passive: false });
    canvasRef.addEventListener("touchend", onTouchEnd);

    onCleanup(() => {
      canvasRef.removeEventListener("mousedown", onMouseDown);
      canvasRef.removeEventListener("mousemove", onMouseMove);
      canvasRef.removeEventListener("mouseup", onMouseUp);
      canvasRef.removeEventListener("mouseleave", onMouseUp);
      canvasRef.removeEventListener("touchstart", onTouchStart);
      canvasRef.removeEventListener("touchmove", onTouchMove);
      canvasRef.removeEventListener("touchend", onTouchEnd);
    });
  });

  return (
    <div class="drawing-tool">
      <div class="drawing-toolbar">
        <div class="color-palette">
          <For each={COLORS}>
            {(c) => (
              <button
                class="color-swatch"
                classList={{ active: color() === c }}
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            )}
          </For>
        </div>
        <div class="brush-size-control">
          <span>Size: {brushSize()}</span>
          <input
            type="range"
            min="1"
            max="24"
            value={brushSize()}
            onInput={(e) => setBrushSize(Number(e.currentTarget.value))}
          />
        </div>
        <button class="btn-secondary" onClick={clear}>
          🗑️ Clear
        </button>
      </div>
      <div ref={containerRef!} class="canvas-container">
        <canvas ref={canvasRef!} class="drawing-canvas" />
      </div>
    </div>
  );
}
