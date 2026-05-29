"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, framePath, BEATS } from "@/lib/cinematic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const tickingRef = useRef(false);
  const lastFrameRef = useRef(-1);
  const lastVisibleKeyRef = useRef("");
  const progressRef = useRef(0);

  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [visibleBeatIds, setVisibleBeatIds] = useState<string[]>([]);

  const reduced = useReducedMotion();

  // ── 1. Preload all frames before unblocking ──
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let count = 0;
    const arr: HTMLImageElement[] = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = img.onerror = () => {
        if (cancelled) return;
        count += 1;
        setLoaded(count);
        if (count === FRAME_COUNT) {
          framesRef.current = arr;
          setReady(true);
        }
      };
      arr[i] = img;
    }

    return () => { cancelled = true; };
  }, [reduced]);

  // ── 2. DPR-aware canvas sizing ──
  useEffect(() => {
    if (reduced || !ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      drawFrame(lastFrameRef.current >= 0 ? lastFrameRef.current : 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, reduced]);

  // ── 3. Cover-fit draw with mobile zoom ──
  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[idx];
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, cw, ch);

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    const isMobile = window.innerWidth <= 768;
    const zoom = isMobile ? 1.3 : 1;
    const scale = Math.max(cw / iw, ch / ih) * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    lastFrameRef.current = idx;
  };

  // ── 4. RAF-gated scroll handler ──
  useEffect(() => {
    if (reduced || !ready) return;

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) { tickingRef.current = false; return; }
        const rect = section.getBoundingClientRect();
        const scrollable = section.offsetHeight - window.innerHeight;
        const raw = scrollable > 0 ? -rect.top / scrollable : 0;
        const progress = Math.min(1, Math.max(0, raw));
        progressRef.current = progress;

        // Frame index
        const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
        if (idx !== lastFrameRef.current) drawFrame(idx);

        // Direct DOM writes for hot updates (NO React state)
        if (headlineRef.current) {
          const fade = progress < 0.15 ? 1 : Math.max(0, 1 - (progress - 0.15) * 4);
          headlineRef.current.style.opacity = String(fade);
        }
        if (ctaRef.current) {
          const o = Math.max(0, Math.min(1, (progress - 0.85) * 10));
          const y = progress < 0.85 ? 24 : 24 - (progress - 0.85) * 200;
          ctaRef.current.style.opacity = String(o);
          ctaRef.current.style.transform = `translateY(${y}px)`;
        }
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress})`;
        }

        // React state ONLY for visible-card set, ONLY when set changes
        const visible = BEATS.filter(b => progress >= b.show && progress <= b.hide).map(b => b.id);
        const key = visible.sort().join("|");
        if (key !== lastVisibleKeyRef.current) {
          lastVisibleKeyRef.current = key;
          setVisibleBeatIds(visible);
        }

        tickingRef.current = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ready, reduced]);

  // ── Reduced-motion poster fallback ──
  if (reduced) {
    return (
      <section className="min-h-screen flex items-center justify-center px-8 py-24">
        <div className="max-w-2xl space-y-10">
          <span className="inline-block text-xs tracking-[0.2em] uppercase font-mono text-[var(--color-accent)] border border-[var(--color-accent)]/40 px-3 py-1 rounded-full">
            cinematic-scroll · reduced-motion mode
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05]">
            Frame sequence + scroll progress.
          </h1>
          <img src={framePath(Math.floor(FRAME_COUNT / 2))} alt="cinematic poster" className="w-full rounded-[20px] border border-white/10" />
          <ul className="space-y-6 text-lg text-[var(--color-text-dim)]">
            {BEATS.map(b => (
              <li key={b.id}>
                <div className="text-xs font-mono tracking-widest text-[var(--color-accent)]">{b.label}</div>
                <p className="text-[var(--color-text)] mt-1">"{b.quote}"</p>
                <div className="text-xs mt-1">— {b.source}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const loadingPct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <section ref={sectionRef} style={{ height: "400vh" }} className="relative">
      <div ref={stickyRef} className="sticky top-0 h-screen w-screen overflow-hidden bg-[var(--color-bg)]">
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-[var(--color-bg)] gap-4 px-8">
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-text-dim)]">
              preloading {loadingPct}%
            </span>
            <div className="h-[2px] w-64 max-w-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[var(--color-accent)] origin-left" style={{ transform: `scaleX(${loaded / FRAME_COUNT})` }} />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* HUD overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-8 right-8 flex justify-between text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-text-dim)]">
            <span className="text-[var(--color-accent)]">CINEMATIC-SCROLL</span>
            <span>frame {Math.min(FRAME_COUNT - 1, Math.floor(progressRef.current * FRAME_COUNT)) + 1}/{FRAME_COUNT}</span>
          </div>

          <h1
            ref={headlineRef}
            className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center text-5xl md:text-8xl font-bold tracking-tighter leading-[0.95] max-w-[18ch] px-6"
            style={{ willChange: "opacity" }}
          >
            <span className="block text-[var(--color-text-dim)] text-xs font-mono tracking-[0.3em] uppercase mb-6">built with claude</span>
            <span className="block">A frame is</span>
            <span className="block text-[var(--color-accent)]">a moment.</span>
          </h1>

          {/* Beat overlays — only re-render when visible set changes */}
          <div className="absolute bottom-32 left-8 right-8 md:left-16 md:right-16 max-w-2xl">
            {BEATS.map(b => {
              const active = visibleBeatIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  aria-hidden={!active}
                  className={`transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none absolute"}`}
                >
                  <div className="text-xs font-mono tracking-[0.3em] uppercase text-[var(--color-accent)]">{b.label}</div>
                  <p className="text-2xl md:text-3xl font-medium mt-3 leading-tight max-w-[40ch]">"{b.quote}"</p>
                  <div className="text-xs font-mono tracking-widest text-[var(--color-text-dim)] mt-2">— {b.source}</div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-8 left-8 right-8 h-[2px] bg-white/10 overflow-hidden">
            <div ref={barRef} className="h-full bg-[var(--color-accent)] origin-left" style={{ transform: "scaleX(0)", willChange: "transform" }} />
          </div>

          {/* CTA earned at 85% */}
          <div
            ref={ctaRef}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 pointer-events-auto"
            style={{ opacity: 0, transform: "translateY(24px)", willChange: "opacity, transform" }}
          >
            <a
              href="#systems"
              className="inline-flex items-center gap-3 bg-[var(--color-accent)] text-black px-7 py-3 rounded-full font-medium tracking-tight hover:bg-[var(--color-accent)]/90 transition-colors"
            >
              See the rules
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
