import { createSignal, Match, onMount, Show, Switch } from "solid-js";
import { getMoodsByUser, submitMood, updateMood } from "./api";
import { ImageInput } from "./components/ImageInput";
import { MoodSelector } from "./components/MoodSelector";
import { NameStep } from "./components/NameStep";
import { SuccessScreen } from "./components/SuccessScreen";
import type { MoodEntry, MoodLevel } from "./types";
import { MOOD_COLORS, MOOD_EMOJIS, MOOD_LABELS } from "./types";

type Step =
  | "name"
  | "checking"
  | "mood"
  | "image"
  | "success"
  | "already-submitted";

export function App() {
  const savedName = localStorage.getItem("sprintMoodName") ?? "";
  const [step, setStep] = createSignal<Step>(savedName ? "checking" : "name");
  const [name, setName] = createSignal(savedName);
  const [mood, setMood] = createSignal<MoodLevel | null>(null);
  const [imageData, setImageData] = createSignal<string | null>(null);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [todayEntry, setTodayEntry] = createSignal<MoodEntry | null>(null);
  const [editingId, setEditingId] = createSignal<number | null>(null);

  const isToday = (dateStr: string): boolean => {
    const today = new Date().toISOString().slice(0, 10);
    return dateStr.slice(0, 10) === today;
  };

  const checkForTodayEntry = async (
    userName: string,
  ): Promise<MoodEntry | null> => {
    try {
      const result = await getMoodsByUser(userName);
      if (result.success && result.data) {
        return (
          result.data.find((e) => e.created_at && isToday(e.created_at)) ?? null
        );
      }
    } catch {
      // ignore errors, proceed as no entry
    }
    return null;
  };

  onMount(async () => {
    if (savedName) {
      const entry = await checkForTodayEntry(savedName);
      if (entry) {
        setTodayEntry(entry);
        const autoEdit = new URLSearchParams(window.location.search).get('edit') === '1';
        if (autoEdit) {
          setEditingId(entry.id ?? null);
          setMood(entry.mood);
          setStep('mood');
          // Clean up the query param without reloading
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          setStep('already-submitted');
        }
      } else {
        setStep('mood');
      }
    }
  });

  const handleNameConfirm = async (newName: string) => {
    localStorage.setItem("sprintMoodName", newName);
    setName(newName);
    setStep("checking");
    const entry = await checkForTodayEntry(newName);
    if (entry) {
      setTodayEntry(entry);
      setStep("already-submitted");
    } else {
      setTodayEntry(null);
      setStep("mood");
    }
  };

  const handleMoodSelect = (selectedMood: MoodLevel) => {
    setMood(selectedMood);
    setStep("image");
  };

  const handleEditStart = () => {
    const entry = todayEntry();
    if (entry?.id) {
      setEditingId(entry.id);
      setMood(entry.mood);
    }
    setStep("mood");
  };

  const handleImageDone = async (
    data: string | null,
    type: "drawing" | "upload" | null,
  ) => {
    const currentMood = mood();
    if (!currentMood) {
      return;
    }
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
        const updatedEntry: MoodEntry = {
          id: id ?? result.id,
          name: name(),
          mood: currentMood,
          image_data: data,
          image_type: type,
          created_at: todayEntry()?.created_at ?? new Date().toISOString(),
        };
        setTodayEntry(updatedEntry);
        setImageData(data);
        setEditingId(null);
        setStep("success");
      } else {
        setError(result.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setError("Failed to connect to server. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setMood(null);
    setImageData(null);
    setError(null);
    if (todayEntry()) {
      setStep("already-submitted");
    } else {
      setStep("mood");
    }
  };

  return (
    <div class="app-container">
      <header class="app-header">
        <a href="/" class="app-title">
          <span class="app-logo">🎯</span>
          <h1>Sprint Mood</h1>
        </a>
        <div class="header-actions">
          <Show when={name() && step() !== "name"}>
            <div class="current-user">
              <span class="user-avatar">👤</span>
              <span class="user-name">{name()}</span>
              <button
                type="button"
                class="btn-link"
                onClick={() => setStep("name")}
              >
                Change
              </button>
            </div>
          </Show>
          <Show when={todayEntry() && step() !== 'mood' && step() !== 'image'}>
            <button type="button" class="btn-link" onClick={handleEditStart}>
              ✏️ Edit mood
            </button>
          </Show>
          <a href="/display" class="btn-link display-link">
            View All →
          </a>
          <a
            href="https://github.com/eeronen/weekly-mood/issues/new"
            class="btn-link display-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            🐛 Report Issue
          </a>
        </div>
      </header>

      <main class="app-main">
        <div class="step-wrapper">
          <Switch>
            <Match when={step() === "name"}>
              <NameStep currentName={name()} onConfirm={handleNameConfirm} />
            </Match>
            <Match when={step() === "checking"}>
              <div class="step-container">
                <p class="step-description">Loading…</p>
              </div>
            </Match>
            <Match when={step() === "already-submitted"}>
              <Show when={todayEntry()}>
                {(entry) => (
                  <div class="step-container">
                    <div class="success-icon">✅</div>
                    <h2>Already submitted today</h2>
                    <p class="step-description">
                      You've already submitted your mood for today, {name()}.
                    </p>
                    <div
                      class="success-card"
                      style={{ "--mood-color": MOOD_COLORS[entry().mood] }}
                    >
                      <span class="mood-emoji large">
                        {MOOD_EMOJIS[entry().mood]}
                      </span>
                      <div class="success-mood-info">
                        <span class="success-mood-number">
                          {entry().mood}/5
                        </span>
                        <span class="success-mood-label">
                          {MOOD_LABELS[entry().mood]}
                        </span>
                      </div>
                      <Show when={entry().image_data}>
                        {(imgData) => (
                          <img
                            src={imgData()}
                            alt="Your submitted mood"
                            class="success-image"
                          />
                        )}
                      </Show>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        "flex-wrap": "wrap",
                        "justify-content": "center",
                      }}
                    >
                      <button
                        type="button"
                        class="btn-primary"
                        onClick={handleEditStart}
                      >
                        ✏️ Edit entry
                      </button>
                      <a
                        href="/display"
                        class="btn-secondary"
                        style={{ "text-decoration": "none" }}
                      >
                        View all moods →
                      </a>
                    </div>
                  </div>
                )}
              </Show>
            </Match>
            <Match when={step() === "mood"}>
              <MoodSelector onSelect={handleMoodSelect} currentMood={mood()} />
            </Match>
            <Match when={step() === "image"}>
              <ImageInput
                onDone={handleImageDone}
                submitting={submitting()}
                error={error()}
                onBack={() => setStep("mood")}
              />
            </Match>
            <Match when={step() === "success"}>
              <Show when={mood()}>
                {(currentMood) => (
                  <SuccessScreen
                    name={name()}
                    mood={currentMood()}
                    imageData={imageData()}
                    onNext={handleEditStart}
                  />
                )}
              </Show>
            </Match>
          </Switch>
        </div>
      </main>
    </div>
  );
}
