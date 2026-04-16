import { onCleanup, onMount } from 'solid-js';

const MIN_INTERVAL = 5_000;
const MAX_INTERVAL = 60_000;
const STEP = 5_000;

export function createPolling(onPoll: () => Promise<boolean | void>) {
    let interval = MIN_INTERVAL;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
        if (timer) clearTimeout(timer);
        if (document.hidden) return;
        timer = setTimeout(async () => {
            try {
                const changed = await onPoll();
                interval = changed ? MIN_INTERVAL : Math.min(interval + STEP, MAX_INTERVAL);
            } catch {
                interval = Math.min(interval + STEP, MAX_INTERVAL);
            }
            schedule();
        }, interval);
    };

    const onVisibility = () => {
        if (document.hidden) {
            if (timer) clearTimeout(timer);
            timer = null;
        } else {
            interval = MIN_INTERVAL;
            onPoll().catch(() => {}).finally(() => schedule());
        }
    };

    onMount(() => {
        document.addEventListener('visibilitychange', onVisibility);
        schedule();
    });

    onCleanup(() => {
        document.removeEventListener('visibilitychange', onVisibility);
        if (timer) clearTimeout(timer);
    });
}
