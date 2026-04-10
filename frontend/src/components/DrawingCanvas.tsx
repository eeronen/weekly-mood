import { createSignal, onCleanup, onMount } from "solid-js";
import { DrawingToolbar } from "./DrawingToolbar";

interface DrawingCanvasProps {
  onImageChange: (dataUrl: string) => void;
}

/** Maps a client pointer position to canvas-local coordinates, accounting for CSS scaling. */
function getCanvasPos(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  };
}

/**
 * SolidJS reactive primitive that owns all drawing state and canvas operations.
 * The component only has to wire up DOM events and size the canvas.
 *
 * @param getCanvas - getter for the canvas ref (resolved after mount)
 * @param onImageChange - called with a new data URL after every paint operation
 */
function createDrawingState(
  getCanvas: () => HTMLCanvasElement,
  onImageChange: (dataUrl: string) => void,
) {
  const [color, setColor] = createSignal("#1a1a1a");
  const [brushSize, setBrushSize] = createSignal(5);
  const [isDrawing, setIsDrawing] = createSignal(false);
  let lastX = 0;
  let lastY = 0;

  // biome-ignore lint/style/noNonNullAssertion: getContext('2d') only returns null without canvas support, which this component requires
  const getCtx = () => getCanvas().getContext("2d")!;

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
    onImageChange(getCanvas().toDataURL("image/png"));
  };

  const stopDrawing = () => setIsDrawing(false);

  const clear = () => {
    const canvas = getCanvas();
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onImageChange(canvas.toDataURL("image/png"));
  };

  return {
    color,
    setColor,
    brushSize,
    setBrushSize,
    startDrawing,
    draw,
    stopDrawing,
    clear,
  };
}

export function DrawingCanvas(props: DrawingCanvasProps) {
  let canvasRef!: HTMLCanvasElement;
  let containerRef!: HTMLDivElement;

  const {
    color,
    setColor,
    brushSize,
    setBrushSize,
    startDrawing,
    draw,
    stopDrawing,
    clear,
  } = createDrawingState(() => canvasRef, props.onImageChange);

  onMount(() => {
    const size = Math.min(containerRef.clientWidth, 480);
    canvasRef.width = size;
    canvasRef.height = size;
    // biome-ignore lint/style/noNonNullAssertion: see createDrawingState
    const ctx = canvasRef.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    props.onImageChange(canvasRef.toDataURL("image/png"));

    const onMouseDown = (e: MouseEvent) => {
      const pos = getCanvasPos(canvasRef, e.clientX, e.clientY);
      startDrawing(pos.x, pos.y);
    };
    const onMouseMove = (e: MouseEvent) => {
      const pos = getCanvasPos(canvasRef, e.clientX, e.clientY);
      draw(pos.x, pos.y);
    };
    const onMouseUp = () => stopDrawing();

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const pos = getCanvasPos(canvasRef, t.clientX, t.clientY);
      startDrawing(pos.x, pos.y);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const pos = getCanvasPos(canvasRef, t.clientX, t.clientY);
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
      <DrawingToolbar
        color={color()}
        brushSize={brushSize()}
        onColorChange={setColor}
        onBrushSizeChange={setBrushSize}
        onClear={clear}
      />
      <div ref={containerRef} class="canvas-container">
        <canvas ref={canvasRef} class="drawing-canvas" />
      </div>
    </div>
  );
}
