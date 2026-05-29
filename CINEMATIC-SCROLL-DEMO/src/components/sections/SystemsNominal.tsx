import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";

const RULES = [
  { tag: "M3", title: "RAF + tickingRef gate", body: "Never run progress math in the raw scroll callback. Queue one rAF; drop the rest." },
  { tag: "M4", title: "Direct DOM via refs", body: "Canvas, opacity, transform — write to refs. React state only for visible-card boolean sets, only when the set changes." },
  { tag: "M9", title: "Real preload bar", body: "All frames load before scroll unblocks. The bar reflects actual progress, not a fake animation." },
  { tag: "M10", title: "DPR-aware canvas", body: "canvas.width = innerWidth × devicePixelRatio. Without it, retina renders blurry." },
  { tag: "M6", title: "Lenis Safari-safe", body: "lerp 0.1, syncTouch disabled. iOS stutters with defaults." },
  { tag: "+1", title: "prefers-reduced-motion", body: "Static poster + beat dialogue stack. The one rule SKILL.md misses." },
];

export function SystemsNominal() {
  return (
    <section id="systems" className="min-h-screen px-8 md:px-16 py-32 md:py-48 max-w-[1400px] mx-auto">
      <AnimatedSection>
        <AnimatedItem>
          <span className="inline-block text-xs font-mono tracking-[0.3em] uppercase text-[var(--color-accent)] border border-[var(--color-accent)]/40 px-3 py-1 rounded-full">
            systems nominal
          </span>
        </AnimatedItem>
        <AnimatedItem>
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1.05] mt-8 max-w-[18ch]">
            Six rules. <span className="text-[var(--color-text-dim)]">No exceptions.</span>
          </h2>
        </AnimatedItem>
        <AnimatedItem>
          <p className="text-lg text-[var(--color-text-dim)] max-w-[55ch] mt-6 leading-relaxed">
            Every cinematic-scroll surface follows the same rules.
            Break one and the site stutters on iOS, blurs on retina, or flashes blank on first scroll.
            Follow them and the build feels inevitable.
          </p>
        </AnimatedItem>
      </AnimatedSection>

      <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        {RULES.map((r) => (
          <AnimatedItem key={r.tag}>
            <div className="p-7 rounded-[20px] bg-[var(--color-surface)] border border-white/[0.06] h-full">
              <div className="flex items-baseline gap-3">
                <span className="text-xs font-mono tracking-widest text-[var(--color-accent)]">{r.tag}</span>
                <h3 className="text-xl font-semibold tracking-tight">{r.title}</h3>
              </div>
              <p className="text-[var(--color-text-dim)] mt-3 leading-relaxed">{r.body}</p>
            </div>
          </AnimatedItem>
        ))}
      </AnimatedSection>

      <AnimatedSection className="mt-32 border-t border-white/10 pt-12 flex flex-wrap items-baseline gap-x-8 gap-y-4 text-xs font-mono tracking-widest uppercase">
        <AnimatedItem>
          <span className="text-[var(--color-text-dim)]">stack</span>
        </AnimatedItem>
        <AnimatedItem><span>next 16.2.2</span></AnimatedItem>
        <AnimatedItem><span>react 19.2.4</span></AnimatedItem>
        <AnimatedItem><span>tailwind 4</span></AnimatedItem>
        <AnimatedItem><span>framer-motion 12.38</span></AnimatedItem>
        <AnimatedItem><span>lenis 1.3.21</span></AnimatedItem>
        <AnimatedItem><span>geist 1.7.0</span></AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
