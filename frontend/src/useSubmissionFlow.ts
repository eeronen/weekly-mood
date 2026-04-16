import { createSignal, onMount } from 'solid-js';
import { getMoodsByUser, submitMood, updateMood } from './api';
import type { MoodEntry, MoodLevel } from './types';

export type Step = 'name' | 'checking' | 'mood' | 'image' | 'success' | 'already-submitted';

export function useSubmissionFlow() {
    const savedName = localStorage.getItem('sprintMoodName') ?? '';
    const [step, setStep] = createSignal<Step>(savedName ? 'checking' : 'name');
    const [name, setName] = createSignal(savedName);
    const [mood, setMood] = createSignal<MoodLevel | null>(null);
    const [imageData, setImageData] = createSignal<string | null>(null);
    const [submitting, setSubmitting] = createSignal(false);
    const [error, setError] = createSignal<string | null>(null);
    const [todayEntry, setTodayEntry] = createSignal<MoodEntry | null>(null);
    const [editingId, setEditingId] = createSignal<number | null>(null);

    const isToday = (dateStr: string) =>
        dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);

    const checkForTodayEntry = async (userName: string): Promise<MoodEntry | null> => {
        try {
            const result = await getMoodsByUser(userName);
            if (result.success && result.data) {
                return (
                    result.data.find((e: MoodEntry) => e.created_at && isToday(e.created_at)) ??
                    null
                );
            }
        } catch {
            // ignore errors, proceed as no entry
        }
        return null;
    };

    onMount(async () => {
        if (!savedName) return;
        const entry = await checkForTodayEntry(savedName);
        if (entry) {
            setTodayEntry(entry);
            const autoEdit = new URLSearchParams(window.location.search).get('edit') === '1';
            if (autoEdit) {
                setEditingId(entry.id ?? null);
                setMood(entry.mood);
                setStep('mood');
                window.history.replaceState(null, '', window.location.pathname);
            } else {
                setStep('already-submitted');
            }
        } else {
            setStep('mood');
        }
    });

    const handleNameConfirm = async (newName: string) => {
        localStorage.setItem('sprintMoodName', newName);
        setName(newName);
        setStep('checking');
        const entry = await checkForTodayEntry(newName);
        if (entry) {
            setTodayEntry(entry);
            setStep('already-submitted');
        } else {
            setTodayEntry(null);
            setStep('mood');
        }
    };

    const handleMoodSelect = (selectedMood: MoodLevel) => {
        setMood(selectedMood);
        setStep('image');
    };

    const handleEditStart = () => {
        const entry = todayEntry();
        if (entry?.id) {
            setEditingId(entry.id);
            setMood(entry.mood);
        }
        setStep('mood');
    };

    const handleImageDone = async (data: string | null, type: 'drawing' | 'upload' | null) => {
        const currentMood = mood();
        if (!currentMood) return;
        setSubmitting(true);
        setError(null);
        try {
            const id = editingId();
            const result = id
                ? await updateMood(id, {
                      name: name(),
                      mood: currentMood,
                      image_data: data,
                      image_type: type,
                  })
                : await submitMood({
                      name: name(),
                      mood: currentMood,
                      image_data: data,
                      image_type: type,
                  });

            if (result.success) {
                setTodayEntry({
                    id: id ?? result.id,
                    name: name(),
                    mood: currentMood,
                    image_data: data,
                    image_type: type,
                    created_at: todayEntry()?.created_at ?? new Date().toISOString(),
                });
                setImageData(data);
                setEditingId(null);
                setStep('success');
            } else {
                setError(result.error ?? 'Submission failed. Please try again.');
            }
        } catch {
            setError('Failed to connect to server. Is the backend running?');
        } finally {
            setSubmitting(false);
        }
    };

    return {
        step,
        setStep,
        name,
        mood,
        imageData,
        submitting,
        error,
        todayEntry,
        handleNameConfirm,
        handleMoodSelect,
        handleEditStart,
        handleImageDone,
    };
}
