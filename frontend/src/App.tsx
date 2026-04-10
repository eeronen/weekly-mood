import { createSignal, Switch, Match, Show } from "solid-js";
import type { MoodLevel } from "./types";
import NameStep from "./components/NameStep";
import MoodSelector from "./components/MoodSelector";
import ImageInput from "./components/ImageInput";
import SuccessScreen from "./components/SuccessScreen";
import { submitMood } from "./api";

type Step = "name" | "mood" | "image" | "success";

export default function App() {
  const savedName = localStorage.getItem("sprintMoodName") ?? "";
  const [step, setStep] = createSignal<Step>(savedName ? "mood" : "name");
  const [name, setName] = createSignal(savedName);
  const [mood, setMood] = createSignal<MoodLevel | null>(null);
  const [imageData, setImageData] = createSignal<string | null>(null);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleNameConfirm = (newName: string) => {
    localStorage.setItem("sprintMoodName", newName);
    setName(newName);
    setStep("mood");
  };

  const handleMoodSelect = (selectedMood: MoodLevel) => {
    setMood(selectedMood);
    setStep("image");
  };

  const handleImageDone = async (
    data: string | null,
    type: "drawing" | "upload" | null,
  ) => {
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitMood({
        name: name(),
        mood: mood()!,
        image_data: data,
        image_type: type,
      });

      if (result.success) {
        setImageData(data);
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
    setStep("mood");
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
              <button class="btn-link" onClick={() => setStep("name")}>
                Change
              </button>
            </div>
          </Show>
          <a href="/display" class="btn-link display-link">
            View All →
          </a>
        </div>
      </header>

      <main class="app-main">
        <div class="step-wrapper">
          <Switch>
            <Match when={step() === "name"}>
              <NameStep currentName={name()} onConfirm={handleNameConfirm} />
            </Match>
            <Match when={step() === "mood"}>
              <MoodSelector onSelect={handleMoodSelect} />
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
              <SuccessScreen
                name={name()}
                mood={mood()!}
                imageData={imageData()}
                onNext={handleRestart}
              />
            </Match>
          </Switch>
        </div>
      </main>
    </div>
  );
}
