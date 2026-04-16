import { For } from 'solid-js';
import './DrawingToolbar.css';

const COLORS = [
    '#1a1a1a',
    '#ffffff',
    '#ef4444',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
];

interface DrawingToolbarProps {
    color: string;
    brushSize: number;
    onColorChange: (color: string) => void;
    onBrushSizeChange: (size: number) => void;
    onClear: () => void;
}

export function DrawingToolbar(props: DrawingToolbarProps) {
    return (
        <div class="drawing-toolbar">
            <div class="color-palette">
                <For each={COLORS}>
                    {(c) => (
                        <button
                            type="button"
                            class="color-swatch"
                            classList={{ active: props.color === c }}
                            style={{ background: c }}
                            onClick={() => props.onColorChange(c)}
                            title={c}
                        />
                    )}
                </For>
            </div>
            <div class="brush-size-control">
                <span>Size: {props.brushSize}</span>
                <input
                    type="range"
                    min="1"
                    max="24"
                    value={props.brushSize}
                    onInput={(e) => props.onBrushSizeChange(Number(e.currentTarget.value))}
                />
            </div>
            <button type="button" class="btn-secondary" onClick={props.onClear}>
                🗑️ Clear
            </button>
        </div>
    );
}
