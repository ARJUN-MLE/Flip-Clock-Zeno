"use client";

import { startTransition, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, Palette, Pause, Play, RotateCcw, Save, Settings2, Volume2, VolumeX, X } from "lucide-react";

type Mode = "live" | "stopwatch" | "timer";
type TimerType = "hms" | "minutes" | "seconds";
type FontStyle = "digital" | "lcd" | "terminal" | "clean" | "geometric" | "mono" | "retro" | "mechanical" | "elegant";
type LiveTimeFormat = "12" | "24";
type ClockSoundKind = "second" | "minute" | "hour";
type ClockSoundStyle = "classic" | "soft" | "crisp" | "heavy" | "metallic" | "rubber" | "spring" | "wooden" | "servo" | "relay";
type TimerAnimationStep = { id: number; groups: string[][]; durationMs: number };

type ThemePreset = {
  id: string;
  name: string;
  background: string;
  foreground: string;
  clock: string;
  card: string;
  accent: string;
  shadow: string;
  panel: string;
};

type CustomTheme = {
  fontColor: string;
  clockColor: string;
  cardColor: string;
  backgroundColor: string;
  accentColor: string;
};

type ThemeVars = {
  image: string;
  background: string;
  foreground: string;
  clock: string;
  card: string;
  accent: string;
  shadow: string;
  panel: string;
};

const THEMES: ThemePreset[] = [
  { id: "space", name: "Space", background: "#050816", foreground: "#dfe8ff", clock: "#f4f7ff", card: "#0e1835", accent: "#8ba7ff", shadow: "rgba(13,17,31,0.72)", panel: "#111a31" },
  { id: "nature", name: "Nature", background: "#091b15", foreground: "#edf5ed", clock: "#f5fbf5", card: "#0f2a24", accent: "#7fda9f", shadow: "rgba(9,23,18,0.7)", panel: "#12352f" },
  { id: "forest", name: "Forest", background: "#06130d", foreground: "#edf9f0", clock: "#f4fff8", card: "#112d1d", accent: "#99d4a7", shadow: "rgba(4,20,13,0.7)", panel: "#163a29" },
  { id: "ocean", name: "Ocean", background: "#031821", foreground: "#eaf8ff", clock: "#ebfbff", card: "#0f2d3f", accent: "#7dd8f5", shadow: "rgba(5,23,29,0.7)", panel: "#133c4b" },
  { id: "sunset", name: "Sunset", background: "#1b0c0f", foreground: "#fff2ee", clock: "#fff7f4", card: "#3b1a1e", accent: "#ff9f7f", shadow: "rgba(31,13,14,0.7)", panel: "#4d262d" },
  { id: "midnight", name: "Midnight", background: "#03070d", foreground: "#eef3ff", clock: "#f7f9ff", card: "#0d1525", accent: "#9ab6ff", shadow: "rgba(1,8,15,0.8)", panel: "#101d32" },
  { id: "desert", name: "Desert", background: "#1a1207", foreground: "#fff6e6", clock: "#fff5e8", card: "#382613", accent: "#f7c48c", shadow: "rgba(29,17,9,0.7)", panel: "#4c3320" },
  { id: "aurora", name: "Aurora", background: "#051510", foreground: "#e9fff8", clock: "#f2fff9", card: "#0d2a24", accent: "#8ef3d1", shadow: "rgba(4,21,17,0.7)", panel: "#123b30" },
  { id: "minimal", name: "Minimal", background: "#f3f2ee", foreground: "#1d1d1d", clock: "#171717", card: "#f8f5f0", accent: "#444444", shadow: "rgba(138,133,127,0.18)", panel: "#efeae3" },
];

const THEME_IMAGES: Record<string, string> = {
  space: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=85",
  nature: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1400&q=85",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85",
  ocean: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=85",
  sunset: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85",
  midnight: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=85",
  desert: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1400&q=85",
  aurora: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1400&q=85",
  minimal: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85",
};

const FONT_OPTIONS: { id: FontStyle; label: string; style: React.CSSProperties }[] = [
  { id: "digital", label: "Digital LCD", style: { fontFamily: '"Arial Black", sans-serif', letterSpacing: "0.08em" } },
  { id: "lcd", label: "Seven Segment", style: { fontFamily: '"Courier New", monospace', letterSpacing: "0.06em" } },
  { id: "terminal", label: "Terminal", style: { fontFamily: '"Lucida Console", monospace', letterSpacing: "0.08em" } },
  { id: "clean", label: "Clean Sans", style: { fontFamily: '"Segoe UI", sans-serif', letterSpacing: "0.04em" } },
  { id: "geometric", label: "Geometric", style: { fontFamily: '"Trebuchet MS", sans-serif', letterSpacing: "0.04em" } },
  { id: "mono", label: "Monospace", style: { fontFamily: '"SFMono-Regular", monospace', letterSpacing: "0.05em" } },
  { id: "retro", label: "Retro", style: { fontFamily: '"Verdana", sans-serif', letterSpacing: "0.07em" } },
  { id: "mechanical", label: "Mechanical", style: { fontFamily: '"Georgia", serif', letterSpacing: "0.06em" } },
  { id: "elegant", label: "Elegant", style: { fontFamily: '"Times New Roman", serif', letterSpacing: "0.04em" } },
];

const DEFAULT_CUSTOM_THEME: CustomTheme = {
  fontColor: "#edf5ff",
  clockColor: "#f4f7ff",
  cardColor: "#101a2d",
  backgroundColor: "#050816",
  accentColor: "#8ba7ff",
};

const subscribeToNothing = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

const pad2 = (value: number) => String(value).padStart(2, "0");

function getCurrentTimeParts(date: Date, format: LiveTimeFormat) {
  const hours = format === "12" ? date.getHours() % 12 || 12 : date.getHours();
  return {
    hours: pad2(hours),
    minutes: pad2(date.getMinutes()),
    seconds: pad2(date.getSeconds()),
  };
}

function getStopwatchParts(ms: number) {
  const total = Math.max(0, ms);
  const totalSeconds = Math.floor(total / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
  };
}

function getTimerInputTotal(type: TimerType, hours: number, minutes: number, seconds: number) {
  if (type === "hms") return (hours * 3600 + minutes * 60 + seconds) * 1000;
  return type === "minutes" ? minutes * 60 * 1000 : seconds * 1000;
}

function getTimerInputDisplayGroups(type: TimerType, hours: number, minutes: number, seconds: number) {
  const totalSeconds = Math.ceil(getTimerInputTotal(type, hours, minutes, seconds) / 1000);
  if (type === "minutes") return [[...String(Math.floor(totalSeconds / 60))], [...pad2(totalSeconds % 60)]];
  if (type === "seconds") return [[...String(totalSeconds)]];

  const displayHours = pad2(Math.floor(totalSeconds / 3600));
  const displayMinutes = pad2(Math.floor((totalSeconds % 3600) / 60));
  const displaySeconds = pad2(totalSeconds % 60);
  return [[displayHours[0], displayHours[1]], [displayMinutes[0], displayMinutes[1]], [displaySeconds[0], displaySeconds[1]]];
}

let clockAudioContext: AudioContext | null = null;
let clockNoiseBuffers: Map<number, AudioBuffer> | null = null;
let lastClockSoundAt = 0;

type ClockSoundProfile = { duration: number; cutoff: number; noiseGain: number; startFrequency: number; endFrequency: number; thunkGain: number };

const CLOCK_SOUND_STYLES: Record<ClockSoundStyle, { label: string; profiles: Record<ClockSoundKind, ClockSoundProfile> }> = {
  classic: {
    label: "Classic Flip",
    profiles: {
      second: { duration: 0.032, cutoff: 2100, noiseGain: 0.075, startFrequency: 185, endFrequency: 95, thunkGain: 0.035 },
      minute: { duration: 0.05, cutoff: 1500, noiseGain: 0.1, startFrequency: 135, endFrequency: 65, thunkGain: 0.05 },
      hour: { duration: 0.065, cutoff: 1050, noiseGain: 0.12, startFrequency: 95, endFrequency: 45, thunkGain: 0.065 },
    },
  },
  soft: {
    label: "Soft Plastic",
    profiles: {
      second: { duration: 0.04, cutoff: 1250, noiseGain: 0.045, startFrequency: 155, endFrequency: 90, thunkGain: 0.022 },
      minute: { duration: 0.055, cutoff: 1050, noiseGain: 0.06, startFrequency: 120, endFrequency: 58, thunkGain: 0.032 },
      hour: { duration: 0.07, cutoff: 850, noiseGain: 0.075, startFrequency: 85, endFrequency: 40, thunkGain: 0.042 },
    },
  },
  crisp: {
    label: "Crisp Snap",
    profiles: {
      second: { duration: 0.024, cutoff: 3200, noiseGain: 0.12, startFrequency: 285, endFrequency: 155, thunkGain: 0.045 },
      minute: { duration: 0.036, cutoff: 2700, noiseGain: 0.14, startFrequency: 220, endFrequency: 105, thunkGain: 0.06 },
      hour: { duration: 0.048, cutoff: 2200, noiseGain: 0.16, startFrequency: 160, endFrequency: 72, thunkGain: 0.075 },
    },
  },
  heavy: {
    label: "Heavy Mechanism",
    profiles: {
      second: { duration: 0.055, cutoff: 950, noiseGain: 0.095, startFrequency: 115, endFrequency: 48, thunkGain: 0.06 },
      minute: { duration: 0.07, cutoff: 780, noiseGain: 0.13, startFrequency: 88, endFrequency: 35, thunkGain: 0.085 },
      hour: { duration: 0.085, cutoff: 650, noiseGain: 0.16, startFrequency: 65, endFrequency: 28, thunkGain: 0.11 },
    },
  },
  metallic: {
    label: "Metallic Click",
    profiles: {
      second: { duration: 0.028, cutoff: 3800, noiseGain: 0.11, startFrequency: 520, endFrequency: 210, thunkGain: 0.04 },
      minute: { duration: 0.04, cutoff: 3300, noiseGain: 0.13, startFrequency: 410, endFrequency: 165, thunkGain: 0.055 },
      hour: { duration: 0.052, cutoff: 2900, noiseGain: 0.15, startFrequency: 320, endFrequency: 125, thunkGain: 0.07 },
    },
  },
  rubber: {
    label: "Rubber Pad",
    profiles: {
      second: { duration: 0.045, cutoff: 780, noiseGain: 0.05, startFrequency: 105, endFrequency: 60, thunkGain: 0.025 },
      minute: { duration: 0.06, cutoff: 680, noiseGain: 0.07, startFrequency: 82, endFrequency: 42, thunkGain: 0.038 },
      hour: { duration: 0.075, cutoff: 560, noiseGain: 0.085, startFrequency: 62, endFrequency: 30, thunkGain: 0.05 },
    },
  },
  spring: {
    label: "Spring Return",
    profiles: {
      second: { duration: 0.06, cutoff: 1800, noiseGain: 0.065, startFrequency: 310, endFrequency: 205, thunkGain: 0.035 },
      minute: { duration: 0.075, cutoff: 1550, noiseGain: 0.085, startFrequency: 250, endFrequency: 155, thunkGain: 0.048 },
      hour: { duration: 0.09, cutoff: 1300, noiseGain: 0.105, startFrequency: 195, endFrequency: 112, thunkGain: 0.062 },
    },
  },
  wooden: {
    label: "Wooden Clack",
    profiles: {
      second: { duration: 0.038, cutoff: 1450, noiseGain: 0.085, startFrequency: 170, endFrequency: 72, thunkGain: 0.052 },
      minute: { duration: 0.052, cutoff: 1180, noiseGain: 0.105, startFrequency: 128, endFrequency: 52, thunkGain: 0.07 },
      hour: { duration: 0.068, cutoff: 920, noiseGain: 0.125, startFrequency: 92, endFrequency: 36, thunkGain: 0.09 },
    },
  },
  servo: {
    label: "Servo Tick",
    profiles: {
      second: { duration: 0.05, cutoff: 2400, noiseGain: 0.055, startFrequency: 430, endFrequency: 175, thunkGain: 0.03 },
      minute: { duration: 0.065, cutoff: 2050, noiseGain: 0.075, startFrequency: 345, endFrequency: 128, thunkGain: 0.045 },
      hour: { duration: 0.08, cutoff: 1700, noiseGain: 0.095, startFrequency: 270, endFrequency: 92, thunkGain: 0.06 },
    },
  },
  relay: {
    label: "Vintage Relay",
    profiles: {
      second: { duration: 0.03, cutoff: 2600, noiseGain: 0.095, startFrequency: 245, endFrequency: 82, thunkGain: 0.055 },
      minute: { duration: 0.045, cutoff: 2200, noiseGain: 0.12, startFrequency: 185, endFrequency: 58, thunkGain: 0.075 },
      hour: { duration: 0.06, cutoff: 1800, noiseGain: 0.145, startFrequency: 135, endFrequency: 38, thunkGain: 0.095 },
    },
  },
};

function getClockAudioContext() {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!clockAudioContext || clockAudioContext.state === "closed") {
    clockAudioContext = new window.AudioContext();
    clockNoiseBuffers = new Map();
  }
  return clockAudioContext;
}

function primeClockSound() {
  const context = getClockAudioContext();
  if (context?.state === "suspended") void context.resume();
}

function playClockSound(kind: ClockSoundKind, style: ClockSoundStyle) {
  const context = clockAudioContext;
  if (!context || context.state !== "running" || context.currentTime - lastClockSoundAt < 0.08) return;

  const startAt = context.currentTime;
  const profile = CLOCK_SOUND_STYLES[style].profiles[kind];
  lastClockSoundAt = startAt;
  const bufferDuration = Math.max(0.07, profile.duration);
  if (!clockNoiseBuffers) clockNoiseBuffers = new Map();
  let noiseBuffer = clockNoiseBuffers.get(bufferDuration);
  if (!noiseBuffer) {
    const sampleCount = Math.floor(context.sampleRate * bufferDuration);
    noiseBuffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const samples = noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
    }
    clockNoiseBuffers.set(bufferDuration, noiseBuffer);
  }

  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const noiseGain = context.createGain();
  noise.buffer = noiseBuffer;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(profile.cutoff, startAt);
  noiseGain.gain.setValueAtTime(profile.noiseGain, startAt);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, startAt + profile.duration);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(context.destination);
  noise.onended = () => {
    noise.disconnect();
    filter.disconnect();
    noiseGain.disconnect();
  };
  noise.start(startAt);
  noise.stop(startAt + profile.duration);

  const thunk = context.createOscillator();
  const thunkGain = context.createGain();
  thunk.type = "triangle";
  thunk.frequency.setValueAtTime(profile.startFrequency, startAt);
  thunk.frequency.exponentialRampToValueAtTime(profile.endFrequency, startAt + profile.duration * 0.8);
  thunkGain.gain.setValueAtTime(profile.thunkGain, startAt);
  thunkGain.gain.exponentialRampToValueAtTime(0.001, startAt + profile.duration * 0.8);
  thunk.connect(thunkGain);
  thunkGain.connect(context.destination);
  thunk.onended = () => {
    thunk.disconnect();
    thunkGain.disconnect();
  };
  thunk.start(startAt);
  thunk.stop(startAt + profile.duration);
}

function closeClockSound() {
  if (!clockAudioContext) return;
  const context = clockAudioContext;
  clockAudioContext = null;
  clockNoiseBuffers = null;
  lastClockSoundAt = 0;
  void context.close();
}

function FlipDigit({ value, previousValue, isFlipping }: { value: string; previousValue: string; isFlipping: boolean }) {
  return (
    <div className={`flip-digit ${isFlipping ? "flipping" : ""}`} aria-live="off">
      <div className="digit-cube">
        <span className="digit-cube-face digit-cube-front">{previousValue}</span>
        <span className="digit-cube-face digit-cube-next">{value}</span>
      </div>
    </div>
  );
}

function ClockDisplay({
  groups,
  fontStyle,
  fontWeight,
  fontSize,
  letterSpacing,
  soundEnabled,
  clockSoundStyle,
  animationDurationMs,
  animationStepId,
  onAnimationComplete,
  restartOnDigitChange = false,
  className = "",
  showColons = true,
}: {
  groups: string[][];
  fontStyle: FontStyle;
  fontWeight: number;
  fontSize: number;
  letterSpacing: number;
  soundEnabled: boolean;
  clockSoundStyle: ClockSoundStyle;
  animationDurationMs?: number;
  animationStepId?: number;
  onAnimationComplete?: (stepId: number) => void;
  restartOnDigitChange?: boolean;
  className?: string;
  showColons?: boolean;
}) {
  const [previousGroups, setPreviousGroups] = useState<string[][]>(groups);
  const groupKey = groups.map((group) => group.join("")).join("|");
  const previousGroupKeyRef = useRef(groupKey);

  useEffect(() => {
    if (previousGroupKeyRef.current !== groupKey) {
      const previousGroups = previousGroupKeyRef.current.split("|");
      const currentGroups = groupKey.split("|");
      const changedGroupIndex = currentGroups.findIndex((group, index) => group !== previousGroups[index]);
      previousGroupKeyRef.current = groupKey;
      if (soundEnabled && changedGroupIndex >= 0) {
        const soundKind: ClockSoundKind = changedGroupIndex === 0 ? "hour" : changedGroupIndex === 1 ? "minute" : "second";
        playClockSound(soundKind, clockSoundStyle);
      }
    }
    const nextGroups = groupKey.split("|").map((group) => group.split(""));
    const timeoutId = window.setTimeout(() => {
      setPreviousGroups(nextGroups);
      if (animationStepId !== undefined) onAnimationComplete?.(animationStepId);
    }, animationDurationMs ?? 540);
    return () => window.clearTimeout(timeoutId);
  }, [animationDurationMs, animationStepId, clockSoundStyle, groupKey, onAnimationComplete, soundEnabled]);

  const fontStyleValue = FONT_OPTIONS.find((option) => option.id === fontStyle)?.style ?? {};
  const displayStyle = {
    fontSize: `min(${fontSize}px, 12cqi)`,
    letterSpacing: `${letterSpacing}px`,
    fontWeight,
    ...fontStyleValue,
    ...(animationDurationMs === undefined ? {} : { "--flip-duration": `${animationDurationMs}ms` }),
  } as React.CSSProperties;

  return (
    <div className={`clock-display ${className}`} style={displayStyle}>
      {groups.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="time-group">
          {group.map((digit, digitIndex) => {
            const previous = previousGroups[groupIndex]?.[digitIndex] ?? (restartOnDigitChange ? "0" : digit);
            const isFlipping = previous !== digit;
            return (
              <div key={`digit-${groupIndex}-${digitIndex}${restartOnDigitChange ? `-${digit}` : ""}`} className="digit-slot">
                <FlipDigit value={digit} previousValue={previous} isFlipping={isFlipping} />
              </div>
            );
          })}
          {showColons && groupIndex < groups.length - 1 && <span className="time-colon">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("live");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("midnight");
  const [liveTimeFormat, setLiveTimeFormat] = useState<LiveTimeFormat>("24");
  const [liveTimeFormatLoaded, setLiveTimeFormatLoaded] = useState(false);
  const [customTheme, setCustomTheme] = useState<CustomTheme>(DEFAULT_CUSTOM_THEME);
  const [fontStyle, setFontStyle] = useState<FontStyle>("digital");
  const [fontWeight, setFontWeight] = useState(700);
  const [fontSize, setFontSize] = useState(96);
  const [letterSpacing, setLetterSpacing] = useState(6);
  const [isSaved, setIsSaved] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [timerType, setTimerType] = useState<TimerType>("minutes");
  const [timerHoursInput, setTimerHoursInput] = useState(0);
  const [timerMinutesInput, setTimerMinutesInput] = useState(0);
  const [timerSecondsInput, setTimerSecondsInput] = useState(0);
  const [timerAnimationSteps, setTimerAnimationSteps] = useState<TimerAnimationStep[]>([]);
  const [timerRemainingMs, setTimerRemainingMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerComplete, setTimerComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [clockSoundStyle, setClockSoundStyle] = useState<ClockSoundStyle>("classic");
  const [clockSoundStyleLoaded, setClockSoundStyleLoaded] = useState(false);
  const mounted = useSyncExternalStore(subscribeToNothing, getClientMountedSnapshot, getServerMountedSnapshot);

  const timerEndRef = useRef<number | null>(null);
  const stopwatchStartRef = useRef<number | null>(null);
  const stopwatchFrameRef = useRef<number | null>(null);
  const timerFrameRef = useRef<number | null>(null);
  const stopwatchMsRef = useRef(stopwatchMs);
  const timerRemainingMsRef = useRef(timerRemainingMs);
  const timerAnimationStepIdRef = useRef(0);
  const lastTimerInputChangeAtRef = useRef<number | null>(null);
  const timerSpinnerActiveRef = useRef(false);
  const timerSpinnerFirstChangeRef = useRef(false);

  const completeTimerAnimationStep = useMemo(() => (id: number) => {
    setTimerAnimationSteps((steps) => steps[0]?.id === id ? steps.slice(1) : steps.filter((step) => step.id !== id));
  }, []);

  const resetTimer = useMemo(() => () => {
    const value = getTimerInputTotal(timerType, timerHoursInput, timerMinutesInput, timerSecondsInput);

    setTimerRemainingMs(value);
    setTimerComplete(false);
    timerEndRef.current = null;
    setTimerRunning(false);
  }, [timerType, timerHoursInput, timerMinutesInput, timerSecondsInput]);

  const queueTimerInputAnimation = (field: "hours" | "minutes" | "seconds", value: number, changeTime: number) => {
    const elapsed = lastTimerInputChangeAtRef.current === null ? 500 : changeTime - lastTimerInputChangeAtRef.current;
    lastTimerInputChangeAtRef.current = changeTime;
    const isFirstSpinnerChange = timerSpinnerActiveRef.current && timerSpinnerFirstChangeRef.current;
    const durationMs = isFirstSpinnerChange ? 140 : Math.max(24, Math.min(500, Math.round(elapsed * (timerSpinnerActiveRef.current ? 0.3 : 0.5))));
    if (isFirstSpinnerChange) timerSpinnerFirstChangeRef.current = false;
    const hours = field === "hours" ? value : timerHoursInput;
    const minutes = field === "minutes" ? value : timerMinutesInput;
    const seconds = field === "seconds" ? value : timerSecondsInput;
    const groups = getTimerInputDisplayGroups(timerType, hours, minutes, seconds);
    const id = timerAnimationStepIdRef.current + 1;
    timerAnimationStepIdRef.current = id;

    setTimerAnimationSteps((steps) => {
      const previousGroups = steps[steps.length - 1]?.groups ?? getTimerInputDisplayGroups(timerType, timerHoursInput, timerMinutesInput, timerSecondsInput);
      if (previousGroups.map((group) => group.join("")).join("|") === groups.map((group) => group.join("")).join("|")) return steps;
      return [...steps, { id, groups, durationMs }];
    });
  };

  const handleTimerSpinnerPointerDown = (event: React.PointerEvent<HTMLInputElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    timerSpinnerActiveRef.current = event.clientX >= bounds.right - 34;
    timerSpinnerFirstChangeRef.current = timerSpinnerActiveRef.current;
  };
  const handleTimerSpinnerPointerEnd = () => {
    timerSpinnerActiveRef.current = false;
    timerSpinnerFirstChangeRef.current = false;
  };
  const handleTimerSpinnerKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    timerSpinnerActiveRef.current = event.key === "ArrowUp" || event.key === "ArrowDown";
    timerSpinnerFirstChangeRef.current = timerSpinnerActiveRef.current;
  };
  const handleTimerSpinnerKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") handleTimerSpinnerPointerEnd();
  };

  useEffect(() => () => closeClockSound(), []);

  useEffect(() => {
    if (!mounted) return;
    const timerId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timerId);
  }, [mounted]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("zeno-selected-theme");
    const savedCustom = localStorage.getItem("zeno-custom-theme");
    const savedFont = localStorage.getItem("zeno-font");
    const savedSize = localStorage.getItem("zeno-font-size");
    const savedSpacing = localStorage.getItem("zeno-letter-spacing");
    const savedSound = localStorage.getItem("zeno-sound");
    const savedLiveTimeFormat = localStorage.getItem("zeno-live-time-format");
    const savedClockSoundStyle = localStorage.getItem("zeno-clock-sound-style");

    startTransition(() => {
      if (savedTheme) setSelectedTheme(savedTheme);
      if (savedCustom) setCustomTheme({ ...DEFAULT_CUSTOM_THEME, ...JSON.parse(savedCustom) });
      if (savedFont) setFontStyle(savedFont as FontStyle);
      if (savedSize) setFontSize(Number(savedSize));
      if (savedSpacing) setLetterSpacing(Number(savedSpacing));
      if (savedSound) setSoundEnabled(savedSound === "on");
      if (savedLiveTimeFormat === "12" || savedLiveTimeFormat === "24") setLiveTimeFormat(savedLiveTimeFormat);
      if (savedClockSoundStyle && Object.hasOwn(CLOCK_SOUND_STYLES, savedClockSoundStyle)) setClockSoundStyle(savedClockSoundStyle as ClockSoundStyle);
      setLiveTimeFormatLoaded(true);
      setClockSoundStyleLoaded(true);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("zeno-selected-theme", selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    localStorage.setItem("zeno-custom-theme", JSON.stringify(customTheme));
  }, [customTheme]);

  useEffect(() => {
    localStorage.setItem("zeno-font", fontStyle);
  }, [fontStyle]);

  useEffect(() => {
    localStorage.setItem("zeno-font-size", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("zeno-letter-spacing", String(letterSpacing));
  }, [letterSpacing]);

  useEffect(() => {
    if (!liveTimeFormatLoaded) return;
    localStorage.setItem("zeno-live-time-format", liveTimeFormat);
  }, [liveTimeFormat, liveTimeFormatLoaded]);

  useEffect(() => {
    if (!clockSoundStyleLoaded) return;
    localStorage.setItem("zeno-clock-sound-style", clockSoundStyle);
  }, [clockSoundStyle, clockSoundStyleLoaded]);

  useEffect(() => {
    stopwatchMsRef.current = stopwatchMs;
  }, [stopwatchMs]);

  useEffect(() => {
    timerRemainingMsRef.current = timerRemainingMs;
  }, [timerRemainingMs]);

  useEffect(() => {
    if (!stopwatchRunning) return;

    const tick = (timestamp: number) => {
      if (stopwatchStartRef.current === null) {
        stopwatchStartRef.current = timestamp - stopwatchMsRef.current;
      }
      const value = timestamp - stopwatchStartRef.current;
      setStopwatchMs(value);
      stopwatchFrameRef.current = window.requestAnimationFrame(tick);
    };

    stopwatchFrameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (stopwatchFrameRef.current !== null) window.cancelAnimationFrame(stopwatchFrameRef.current);
    };
  }, [stopwatchRunning]);

  useEffect(() => {
    if (!timerRunning) return;

    const tick = (timestamp: number) => {
      if (timerEndRef.current === null) {
        timerEndRef.current = timestamp + timerRemainingMsRef.current;
      }
      const remaining = Math.max(0, timerEndRef.current - timestamp);
      setTimerRemainingMs(remaining);

      if (remaining <= 0) {
        setTimerRunning(false);
        setTimerComplete(true);
        timerEndRef.current = null;
        return;
      }

      timerFrameRef.current = window.requestAnimationFrame(tick);
    };

    timerFrameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (timerFrameRef.current !== null) window.cancelAnimationFrame(timerFrameRef.current);
    };
  }, [timerRunning]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (inField) return;

      if (event.code === "Space" && mode === "stopwatch") {
        event.preventDefault();
        stopwatchStartRef.current = null;
        setStopwatchRunning((current) => !current);
      }

      if (event.key.toLowerCase() === "r") {
        if (mode === "stopwatch") {
          setStopwatchMs(0);
          setStopwatchRunning(false);
          stopwatchStartRef.current = null;
        }
        if (mode === "timer") resetTimer();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, resetTimer]);

  const themePreset = useMemo(() => {
    const preset = THEMES.find((item) => item.id === selectedTheme) ?? THEMES[5];
    return {
      ...preset,
      image: selectedTheme === "custom"
        ? "none"
        : `${selectedTheme === "minimal" ? "linear-gradient(rgba(248,246,240,0.26), rgba(248,246,240,0.52))" : "linear-gradient(rgba(2,8,15,0.24), rgba(2,8,15,0.56))"}, url("${THEME_IMAGES[preset.id]}")`,
      background: selectedTheme === "custom" ? customTheme.backgroundColor : preset.background,
      foreground: selectedTheme === "custom" ? customTheme.fontColor : preset.foreground,
      clock: selectedTheme === "custom" ? customTheme.clockColor : preset.clock,
      card: selectedTheme === "custom" ? customTheme.cardColor : preset.card,
      accent: selectedTheme === "custom" ? customTheme.accentColor : preset.accent,
      shadow: preset.shadow,
      panel: selectedTheme === "custom" ? customTheme.cardColor : preset.panel,
    } as ThemeVars;
  }, [selectedTheme, customTheme]);

  const liveGroups = useMemo(() => {
    const current = now ?? new Date();
    const parts = getCurrentTimeParts(current, liveTimeFormat);
    return [[parts.hours[0], parts.hours[1]], [parts.minutes[0], parts.minutes[1]], [parts.seconds[0], parts.seconds[1]]];
  }, [liveTimeFormat, now]);

  const stopwatchGroups = useMemo(() => {
    const parts = getStopwatchParts(stopwatchMs);
    return [[parts.hours[0], parts.hours[1]], [parts.minutes[0], parts.minutes[1]], [parts.seconds[0], parts.seconds[1]]];
  }, [stopwatchMs]);

  const timerGroups = useMemo(() => {
    const inputTotal = getTimerInputTotal(timerType, timerHoursInput, timerMinutesInput, timerSecondsInput);
    const displayMs = timerRunning || timerRemainingMs > 0 || timerComplete ? timerRemainingMs : inputTotal;
    const totalSeconds = Math.ceil(displayMs / 1000);
    if (timerType === "minutes") return [[...String(Math.floor(totalSeconds / 60))], [...pad2(totalSeconds % 60)]];
    if (timerType === "seconds") return [[...String(totalSeconds)]];

    const hours = pad2(Math.floor(totalSeconds / 3600));
    const minutes = pad2(Math.floor((totalSeconds % 3600) / 60));
    const seconds = pad2(totalSeconds % 60);
    return [[hours[0], hours[1]], [minutes[0], minutes[1]], [seconds[0], seconds[1]]];
  }, [timerComplete, timerHoursInput, timerMinutesInput, timerRemainingMs, timerRunning, timerSecondsInput, timerType]);

  const liveDate = useMemo(() => {
    const current = now ?? new Date();
    return {
      day: current.toLocaleDateString("en-US", { weekday: "long" }),
      date: current.getDate(),
      month: current.toLocaleDateString("en-US", { month: "long" }),
      period: current.getHours() < 12 ? "AM" : "PM",
    };
  }, [now]);

  const rootStyle = {
    "--bg": themePreset.background,
    "--fg": themePreset.foreground,
    "--clock": themePreset.clock,
    "--card": themePreset.card,
    "--accent": themePreset.accent,
    "--shadow": themePreset.shadow,
    "--panel": themePreset.panel,
    "--theme-image": themePreset.image,
  } as React.CSSProperties;

  const startPauseTimer = () => {
    const total = getTimerInputTotal(timerType, timerHoursInput, timerMinutesInput, timerSecondsInput);

    if (total <= 0) return;

    if (timerRunning) {
      setTimerRunning(false);
      if (timerEndRef.current !== null) {
        const remaining = Math.max(0, timerEndRef.current - performance.now());
        setTimerRemainingMs(remaining);
      }
      timerEndRef.current = null;
      return;
    }

    const next = timerRemainingMs > 0 ? timerRemainingMs : total;
    setTimerRemainingMs(next);
    setTimerComplete(false);
    timerEndRef.current = performance.now() + next;
    setTimerRunning(true);
  };

  const toggleStopwatch = () => {
    if (stopwatchRunning) {
      stopwatchStartRef.current = null;
      setStopwatchRunning(false);
      return;
    }
    setStopwatchRunning(true);
  };

  const toggleSound = () => {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    localStorage.setItem("zeno-sound", nextEnabled ? "on" : "off");
    if (nextEnabled) primeClockSound();
  };

  if (!mounted) {
    return (
      <div className="zeno-shell" style={rootStyle} onPointerDownCapture={() => { if (soundEnabled) primeClockSound(); }}>
        <div className="zeno-app"><div className="zeno-screen" /></div>
      </div>
    );
  }

  return (
    <div className="zeno-shell" style={rootStyle} onPointerDownCapture={() => { if (soundEnabled) primeClockSound(); }}>
      <div className="zeno-app">
        <div className="zeno-screen">
          <header className="zeno-header">
            <nav className="mode-navigation" aria-label="Clock modes">
              {(["live", "stopwatch", "timer"] as Mode[]).map((item) => (
                <button key={item} type="button" className={`mode-nav-item ${mode === item ? "active" : ""}`} aria-pressed={mode === item} onClick={() => setMode(item)}>
                  {item === "live" ? "Live Time" : item === "stopwatch" ? "Stopwatch" : "Timer"}
                </button>
              ))}
            </nav>
            {mode === "timer" && (
              <div className="timer-submode-navigation">
                <div className="timer-segments" role="tablist" aria-label="Timer type selector">
                  {(["hms", "minutes", "seconds"] as TimerType[]).map((type) => (
                    <button key={type} type="button" className={`timer-segment ${timerType === type ? "active" : ""}`} aria-pressed={timerType === type} onClick={() => { setTimerAnimationSteps([]); lastTimerInputChangeAtRef.current = null; timerSpinnerActiveRef.current = false; timerSpinnerFirstChangeRef.current = false; if (type === "hms") { setTimerHoursInput((value) => Math.min(value, 24)); setTimerMinutesInput((value) => Math.min(value, 59)); setTimerSecondsInput((value) => Math.min(value, 59)); } setTimerType(type); setTimerRemainingMs(0); setTimerComplete(false); timerEndRef.current = null; setTimerRunning(false); }}>
                      {type === "hms" ? "HMS" : type === "minutes" ? "Minutes" : "Seconds"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </header>

          <main className="zeno-main">
            {mode === "live" && (
              <div className="display-panel">
                <div className="live-date-wrap">
                  <div className="weekday-row">
                    <span className="date-label">{liveDate.day}</span>
                    <span className="period-indicator" aria-label={liveDate.period === "AM" ? "AM, morning" : "PM, evening"}>
                      {liveDate.period}
                    </span>
                  </div>
                  <span className="date-label subdued">{liveDate.date} {liveDate.month}</span>
                </div>
                <div className="clock-time">
                  <ClockDisplay groups={liveGroups} fontStyle={fontStyle} fontWeight={fontWeight} fontSize={fontSize} letterSpacing={letterSpacing} soundEnabled={soundEnabled} clockSoundStyle={clockSoundStyle} />
                </div>
              </div>
            )}

            {mode === "stopwatch" && (
              <div className="display-panel">
                <div className="clock-time">
                  <ClockDisplay groups={stopwatchGroups} fontStyle={fontStyle} fontWeight={fontWeight} fontSize={Math.min(fontSize, 82)} letterSpacing={Math.max(0, letterSpacing - 2)} soundEnabled={soundEnabled} clockSoundStyle={clockSoundStyle} />
                </div>
                <div className="control-row">
                  <button type="button" className="action-button primary" onClick={toggleStopwatch} aria-label={stopwatchRunning ? "Pause stopwatch" : "Start stopwatch"} title={stopwatchRunning ? "Pause" : "Start"}>
                    {stopwatchRunning ? <Pause size={20} strokeWidth={1.8} /> : <Play size={20} strokeWidth={1.8} />}
                  </button>
                  <button type="button" className="action-button" onClick={() => { setStopwatchMs(0); setStopwatchRunning(false); stopwatchStartRef.current = null; }} aria-label="Reset stopwatch" title="Reset">
                    <RotateCcw size={20} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            )}

            {mode === "timer" && (
              <div className="display-panel">
                <div className="timer-time-layout">
                  <div className="clock-time timer-clock-time">
                    <ClockDisplay groups={timerAnimationSteps[0]?.groups ?? timerGroups} fontStyle={fontStyle} fontWeight={fontWeight} fontSize={Math.min(fontSize + 4, 90)} letterSpacing={Math.max(0, letterSpacing - 2)} soundEnabled={soundEnabled} clockSoundStyle={clockSoundStyle} animationDurationMs={timerAnimationSteps[0]?.durationMs} animationStepId={timerAnimationSteps[0]?.id} onAnimationComplete={completeTimerAnimationStep} restartOnDigitChange className="timer-clock-display" />
                  </div>
                </div>

                {timerType === "hms" && (
                  <div className="timer-input-grid">
                    {[
                      { label: "Hours", field: "hours" as const, value: timerHoursInput, setValue: setTimerHoursInput, max: 24 },
                      { label: "Minutes", field: "minutes" as const, value: timerMinutesInput, setValue: setTimerMinutesInput, max: 59 },
                      { label: "Seconds", field: "seconds" as const, value: timerSecondsInput, setValue: setTimerSecondsInput, max: 59 },
                    ].map(({ label, field, value, setValue, max }) => (
                      <label key={label} className="timer-field">
                        <span>{label}</span>
                        <input type="number" min={0} max={max} step={1} value={value} onPointerDown={handleTimerSpinnerPointerDown} onPointerUp={handleTimerSpinnerPointerEnd} onPointerCancel={handleTimerSpinnerPointerEnd} onKeyDown={handleTimerSpinnerKeyDown} onKeyUp={handleTimerSpinnerKeyUp} onBlur={handleTimerSpinnerPointerEnd} onChange={(event) => {
                          const nextValue = Math.min(max, Math.max(0, Math.floor(Number(event.target.value) || 0)));
                          setValue(nextValue);
                          queueTimerInputAnimation(field, nextValue, event.timeStamp);
                          setTimerRemainingMs(0);
                          setTimerComplete(false);
                          timerEndRef.current = null;
                          setTimerRunning(false);
                        }} />
                      </label>
                    ))}
                  </div>
                )}

                {timerType === "minutes" && (
                  <div className="single-input-wrap">
                    <label className="timer-field">
                      <span>Minutes</span>
                      <input type="number" value={timerMinutesInput} onPointerDown={handleTimerSpinnerPointerDown} onPointerUp={handleTimerSpinnerPointerEnd} onPointerCancel={handleTimerSpinnerPointerEnd} onKeyDown={handleTimerSpinnerKeyDown} onKeyUp={handleTimerSpinnerKeyUp} onBlur={handleTimerSpinnerPointerEnd} onChange={(event) => {
                        const value = Math.max(0, Number(event.target.value) || 0);
                        setTimerMinutesInput(value);
                        queueTimerInputAnimation("minutes", value, event.timeStamp);
                        setTimerRemainingMs(0);
                        setTimerComplete(false);
                        timerEndRef.current = null;
                        setTimerRunning(false);
                      }} />
                    </label>
                  </div>
                )}

                {timerType === "seconds" && (
                  <div className="single-input-wrap">
                    <label className="timer-field">
                      <span>Seconds</span>
                      <input type="number" value={timerSecondsInput} onPointerDown={handleTimerSpinnerPointerDown} onPointerUp={handleTimerSpinnerPointerEnd} onPointerCancel={handleTimerSpinnerPointerEnd} onKeyDown={handleTimerSpinnerKeyDown} onKeyUp={handleTimerSpinnerKeyUp} onBlur={handleTimerSpinnerPointerEnd} onChange={(event) => {
                        const value = Math.max(0, Number(event.target.value) || 0);
                        setTimerSecondsInput(value);
                        queueTimerInputAnimation("seconds", value, event.timeStamp);
                        setTimerRemainingMs(0);
                        setTimerComplete(false);
                        timerEndRef.current = null;
                        setTimerRunning(false);
                      }} />
                    </label>
                  </div>
                )}

                <div className="control-row">
                  <button type="button" className="action-button primary" onClick={startPauseTimer} aria-label={timerRunning ? "Pause timer" : "Start timer"} title={timerRunning ? "Pause" : "Start"}>
                    {timerRunning ? <Pause size={20} strokeWidth={1.8} /> : <Play size={20} strokeWidth={1.8} />}
                  </button>
                  <button type="button" className="action-button" onClick={resetTimer} aria-label="Reset timer" title="Reset">
                    <RotateCcw size={20} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            )}
          </main>

          <footer className="zeno-footer">
            <button type="button" className="footer-button sound-footer-button" onClick={toggleSound} aria-label={soundEnabled ? "Sound on, turn off" : "Sound off, turn on"} aria-pressed={soundEnabled} title={soundEnabled ? "Sound on" : "Sound off"}>
              {soundEnabled ? <Volume2 size={20} strokeWidth={1.8} /> : <VolumeX size={20} strokeWidth={1.8} />}
            </button>
            <button type="button" className="footer-button" onClick={() => setSettingsOpen(true)} aria-label="Settings" title="Settings">
              <Settings2 size={20} strokeWidth={1.8} />
            </button>
          </footer>
        </div>
      </div>

      {settingsOpen && (
        <div className="sheet-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className={`settings-sheet ${selectedTheme === "minimal" ? "minimal-settings-sheet" : ""}`} onClick={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <span>Settings</span>
              <button type="button" className="close-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings" title="Close"><X size={20} strokeWidth={1.8} /></button>
            </div>

            <div className="settings-content">
              <section className="setting-block">
                <h3>Theme</h3>
                <div className="theme-grid">
                  {THEMES.map((theme) => (
                    <button key={theme.id} type="button" className={`theme-swatch ${selectedTheme === theme.id ? "selected" : ""}`} onClick={() => setSelectedTheme(theme.id)} aria-pressed={selectedTheme === theme.id} style={{ color: theme.foreground }}>
                      <span className="theme-art" aria-hidden="true" style={{ backgroundImage: `linear-gradient(180deg, ${theme.background}22, ${theme.background}99), url("${THEME_IMAGES[theme.id]}")` }}>
                      </span>
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                  <button type="button" className={`theme-swatch ${selectedTheme === "custom" ? "selected" : ""}`} onClick={() => setSelectedTheme("custom")} aria-pressed={selectedTheme === "custom"}>
                    <span className="theme-art" style={{ background: `linear-gradient(145deg, ${customTheme.backgroundColor}, ${customTheme.cardColor} 70%, ${customTheme.accentColor}55)`, color: customTheme.accentColor }}>
                      <Palette size={30} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <span className="theme-name">Custom</span>
                  </button>
                </div>
              </section>

              <section className="setting-block">
                <h3>Live Time Format</h3>
                <div className="settings-grid">
                  <label className="settings-field">
                    <span>Format</span>
                    <select value={liveTimeFormat} onChange={(event) => setLiveTimeFormat(event.target.value as LiveTimeFormat)}>
                      <option value="12">12-hour</option>
                      <option value="24">24-hour</option>
                    </select>
                  </label>
                </div>
              </section>

              <section className="setting-block">
                <h3>Font / Dial Appearance</h3>
                <div className="settings-grid">
                  <label className="settings-field">
                    <span>Font</span>
                    <select value={fontStyle} onChange={(event) => setFontStyle(event.target.value as FontStyle)}>
                      {FONT_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                  </label>

                  <label className="settings-field">
                    <span>Weight</span>
                    <input type="range" min={300} max={900} step={100} value={fontWeight} onChange={(event) => setFontWeight(Number(event.target.value))} />
                  </label>

                  <label className="settings-field">
                    <span>Size</span>
                    <input type="range" min={50} max={150} step={2} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} />
                  </label>

                  <label className="settings-field">
                    <span>Spacing</span>
                    <input type="range" min={0} max={12} step={1} value={letterSpacing} onChange={(event) => setLetterSpacing(Number(event.target.value))} />
                  </label>
                </div>
              </section>

              <section className="setting-block">
                <h3>Edit Theme</h3>
                <div className="theme-editor-grid">
                  {Object.entries(customTheme).map(([key, value]) => (
                    <label key={key} className="color-picker-field">
                      <span>{key.replace(/([A-Z])/g, " $1").replace(/Color/g, "").trim()}</span>
                      <div className="color-wheel" style={{ background: `conic-gradient(from 0deg, #ff3d3d, #ff9f1c, #ffe400, #5dff5d, #4ac8ff, #6c63ff, #ff4edd, #ff3d3d)` }}>
                        <input type="color" value={value} onChange={(event) => { setSelectedTheme("custom"); setCustomTheme((previous) => ({ ...previous, [key]: event.target.value })); }} aria-label={key} />
                      </div>
                    </label>
                  ))}
                </div>
                <div className="editor-actions">
                  <button type="button" className="action-button" onClick={() => setCustomTheme(DEFAULT_CUSTOM_THEME)} aria-label="Reset custom theme" title="Reset">
                    <RotateCcw size={20} strokeWidth={1.8} />
                  </button>
                  <button type="button" className="action-button primary" onClick={() => { setIsSaved(true); localStorage.setItem("zeno-custom-theme", JSON.stringify(customTheme)); setTimeout(() => setIsSaved(false), 1200); }} aria-label={isSaved ? "Theme saved" : "Save theme"} title={isSaved ? "Saved" : "Save"}>
                    {isSaved ? <Check size={20} strokeWidth={1.8} /> : <Save size={20} strokeWidth={1.8} />}
                  </button>
                </div>
              </section>

              <section className="setting-block">
                <h3>Clock Sound</h3>
                <div className="settings-grid">
                  <label className="settings-field">
                    <span>Sound style</span>
                    <select value={clockSoundStyle} onChange={(event) => setClockSoundStyle(event.target.value as ClockSoundStyle)}>
                      {(Object.keys(CLOCK_SOUND_STYLES) as ClockSoundStyle[]).map((style) => (
                        <option key={style} value={style}>{CLOCK_SOUND_STYLES[style].label}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
