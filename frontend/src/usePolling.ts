import { createSignal, onCleanup, onMount } from "solid-js";

const MIN_INTERVAL = 5_000;
const MAX_INTERVAL = 60_000;
const STEP = 5_000;

export function createPolling(onPoll: () => Promise<boolean | void>) {
  const [interval, setInterval_] = createSignal(MIN_INTERVAL);
  let timer: ReturnType<typeof setTimeout> | null = null;
  let visible = !document.hidden;

  const schedule = () => {
    if (timer) clearTimeout(timer);
    if (!visible) return;
    timer = setTimeout(async () => {
      try {
        const changed = await onPoll();
        if (changed) {
          setInterval_(MIN_INTERVAL);
        } else {
          setInterval_((prev) => Math.min(prev + STEP, MAX_INTERVAL));
        }
      } catch {
        // on error, back off
        setInterval_((prev) => Math.min(prev + STEP, MAX_INTERVAL));
      }
      schedule();
    }, interval());
  };

  const onVisibility = () => {
    visible = !document.hidden;
    if (visible) {
      setInterval_(MIN_INTERVAL);
      schedule();
    } else if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  onMount(() => {
    document.addEventListener("visibilitychange", onVisibility);
    schedule();
  });

  onCleanup(() => {
    document.removeEventListener("visibilitychange", onVisibility);
    if (timer) clearTimeout(timer);
  });

  return {
    resetInterval: () => {
      setInterval_(MIN_INTERVAL);
      schedule();
    },
  };
}
