import { createSignal, onCleanup, onMount } from "solid-js";
import { DrawingToolbar } from "./DrawingToolbar";
import "./DrawingCanvas.css";

interface DrawingCanvasProps {
  onImageChange: (dataUrl: string) => void;
}

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

function createDrawingState(
  getCanvas: () => HTMLCanvasElement,
  onImageChange: (dataUrl: string) => void,
) {
  const [color, setColor] = createSignal("#1a1a1a");
  const [brushSize, setBrushSize] = createSignal(5);
  const [isDrawing, setIsDrawing] = createSignal(false);
  const [canUndo, setCanUndo] = createSignal(false);
  const [canRedo, setCanRedo] = createSignal(false);
  let lastX = 0;
  let lastY = 0;
  const history: ImageData[] = [];
  const redoStack: ImageData[] = [];

  // biome-ignore lint/style/noNonNullAssertion: getContext('2d') only returns null without canvas support, which this component requires
  const getCtx = () => getCanvas().getContext("2d")!;

  const saveSnapshot = () => {
    const canvas = getCanvas();
    history.push(getCtx().getImageData(0, 0, canvas.width, canvas.height));
    setCanUndo(true);
    redoStack.length = 0;
    setCanRedo(false);
  };

  const startDrawing = (x: number, y: number) => {
    saveSnapshot();
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
    saveSnapshot();
    const canvas = getCanvas();
    const ctx = getCtx();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onImageChange(canvas.toDataURL("image/png"));
  };

  const undo = () => {
    if (history.length === 0) return;
    const canvas = getCanvas();
    const ctx = getCtx();
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setCanRedo(true);
    // biome-ignore lint/style/noNonNullAssertion: guarded by length check above
    ctx.putImageData(history.pop()!, 0, 0);
    setCanUndo(history.length > 0);
    onImageChange(canvas.toDataURL("image/png"));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = getCanvas();
    const ctx = getCtx();
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setCanUndo(true);
    // biome-ignore lint/style/noNonNullAssertion: guarded by length check above
    ctx.putImageData(redoStack.pop()!, 0, 0);
    setCanRedo(redoStack.length > 0);
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
    undo,
    redo,
    canUndo,
    canRedo,
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
    undo,
    redo,
    canUndo,
    canRedo,
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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        e.ctrlKey &&
        (e.key === "y" || (e.key === "Z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    onCleanup(() => {
      canvasRef.removeEventListener("mousedown", onMouseDown);
      canvasRef.removeEventListener("mousemove", onMouseMove);
      canvasRef.removeEventListener("mouseup", onMouseUp);
      canvasRef.removeEventListener("mouseleave", onMouseUp);
      canvasRef.removeEventListener("touchstart", onTouchStart);
      canvasRef.removeEventListener("touchmove", onTouchMove);
      canvasRef.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
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
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />
      <div ref={containerRef} class="canvas-container">
        <canvas ref={canvasRef} class="drawing-canvas" />
      </div>
    </div>
  );
}
