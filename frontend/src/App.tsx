import { Match, Show, Switch } from 'solid-js';
import { AppHeader } from './components/AppHeader';
import { AlreadySubmitted } from './components/submission/AlreadySubmitted';
import { ImageInput } from './components/submission/ImageInput';
import { MoodSelector } from './components/submission/MoodSelector';
import { NameStep } from './components/submission/NameStep';
import { SuccessScreen } from './components/submission/SuccessScreen';
import { useSubmissionFlow } from './useSubmissionFlow';
import './App.css';

export function App() {
    const {
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
    } = useSubmissionFlow();

    return (
        <div class="app-container">
            <AppHeader
                name={name()}
                step={step()}
                onChangeName={() => setStep('name')}
                onEditMood={handleEditStart}
                showEditMood={!!todayEntry() && step() !== 'mood' && step() !== 'image'}
            />

            <main class="app-main">
                <div class="step-wrapper">
                    <Switch>
                        <Match when={step() === 'name'}>
                            <NameStep currentName={name()} onConfirm={handleNameConfirm} />
                        </Match>
                        <Match when={step() === 'checking'}>
                            <div class="step-container">
                                <p class="step-description">Loading…</p>
                            </div>
                        </Match>
                        <Match when={step() === 'already-submitted'}>
                            <Show when={todayEntry()}>
                                {(entry) => (
                                    <AlreadySubmitted
                                        name={name()}
                                        entry={entry()}
                                        onEdit={handleEditStart}
                                    />
                                )}
                            </Show>
                        </Match>
                        <Match when={step() === 'mood'}>
                            <MoodSelector onSelect={handleMoodSelect} currentMood={mood()} />
                        </Match>
                        <Match when={step() === 'image'}>
                            <ImageInput
                                onDone={handleImageDone}
                                submitting={submitting()}
                                error={error()}
                                onBack={() => setStep('mood')}
                            />
                        </Match>
                        <Match when={step() === 'success'}>
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
