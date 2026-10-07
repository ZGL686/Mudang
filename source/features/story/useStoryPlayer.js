import { useCallback, useEffect, useRef, useState } from 'react';
import timeline from '../../data/story-timeline.json';
import manifest from '../../data/story-layer-manifest.json';
import { assetUrl } from '../../lib/asset-url.js';
import { clamp, sample } from './engine/story-core.mjs';
import { ScrollRenderer } from './engine/story-renderer.mjs';

function readInitialPosition() {
  const query = new URLSearchParams(window.location.search);
  const shot = Number(query.get('shot'));
  const validShot = Number.isInteger(shot) && shot >= 1 && shot <= timeline.shots.length;
  const requestedOffset = Number(query.get('at') || 0.1);
  const offset = Number.isFinite(requestedOffset) ? requestedOffset : 0.1;
  return {
    started: validShot,
    time: validShot ? clamp(timeline.shots[shot - 1].start + offset, 0, timeline.duration) : 0,
  };
}

function loadImage(path, signal) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', abort);
      image.onload = null;
      image.onerror = null;
      if (error) reject(error);
      else resolve(image);
    };
    const abort = () => {
      finish(new DOMException('Image loading cancelled', 'AbortError'));
      image.removeAttribute('src');
    };
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    image.onerror = () => finish(new Error(`无法载入画卷素材：${path}`));
    image.onload = () => {
      // Decode before the first canvas frame, and ignore completion after cancellation.
      image.decode().then(() => finish(), finish);
    };
    image.src = assetUrl(path);
  });
}

function releaseRenderer(renderer) {
  if (!renderer) return;
  renderer.assets.clear();
  // ScrollRenderer owns only canvas surfaces; it does not start its own listeners or loop.
  for (const value of Object.values(renderer)) {
    if (value instanceof HTMLCanvasElement) {
      value.width = 0;
      value.height = 0;
    }
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useStoryPlayer() {
  const [initial] = useState(readInitialPosition);
  const [time, setTime] = useState(initial.time);
  const [started, setStarted] = useState(false);
  const [playing, setPlayingState] = useState(false);
  const [sound, setSoundState] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState({ x: -100, y: -100, pressed: false });
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const canvasRef = useRef(null);
  const experienceRef = useRef(null);
  const audioRef = useRef(null);
  const audioRequestRef = useRef(0);
  const runtime = useRef({
    time: initial.time,
    started: false,
    playing: false,
    sound: false,
    ready: false,
    reading: false,
    resumeAfterReading: false,
    gesture: null,
    pointer: { x: 0, y: 0, down: false, active: false },
  });

  const syncAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++audioRequestRef.current;
    if (runtime.current.playing && runtime.current.sound) {
      audio.play().catch(() => {
        if (audioRef.current !== audio || audioRequestRef.current !== request
          || !runtime.current.playing || !runtime.current.sound) return;
        runtime.current.sound = false;
        setSoundState(false);
      });
    } else {
      audio.pause();
    }
  }, []);

  const setPlaying = useCallback((value) => {
    const next = Boolean(value) && runtime.current.ready;
    runtime.current.playing = next;
    setPlayingState(next);
    syncAudio();
  }, [syncAudio]);

  const seek = useCallback((value) => {
    const next = clamp(Number(value) || 0, 0, timeline.duration);
    runtime.current.time = next;
    setTime(next);
    if (next >= timeline.duration) setPlaying(false);
  }, [setPlaying]);

  const enter = useCallback(() => {
    if (!runtime.current.ready || runtime.current.started) return;
    runtime.current.started = true;
    setStarted(true);
    setPlaying(!reducedRef.current);
  }, [setPlaying]);

  const restart = useCallback(() => {
    if (!runtime.current.ready) return;
    seek(0);
    runtime.current.started = true;
    setStarted(true);
    setPlaying(!reducedRef.current);
  }, [seek, setPlaying]);

  const togglePlaying = useCallback(() => {
    if (runtime.current.time >= timeline.duration) seek(0);
    setPlaying(!runtime.current.playing);
  }, [seek, setPlaying]);

  const changeTime = useCallback((value) => {
    setPlaying(false);
    seek(value);
  }, [seek, setPlaying]);

  const selectChapter = useCallback((index) => {
    changeTime(timeline.shots.find((shot) => shot.chapter === index).start + 0.01);
  }, [changeTime]);

  const toggleSound = useCallback(() => {
    runtime.current.sound = !runtime.current.sound;
    setSoundState(runtime.current.sound);
    syncAudio();
  }, [syncAudio]);

  const openReading = useCallback(() => {
    if (runtime.current.reading) return;
    runtime.current.resumeAfterReading = runtime.current.playing;
    runtime.current.reading = true;
    setPlaying(false);
    setReadingOpen(true);
  }, [setPlaying]);

  const closeReading = useCallback(() => {
    if (!runtime.current.reading) return;
    runtime.current.reading = false;
    setReadingOpen(false);
    if (runtime.current.resumeAfterReading && !document.hidden) setPlaying(true);
    runtime.current.resumeAfterReading = false;
  }, [setPlaying]);

  const trackPointer = useCallback((event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.max(width / 1920, height / 1080);
    const drawingWidth = 1920 * scale;
    const drawingHeight = 1080 * scale;
    Object.assign(runtime.current.pointer, {
      x: ((event.clientX - (width - drawingWidth) / 2) / drawingWidth) * 2 - 1,
      y: ((event.clientY - (height - drawingHeight) / 2) / drawingHeight) * 2 - 1,
      active: true,
    });
    setCursor((previous) => ({ ...previous, x: event.clientX, y: event.clientY }));
  }, []);

  const onPointerMove = useCallback((event) => {
    trackPointer(event);
    const gesture = runtime.current.gesture;
    if (gesture && event.pointerType === 'touch' && Math.abs(event.clientY - gesture.y) > 7) {
      changeTime(gesture.time + (gesture.y - event.clientY) / 28);
    }
  }, [changeTime, trackPointer]);

  const onPointerDown = useCallback((event) => {
    trackPointer(event);
    runtime.current.pointer.down = true;
    runtime.current.gesture = { y: event.clientY, time: runtime.current.time };
    setCursor((previous) => ({ ...previous, pressed: true }));
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [trackPointer]);

  const releasePointer = useCallback(() => {
    runtime.current.pointer.down = false;
    runtime.current.gesture = null;
    setCursor((previous) => ({ ...previous, pressed: false }));
  }, []);

  const onPointerLeave = useCallback(() => {
    runtime.current.pointer.active = false;
    releasePointer();
  }, [releasePointer]);

  useEffect(() => {
    const audio = new Audio(assetUrl('assets/experience/xp/sounds/loop-main.mp3'));
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.22;
    audioRef.current = audio;
    return () => {
      audioRef.current = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const currentRuntime = runtime.current;
    let frameId = 0;
    let lastFrame = 0;
    let renderer;
    const decoded = new Map();
    currentRuntime.ready = false;
    // Fast Refresh retains React state while this effect recreates the renderer.
    setPlaying(false);
    setStatus('loading');
    setError('');

    const frame = (now) => {
      if (signal.aborted) return;
      const delta = Math.min(0.1, lastFrame ? (now - lastFrame) / 1000 : 0);
      lastFrame = now;
      const current = currentRuntime;
      if (current.playing && !document.hidden) {
        current.time = Math.min(current.time + delta, timeline.duration);
        if (current.time >= timeline.duration) setPlaying(false);
      }
      try {
        // Reduced motion starts paused. Skip the original opening's black fade
        // while keeping the playhead at zero so the first scene stays visible.
        const renderTime = reducedRef.current && current.started && current.time < 0.45 ? 0.45 : current.time;
        renderer.render(sample(timeline, renderTime), current.pointer, delta, current.started, current.playing);
        setTime(current.time);
        frameId = requestAnimationFrame(frame);
      } catch (reason) {
        setPlaying(false);
        currentRuntime.ready = false;
        setStatus('error');
        setError(reason.message);
      }
    };

    async function boot() {
      try {
        const entries = await Promise.all(Object.entries(manifest.runtimeAssets).map(async ([name, path]) => {
          if (!decoded.has(path)) decoded.set(path, loadImage(path, signal));
          return [name, await decoded.get(path)];
        }));
        if (signal.aborted) return;
        renderer = new ScrollRenderer(canvasRef.current, new Map(entries), timeline);
        renderer.resize();
        currentRuntime.ready = true;
        if (initial.started) {
          currentRuntime.started = true;
          setStarted(true);
        }
        setStatus('ready');
        frameId = requestAnimationFrame(frame);
      } catch (reason) {
        if (signal.aborted) return;
        setStatus('error');
        setError(reason.message);
        controller.abort();
      }
    }

    boot();
    const resize = () => renderer?.resize();
    window.addEventListener('resize', resize);
    return () => {
      controller.abort();
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      currentRuntime.ready = false;
      currentRuntime.playing = false;
      releaseRenderer(renderer);
      decoded.clear();
    };
  }, [initial, setPlaying]);

  useEffect(() => {
    const experience = experienceRef.current;
    const wheel = (event) => {
      if (!runtime.current.ready || !runtime.current.started || runtime.current.reading) return;
      event.preventDefault();
      changeTime(runtime.current.time + event.deltaY * 0.012);
    };
    const keydown = (event) => {
      const target = document.activeElement;
      if (!runtime.current.ready || runtime.current.reading || !runtime.current.started || target?.isContentEditable
        || ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlaying();
      } else if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
        event.preventDefault();
        changeTime(runtime.current.time + (event.code === 'ArrowRight' ? 3 : -3));
      } else if (event.code === 'Home' || event.code === 'End') {
        event.preventDefault();
        seek(event.code === 'Home' ? 0 : timeline.duration);
      }
    };
    const visibility = () => {
      if (document.hidden) setPlaying(false);
    };
    // A native non-passive listener is required to consume wheel navigation reliably.
    experience.addEventListener('wheel', wheel, { passive: false });
    document.addEventListener('keydown', keydown);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      experience.removeEventListener('wheel', wheel);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [changeTime, seek, setPlaying, togglePlaying]);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced, setPlaying]);

  return {
    timeline, time, started, playing, sound, readingOpen, status, error, cursor, reduced,
    canvasRef, experienceRef, enter, restart, togglePlaying, changeTime, selectChapter,
    toggleSound, openReading, closeReading,
    pointerEvents: {
      onPointerMove, onPointerDown, onPointerUp: releasePointer,
      onPointerCancel: releasePointer, onLostPointerCapture: releasePointer, onPointerLeave,
    },
  };
}
