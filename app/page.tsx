"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
type KnobProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  step?: number;
};

function Knob({
  label,
  value,
  onChange,
  max = 10,
  step = 0.5,
}: KnobProps) {
  const rotation = -135 + (value / max) * 270;

  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    setDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;

    const distance = startY - e.clientY;

    // Larger GT-10 ranges need to change faster than guitar knobs.
    const pixelsPerStep = max <= 10 ? 8 : 2;

    const stepsMoved = Math.round(distance / pixelsPerStep);

    const newValue = startValue + stepsMoved * step;

    onChange(Math.max(0, Math.min(max, newValue)));
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex h-20 w-20 touch-none cursor-ns-resize select-none items-center justify-center rounded-full border-4 border-neutral-950 bg-gradient-to-br from-neutral-700 to-neutral-950 shadow-[inset_0_0_10px_rgba(255,255,255,0.15),0_5px_8px_rgba(0,0,0,0.6)]"
      >
        <div
          className="absolute h-7 w-1 origin-bottom rounded-full bg-neutral-200"
          style={{
            transform: `translateY(-14px) rotate(${rotation}deg)`,
          }}
        />

        <span className="mt-9 text-[10px] font-bold text-white">
          {value}
        </span>
      </div>

      <span className="text-xs font-bold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
const supabase = createClient();

export default function Home() {;
  const [previousAttempt, setPreviousAttempt] = useState<AnalysisAttempt | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [loadingRig, setLoadingRig] = useState(true);
  const router = useRouter();

  const [pickup, setPickup] = useState("Bridge");

  const [showTopBar, setShowTopBar] = useState(true);
  const lastScrollY = useRef(0);

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [referenceAudio, setReferenceAudio] = useState<File | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordedAudioName, setRecordedAudioName] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  type Suggestion = {
    control: string;
    current: number;
    suggested: number;
    direction: string;
    difference: number;
  };

  type AnalysisAttempt = {
    rigControls: Record<
      string,
      {
        enabled: boolean;
        value: number;
      }
    >;

    errors: Record<string, number>;
  };
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [toneCloseness, setToneCloseness] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [analysisError, setAnalysisError] = useState("");
  const [rigControls, setRigControls] = useState({
    gain: { enabled: true, value: 50 },
    bass: { enabled: true, value: 50 },
    mids: { enabled: true, value: 50 },
    treble: { enabled: true, value: 50 },
    presence: { enabled: false, value: 50 },
    level: { enabled: false, value: 50 },
    drive: { enabled: false, value: 50 },
    tone: { enabled: false, value: 50 },
    reverb: { enabled: false, value: 30 },
    delay: { enabled: false, value: 30 },
    feedback: { enabled: false, value: 30 },
  });

  const [guitarControls, setGuitarControls] = useState({

    tone1: {
      enabled: true,
      value: 10,
    },
    tone2: {
      enabled: false,
      value: 10,
    },
  });

  function toggleRigControl(
    control: keyof typeof rigControls
  ) {
    setRigControls((current) => ({
      ...current,
      [control]: {
        ...current[control],
        enabled: !current[control].enabled,
      },
    }));
  }

  function changeRigControl(
    control: keyof typeof rigControls,
    value: number
  ) {
    setRigControls((current) => ({
      ...current,
      [control]: {
        ...current[control],
        value,
      },
    }));
  }
  function handleReferenceUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setReferenceAudio(file);
    setSuggestions([]);

    // New target = new feedback session
    setPreviousAttempt(null);
  }
  function handleRecordingUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setRecordedAudio(file);
    setRecordedAudioName(file.name);
    setSuggestions([]);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }





  async function saveRig() {
    setSaveStatus("saving");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("Not logged in");
      setSaveStatus("error");
      return;
    }

    const { error } = await supabase.from("rigs").insert({
      user_id: user.id,
      pickup,
      guitar_controls: guitarControls,
      gt10_settings: rigControls,
    });

    if (error) {
      console.log("Save failed:", error.message);
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saved");

    // Change back to normal after 2 seconds
    setTimeout(() => {
      setSaveStatus("idle");
    }, 2000);
  }
  useEffect(() => {
    async function loadUserAndRig() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoadingRig(false);
        return;
      }

      setAccountEmail(user.email ?? "");

      const { data: rig, error: rigError } = await supabase
        .from("rigs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (rigError) {
        console.log("Failed to load rig:", rigError.message);
        setLoadingRig(false);
        return;
      }

      if (rig) {
        setPickup(rig.pickup);
        setGuitarControls(rig.guitar_controls);
        setRigControls(rig.gt10_settings);
      }

      setLoadingRig(false);
    }

    loadUserAndRig();
  }, []);
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const recorder = new MediaRecorder(stream);

    recordedChunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: recorder.mimeType,
      });

      setRecordedAudio(blob);
      setRecordedAudioName("Recorded take");
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current = recorder;

    recorder.start();
    setIsRecording(true);
  }
  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      // Always show it when we're near the top of the page
      if (currentScrollY < 50) {
        setShowTopBar(true);
      }

      // Scrolling upward
      else if (currentScrollY < lastScrollY.current) {
        setShowTopBar(true);
      }

      // Scrolling downward
      else if (currentScrollY > lastScrollY.current) {
        setShowTopBar(false);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  async function handleLogout() {
    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      console.log("Logout failed:", error.message);
      return;
    }

    setAccountEmail("");
    router.push("/login");
  }
  async function analyzeTone() {
    setAnalysisError("");
    if (!referenceAudio || !recordedAudio) return;

    setIsAnalyzing(true);
    setSuggestions([]);

    const formData = new FormData();

    formData.append("reference", referenceAudio);
    formData.append(
      "recording",
      recordedAudio,
      "recording.webm"
    );

    formData.append(
      "rig",
      JSON.stringify({
        pickup,
        guitarControls,
        rigControls,
      })
    );
    if (previousAttempt) {
      formData.append(
        "previous_attempt",
        JSON.stringify(previousAttempt)
      );
    }
    try {
      const response = await fetch("http://localhost:8000/analyze-tone", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Tone analysis failed");
      }

      const result = await response.json();
      setToneCloseness(result.tone_closeness ?? null);
      console.log("Backend result:", result);

      setSuggestions(result.suggestions ?? []);

      if (result.attempt) {
        setPreviousAttempt(result.attempt);
      }
    } catch (error) {
      console.error(error);
      setSuggestions([]);
      setAnalysisError("Tone analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] px-6 pt-28 pb-10 text-white">
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#111111]/90 backdrop-blur-xl transition-transform duration-300 ${
          showTopBar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white font-bold text-black">
              T
            </div>

            <div>
              <p className="font-semibold leading-none text-white">
                Toneffx
              </p>

              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                Guitar Tone Matching
              </p>
            </div>
          </div>

          {/* Account */}
          {accountEmail ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-neutral-200">
                  {accountEmail.split("@")[0]}
                </p>

                <p className="text-xs text-neutral-500">
                  {accountEmail}
                </p>
              </div>

              {/* Account avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-sm font-semibold uppercase">
                {accountEmail.charAt(0)}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-400 transition hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
              >
                Log out
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Log in
            </button>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-neutral-500">
            Tone Finder
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Configure your rig
          </h1>

          <p className="mt-3 max-w-xl text-neutral-400">
            Enter the exact guitar and amplifier settings you are currently
            using.
          </p>
        </div>

        <div className="space-y-8">
          {/* Guitar */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Instrument
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Guitar</h2>
              </div>

            </div>

            {/* Pickup selector */}
            <div className="mb-10">
              <p className="mb-4 text-sm font-medium text-neutral-300">
                Pickup position
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "Bridge",
                  "Both",
                  "Neck",
                ].map((position) => (
                  <button
                    key={position}
                    onClick={() => setPickup(position)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      pickup === position
                        ? "border-white bg-white text-black"
                        : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-500"
                    }`}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>

            {/* Guitar knobs */}
            <div>
              <p className="mb-6 text-sm font-medium text-neutral-300">
                Guitar controls
              </p>
                <div className="mb-6 flex gap-3">
                  <button
                    onClick={() =>
                      setGuitarControls((current) => ({
                        ...current,
                        tone1: {
                          ...current.tone1,
                          enabled: !current.tone1.enabled,
                        },
                      }))
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                      guitarControls.tone1.enabled
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-neutral-700 bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    Tone 1 {guitarControls.tone1.enabled ? "ON" : "OFF"}
                  </button>

                  <button
                    onClick={() =>
                      setGuitarControls((current) => ({
                        ...current,
                        tone2: {
                          ...current.tone2,
                          enabled: !current.tone2.enabled,
                        },
                      }))
                    }
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                      guitarControls.tone2.enabled
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-neutral-700 bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    Tone 2 {guitarControls.tone2.enabled ? "ON" : "OFF"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-12">
                {guitarControls.tone1.enabled && (
                  <Knob
                    label="Tone 1"
                    value={guitarControls.tone1.value}
                    onChange={(value) =>
                      setGuitarControls((current) => ({
                        ...current,
                        tone1: {
                          ...current.tone1,
                          value,
                        },
                      }))
                    }
                  />
                )}

                {guitarControls.tone2.enabled && (
                  <Knob
                    label="Tone 2"
                    value={guitarControls.tone2.value}
                    onChange={(value) =>
                      setGuitarControls((current) => ({
                        ...current,
                        tone2: {
                          ...current.tone2,
                          value,
                        },
                      }))
                    }
                  />
                )}
              </div>

            </div>
          </section>

          {/* Adjustable rig controls */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Rig controls
              </p>

              <h2 className="mt-1 text-2xl font-semibold">
                What can you adjust?
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Enable the controls available on your rig. Tone Finder will only suggest
                changes to enabled controls.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(
                Object.entries(rigControls) as [
                  keyof typeof rigControls,
                  (typeof rigControls)[keyof typeof rigControls]
                ][]
              ).map(([name, control]) => {
                const label =
                  name === "mids"
                    ? "Middle"
                    : name === "treble"
                      ? "High Treble"
                      : name.charAt(0).toUpperCase() + name.slice(1);

                return (
                  <div
                    key={name}
                    className={`rounded-xl border p-5 transition ${
                      control.enabled
                        ? "border-neutral-600 bg-neutral-800"
                        : "border-neutral-800 bg-neutral-950/50"
                    }`}
                  >
                    {/* Control header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {label}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {control.enabled
                            ? "Available for suggestions"
                            : "Not available"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleRigControl(name)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          control.enabled
                            ? "border-white bg-white text-black"
                            : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500"
                        }`}
                      >
                        {control.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>

                    {/* Only show knob when enabled */}
                    {control.enabled && (
                      <div className="mt-7 flex justify-center">
                        <Knob
                          label={label}
                          value={control.value}
                          max={100}
                          step={1}
                          onChange={(value) =>
                            changeRigControl(name, value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>



          
          <button
            onClick={saveRig}
            disabled={saveStatus === "saving"}
            className={`rounded-lg px-6 py-3 font-semibold transition ${
              saveStatus === "saved"
                ? "bg-green-500 text-black"
                : saveStatus === "error"
                ? "bg-red-500 text-white"
                : "bg-white text-black hover:bg-neutral-200 active:scale-95"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
              ? "Saved ✓"
              : saveStatus === "error"
              ? "Save failed"
              : "Save Rig"}
          </button>
          
        </div>
      </div>
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Tone Matching
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            Match a reference tone
          </h2>

          <p className="mt-2 text-sm text-neutral-400">
            Upload the guitar tone you want, then record your current rig.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Reference */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="mb-1 font-semibold">
              Reference audio
            </p>

            <p className="mb-4 text-sm text-neutral-500">
              Upload the tone you want to match.
            </p>

            <label className="inline-flex cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200">
              Choose audio
              <input
                type="file"
                accept="audio/*"
                onChange={handleReferenceUpload}
                className="hidden"
              />
            </label>

            {referenceAudio && (
              <div className="mt-4">
                <p className="mb-2 truncate text-sm text-neutral-400">
                  {referenceAudio.name}
                </p>

                <audio
                  controls
                  src={URL.createObjectURL(referenceAudio)}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Your tone */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <p className="mb-1 font-semibold">
              Your tone
            </p>

            <p className="mb-5 text-sm text-neutral-500">
              Upload an existing guitar recording or record your current rig.
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Upload existing recording */}
              <label className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200">
                Upload recording

                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleRecordingUpload}
                  className="hidden"
                />
              </label>

              {/* Record new take */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
                >
                  Record now
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Stop recording
                </button>
              )}
            </div>

            {isRecording && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                Recording...
              </div>
            )}

            {recordedAudio && !isRecording && (
              <div className="mt-5">
                <p className="mb-2 truncate text-sm text-neutral-400">
                  {recordedAudioName}
                </p>

                <audio
                  controls
                  src={URL.createObjectURL(recordedAudio)}
                  className="w-full"
                />

                <button
                  onClick={() => {
                    setRecordedAudio(null);
                    setRecordedAudioName("");
                  }}
                  className="mt-3 text-xs text-neutral-500 hover:text-white"
                >
                  Remove recording
                </button>
              </div>
            )}
          </div>
        </div>    
        {/* Analyze */}
        <div className="mt-6 border-t border-neutral-800 pt-6">
          <button
            disabled={
              !referenceAudio ||
              !recordedAudio ||
              isAnalyzing
            }
            onClick={analyzeTone}
            className="rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Tone"}
          </button>

          {!referenceAudio && (
            <p className="mt-2 text-xs text-neutral-500">
              Upload reference audio first.
            </p>
          )}
        </div>
          {toneCloseness !== null && (
            <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Tone match
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-white">
                  {toneCloseness}
                </span>

                <span className="mb-1 text-lg text-neutral-500">
                  %
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${toneCloseness}%`,
                  }}
                />
              </div>
            </div>
          )}
        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Suggested adjustments
            </p>

            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.control}
                  className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {suggestion.control === "mids"
                        ? "Middle"
                        : suggestion.control}
                    </p>

                    <p className="mt-1 text-sm text-neutral-500">
                      {suggestion.direction}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {suggestion.current} → {suggestion.suggested}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      spectral difference {suggestion.difference.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {analysisError && (
          <p className="mt-4 text-sm text-red-400">
            {analysisError}
          </p>
        )}
      </section>
    </main>
  );
}