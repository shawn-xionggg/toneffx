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

  const [suggestions, setSuggestions] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [gt10Settings, setGt10Settings] = useState({
  preamp: {
    model: "T-AMP LEAD",
    gain: 50,
    bass: 50,
    mids: 50,
    treble: 50,
    presence: 50,
    level: 50,
  },

  distortion: {
    enabled: false,
    type: "OD-1",
    drive: 50,
    tone: 50,
    level: 50,
  },

  delay: {
    enabled: false,
    time: 400,
    feedback: 30,
    level: 30,
  },

  reverb: {
    enabled: false,
    level: 30,
  },
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
  function changePreampSetting(
    setting: keyof typeof gt10Settings.preamp,
    value: string | number
  ) {
    setGt10Settings((current) => ({
      ...current,
      preamp: {
        ...current.preamp,
        [setting]: value,
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


  function toggleDistortion() {
    setGt10Settings((current) => ({
      ...current,
      distortion: {
        ...current.distortion,
        enabled: !current.distortion.enabled,
      },
    }));
  }

  function toggleDelay() {
    setGt10Settings((current) => ({
      ...current,
      delay: {
        ...current.delay,
        enabled: !current.delay.enabled,
      },
    }));
  }

  function toggleReverb() {
    setGt10Settings((current) => ({
      ...current,
      reverb: {
        ...current.reverb,
        enabled: !current.reverb.enabled,
      },
    }));
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
      gt10_settings: gt10Settings,
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
        setGt10Settings(rig.gt10_settings);
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
        gt10Settings,
      })
    );

    try {
      const response = await fetch("http://localhost:8000/analyze-tone", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Tone analysis failed");
      }

      const result = await response.json();

      console.log("Backend result:", result);
      setSuggestions(result.suggestions ?? []);
    } catch (error) {
      console.error(error);

      setSuggestions([
        "Tone analysis is not connected yet.",
      ]);
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
                Teffx
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

          {/* Amp */}
          {/* BOSS GT-10 */}
          <section className="overflow-hidden rounded-[26px] border-4 border-neutral-600 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 p-5 text-neutral-950 shadow-2xl">
            {/* Top branding */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-black tracking-tight">
                  BOSS GT-10
                </h2>

                <span className="pb-1 text-xs font-bold uppercase tracking-wider">
                  Guitar Effects Processor
                </span>
              </div>

              <span className="rounded border border-neutral-700 bg-neutral-800 px-3 py-1 text-xs font-bold text-white">
                PROCESSOR
              </span>
            </div>

            {/* Main control area */}
            <div className="grid gap-5">
              {/* Left panel */}
              <div className="rounded-xl border border-neutral-700 bg-neutral-800/20 p-4">
                  

                {/* Amp model */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider">
                    Preamp Model
                  </label>

                  <select
                    value={gt10Settings.preamp.model}
                    onChange={(e) =>
                      changePreampSetting("model", e.target.value)
                    }
                    className="w-full rounded border-2 border-neutral-700 bg-neutral-950 px-4 py-3 font-mono text-sm text-cyan-300 outline-none"
                  >
                    <optgroup label="JC CLEAN">
                      <option>BOSS Clean</option>
                      <option>JC-120</option>
                      <option>Jazz Combo</option>
                      <option>Full Range</option>
                    </optgroup>

                    <optgroup label="TW CLEAN">
                      <option>Clean TWIN</option>
                      <option>Pro Crunch</option>
                      <option>Tweed</option>
                      <option>DELUX Crnch</option>
                    </optgroup>

                    <optgroup label="CRUNCH">
                      <option>BOSS Crunch</option>
                      <option>Blues</option>
                      <option>Wild Crunch</option>
                      <option>StackCrunch</option>
                    </optgroup>

                    <optgroup label="COMBO">
                      <option>VO Drive</option>
                      <option>VO Lead</option>
                      <option>VO Clean</option>
                    </optgroup>

                    <optgroup label="MATCH">
                      <option>MATCH Drive</option>
                      <option>Fat MATCH</option>
                      <option>MATCH Lead</option>
                    </optgroup>

                    <optgroup label="BG LEAD">
                      <option>BG Lead</option>
                      <option>BG Drive</option>
                      <option>BG Rhythm</option>
                    </optgroup>

                    <optgroup label="MS CLASSIC">
                      <option>MS1959 I</option>
                      <option>MS1959 I+II</option>
                    </optgroup>

                    <optgroup label="MS MODERN">
                      <option>MS HiGain</option>
                      <option>MS Scoop</option>
                    </optgroup>

                    <optgroup label="R-FIER">
                      <option>R-FIER Vnt</option>
                      <option>R-FIER Mdn</option>
                      <option>R-FIER Cln</option>
                    </optgroup>

                    <optgroup label="T-AMP">
                      <option>T-AMP Lead</option>
                      <option>T-AMP Crnch</option>
                      <option>T-AMP Clean</option>
                    </optgroup>

                    <optgroup label="HI-GAIN">
                      <option>BOSS Drive</option>
                      <option>SLDN</option>
                      <option>Lead Stack</option>
                      <option>Heavy Lead</option>
                    </optgroup>

                    <optgroup label="METAL">
                      <option>BOSS Metal</option>
                      <option>5150 Drive</option>
                      <option>Metal Lead</option>
                      <option>Edge Lead</option>
                    </optgroup>

                    <optgroup label="OTHER">
                      <option>Custom</option>
                      <option>Through</option>
                    </optgroup>
                  </select>
                </div>

                {/* Preamp knobs */}
                <div className="mt-7 flex flex-wrap justify-center gap-6">
                  <Knob
                    label="Gain"
                    value={gt10Settings.preamp.gain}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      changePreampSetting("gain", value)
                    }
                  />

                  <Knob
                    label="Bass"
                    value={gt10Settings.preamp.bass}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      changePreampSetting("bass", value)
                    }
                  />

                  <Knob
                    label="Middle"
                    value={gt10Settings.preamp.mids}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      changePreampSetting("mids", value)
                    }
                  />

                  <Knob
                    label="Treble"
                    value={gt10Settings.preamp.treble}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      changePreampSetting("treble", value)
                    }
                  />

                  <Knob
                    label="Presence"
                    value={gt10Settings.preamp.presence}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      changePreampSetting("presence", value)
                    }
                  />

                  <Knob
                    label="Level"
                    value={gt10Settings.preamp.level}
                    max={100}
                    step={1}
                    onChange={(value) =>
                      changePreampSetting("level", value)
                    }
                  />
                </div>
              </div>

            </div>

            {/* Effect buttons */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={toggleDistortion}
                className={`rounded-lg border px-4 py-2 text-xs font-black transition ${
                  gt10Settings.distortion.enabled
                    ? "border-red-500 bg-red-500/20 text-red-700"
                    : "border-neutral-700 bg-neutral-800 text-neutral-300"
                }`}
              >
                OD / DISTORTION
                <span className="ml-2">
                  {gt10Settings.distortion.enabled ? "ON" : "OFF"}
                </span>
              </button>

              <button
                onClick={toggleDelay}
                className={`rounded-lg border px-4 py-2 text-xs font-black transition ${
                  gt10Settings.delay.enabled
                    ? "border-red-500 bg-red-500/20 text-red-700"
                    : "border-neutral-700 bg-neutral-800 text-neutral-300"
                }`}
              >
                DELAY
                <span className="ml-2">
                  {gt10Settings.delay.enabled ? "ON" : "OFF"}
                </span>
              </button>

              <button
                onClick={toggleReverb}
                className={`rounded-lg border px-4 py-2 text-xs font-black transition ${
                  gt10Settings.reverb.enabled
                    ? "border-red-500 bg-red-500/20 text-red-700"
                    : "border-neutral-700 bg-neutral-800 text-neutral-300"
                }`}
              >
                REVERB
                <span className="ml-2">
                  {gt10Settings.reverb.enabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>
            {/* Metal divider */}
            <div className="my-5 h-5 rounded border border-neutral-700 bg-gradient-to-b from-neutral-200 via-neutral-400 to-neutral-600 shadow-md" />
          </section>



          {/* Current configuration */}
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Current configuration
            </p>

            <div className="mt-5 grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-neutral-500">Pickup</p>
                <p className="mt-1 font-medium">{pickup}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Amplifier</p>
                <p className="mt-1 font-medium">BOSS GT-10</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500">Amp EQ</p>
                <p className="mt-1 font-medium">
                  B {gt10Settings.preamp.bass} · M {gt10Settings.preamp.mids} · T{" "}
                  {gt10Settings.preamp.treble}
                </p>
              </div>
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

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950 p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Suggested adjustments
            </p>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}