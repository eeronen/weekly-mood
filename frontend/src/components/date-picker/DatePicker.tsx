import {
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  type Component,
} from "solid-js";
import "./DatePicker.css";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  highlightedDates: string[];
  max?: string; // YYYY-MM-DD
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toYMD(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDisplay(d: string): string {
  const y = Number(d.slice(0, 4));
  const m = Number(d.slice(5, 7));
  const day = Number(d.slice(8));
  return `${MONTH_NAMES[m - 1]} ${day}, ${y}`;
}

interface DayCellProps {
  date: string;
  selected: string;
  today: string;
  max?: string;
  highlighted: Set<string>;
  onSelect: (date: string) => void;
}

const DayCell: Component<DayCellProps> = (props) => {
  const isFuture = () => !!(props.max && props.date > props.max);
  const isSelected = () => props.date === props.selected;
  const isToday = () => props.date === props.today;
  const hasEntry = () => props.highlighted.has(props.date);

  const cls = () =>
    [
      "dp-day",
      isSelected() && "dp-day--selected",
      isToday() && !isSelected() && "dp-day--today",
      hasEntry() && !isSelected() && "dp-day--has-entries",
      isFuture() && "dp-day--future",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <button
      type="button"
      class={cls()}
      disabled={isFuture()}
      onClick={() => props.onSelect(props.date)}
    >
      <span class="dp-day-num">{Number(props.date.slice(8))}</span>
      <Show when={hasEntry()}>
        <span class="dp-dot" />
      </Show>
    </button>
  );
};

export function DatePicker(props: Props) {
  const [open, setOpen] = createSignal(false);
  const [viewMonth, setViewMonth] = createSignal(props.value.slice(0, 7));

  const viewY = () => Number(viewMonth().slice(0, 4));
  const viewM = () => Number(viewMonth().slice(5, 7));

  const highlightSet = () => new Set(props.highlightedDates);

  const today = new Date().toISOString().split("T")[0];

  const days = (): (string | null)[] => {
    const y = viewY();
    const m = viewM();
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(y, m, 0).getDate();
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(toYMD(y, m, d));
    return cells;
  };

  const prevMonth = () => {
    const y = viewY();
    const m = viewM();
    setViewMonth(
      m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`,
    );
  };

  const nextMonth = () => {
    const y = viewY();
    const m = viewM();
    setViewMonth(
      m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`,
    );
  };

  const canGoNext = () => {
    const maxMonth = (props.max ?? "9999-12-31").slice(0, 7);
    return viewMonth() < maxMonth;
  };

  const handleSelect = (date: string) => {
    props.onChange(date);
    setOpen(false);
  };

  const toggle = () => {
    if (!open()) setViewMonth(props.value.slice(0, 7));
    setOpen((v) => !v);
  };

  let containerRef: HTMLDivElement | undefined;
  const handleOutside = (e: MouseEvent) => {
    if (containerRef && !containerRef.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  onMount(() => document.addEventListener("mousedown", handleOutside));
  onCleanup(() => document.removeEventListener("mousedown", handleOutside));

  return (
    <div class="date-picker" ref={containerRef}>
      <button type="button" class="date-picker-trigger" onClick={toggle}>
        <span class="date-picker-icon">📅</span>
        <span>{formatDisplay(props.value)}</span>
        <span class="date-picker-chevron">{open() ? "▲" : "▼"}</span>
      </button>

      <Show when={open()}>
        <div class="dp-popover">
          <div class="dp-header">
            <button type="button" class="dp-nav-btn" onClick={prevMonth}>
              ◀
            </button>
            <span class="dp-month-label">
              {MONTH_NAMES[viewM() - 1]} {viewY()}
            </span>
            <button
              type="button"
              class="dp-nav-btn"
              onClick={nextMonth}
              disabled={!canGoNext()}
            >
              ▶
            </button>
          </div>

          <div class="dp-grid">
            <For each={DAY_NAMES}>
              {(name) => <span class="dp-weekday">{name}</span>}
            </For>
            <For each={days()}>
              {(date) => (
                <Show when={date !== null} fallback={<span />}>
                  <DayCell
                    date={date as string}
                    selected={props.value}
                    today={today}
                    max={props.max}
                    highlighted={highlightSet()}
                    onSelect={handleSelect}
                  />
                </Show>
              )}
            </For>
          </div>

          <div class="dp-footer">
            <button
              type="button"
              class="dp-today-btn"
              onClick={() => {
                setViewMonth(today.slice(0, 7));
                handleSelect(today);
              }}
            >
              Today
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
