import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hydrovent AI — Venturi Aeration Simulator" },
      { name: "description", content: "Interactive Venturi aeration dashboard: simulate water flow, air intake and illustrative dissolved oxygen." },
      { property: "og:title", content: "Hydrovent AI — Cleaner Water, Sustainable Future" },
      { property: "og:description", content: "Interactive Venturi aeration simulator for low-oxygen water." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Mode = "natural" | "pump";
const INIT = { flow: 50, air: 50, mode: "natural" as Mode, doVal: 3.0 };
const DO_MAX = 9; // illustrative saturation cap (mg/L)
const MIN_FLOW_NATURAL = 35;
const MIN_FLOW_PUMP = 20;

function suctionFactor(flow: number, mode: Mode) {
  // Effective driving flow; pump adds a boost. Below threshold -> little/no suction.
  const effective = mode === "pump" ? Math.min(100, flow + 25) : flow;
  const threshold = mode === "pump" ? MIN_FLOW_PUMP + 25 : MIN_FLOW_NATURAL;
  if (effective <= threshold) return 0;
  return Math.min(1, (effective - threshold) / (100 - threshold));
}

function Index() {
  const [flow, setFlow] = useState(INIT.flow);
  const [air, setAir] = useState(INIT.air);
  const [mode, setMode] = useState<Mode>(INIT.mode);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [doVal, setDoVal] = useState(INIT.doVal);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<number[]>([INIT.doVal]);
  const [demo, setDemo] = useState<number | null>(null);

  const suction = suctionFactor(flow, mode);
  const airDrawn = Math.round(suction * air); // actual air entering, limited by suction
  const lowFlow = flow < (mode === "pump" ? MIN_FLOW_PUMP : MIN_FLOW_NATURAL) || suction === 0;

  const ref = useRef({ suction, air, doVal });
  ref.current = { suction, air, doVal };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const { suction: s, air: a, doVal: d } = ref.current;
      const next = Math.max(0, Math.min(DO_MAX, d + 0.24 * s * (a / 100) * (1 - d / DO_MAX) - 0.01));
      ref.current.doVal = next;
      setDoVal(next);
      setHistory((h) => [...h, next].slice(-120));
      setElapsed((e) => e + 0.5);
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  const reset = () => {
    setRunning(false); setStarted(false);
    setFlow(INIT.flow); setAir(INIT.air); setMode(INIT.mode);
    setDoVal(INIT.doVal); setElapsed(0); setHistory([INIT.doVal]); setDemo(null);
  };

  const status = !started
    ? { label: "Idle — ready", tone: "muted" }
    : !running
      ? { label: "Paused", tone: "warning" }
      : lowFlow
        ? { label: "Running — low flow", tone: "destructive" }
        : { label: "Running — aerating", tone: "success" };

  const toneCls: Record<string, string> = {
    muted: "bg-muted-foreground",
    warning: "bg-warning",
    destructive: "bg-destructive",
    success: "bg-success",
  };

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand font-display text-lg font-bold text-primary-foreground">H</div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Hydrovent <span className="text-brand">AI</span></h1>
            <p className="text-xs text-muted-foreground">Cleaner Water, Sustainable Future.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm" role="status" aria-live="polite">
          <span className="relative flex h-2.5 w-2.5">
            {running && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 ${toneCls[status.tone]}`} />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${toneCls[status.tone]}`} />
          </span>
          {status.label}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-16 sm:px-6">
        <section className="panel grid gap-6 p-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">The problem</p>
            <p className="mt-2 text-sm text-muted-foreground">Polluted or stagnant water often has low dissolved oxygen, stressing aquatic life and slowing natural breakdown of organic matter. Conventional aerators can be costly and energy-hungry.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Our solution</p>
            <p className="mt-2 text-sm text-muted-foreground">A Venturi injector: water speeds up through a narrow throat, local pressure drops, and atmospheric air is drawn in and mixed as fine bubbles — no compressor needed.</p>
          </div>
        </section>

        <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-2 text-center text-xs font-semibold tracking-wide text-warning">
          SIMULATION — NOT REAL SENSOR DATA
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => { reset(); setDemo(0); }} className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground">▶ Start Demo Mode</button>
          <button onClick={() => { reset(); setDemo(0); setRunning(true); setStarted(true); }} className="rounded-md border px-4 py-2 text-sm font-semibold">↻ Restart Demonstration</button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Water flow setting" value={`${flow}%`} sub={mode === "pump" ? "Pump-assisted" : "Natural flow"} pct={flow} bar="bg-water" />
          <Stat label="Air intake setting" value={`${air}%`} sub={`Actually drawn in: ${airDrawn}% · suction ${Math.round(suction * 100)}%`} pct={air} bar="bg-primary" />
          <Stat label="Estimated DO" value={`${doVal.toFixed(2)} mg/L`} sub={`Illustrative · t = ${elapsed.toFixed(0)}s`} pct={(doVal / DO_MAX) * 100} bar="bg-success" />
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">System status</p>
              <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">SIMULATED</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${toneCls[status.tone]} ${running ? "animate-pulse" : ""}`} />
              <p className="font-display text-lg font-bold">{status.label}</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{lowFlow ? "Suction may be inadequate at this flow." : "Flow sufficient for illustrative suction."}</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="panel space-y-5 p-5">
            <h2 className="font-semibold">System controls</h2>
            <Slider label="Water flow" value={flow} onChange={setFlow} />
            <Slider label="Air intake (valve opening)" value={air} onChange={setAir} />
            <div>
              <label htmlFor="mode" className="text-sm text-muted-foreground">Operating mode</label>
              <select id="mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)}
                className="mt-1 w-full rounded-md border bg-secondary px-3 py-2 text-sm">
                <option value="natural">Natural Water Flow</option>
                <option value="pump">Pump-Assisted Recirculation</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { setRunning(true); setStarted(true); }} disabled={running}
                className="rounded-md bg-brand px-2 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Start</button>
              <button onClick={() => setRunning(false)} disabled={!running}
                className="rounded-md bg-secondary px-2 py-2 text-sm font-semibold disabled:opacity-50">Pause</button>
              <button onClick={reset} className="rounded-md border px-2 py-2 text-sm font-semibold">Reset</button>
            </div>

            {lowFlow && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive" role="alert">
                <strong>⚠ Low flow:</strong> water velocity through the throat may be too low to create enough pressure drop — Venturi air suction may be inadequate. Raising air intake alone will not fix this; increase water flow{mode === "natural" ? " or switch to Pump-Assisted mode" : ""}.
              </div>
            )}
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              {mode === "natural"
                ? "Natural mode depends entirely on sufficient existing water flow and pressure (e.g. a stream, outfall or gravity head). No electricity used."
                : "Pump mode: a pump recirculates tank water to supply the driving flow the Venturi injector needs. ⚡ Requires a power source (grid, battery or solar)."}
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Venturi aeration diagram</h2>
              <span className="text-xs text-muted-foreground">{running ? "Animating" : started ? "Paused" : "Press Start"}</span>
            </div>
            <Diagram running={running} started={started} flow={flow} airDrawn={airDrawn} mode={mode} stage={demo} />
            {demo !== null && (
              <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Demo Mode · Stage {demo + 1} of 5</p>
                <p className="mt-1 font-display text-lg font-semibold">{STAGES[demo][0]}</p>
                <p className="mt-1 text-sm text-muted-foreground">{STAGES[demo][1]}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button onClick={() => setDemo(Math.max(0, demo - 1))} disabled={demo === 0} className="rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold disabled:opacity-40">← Previous</button>
                  <button onClick={() => setDemo(Math.min(4, demo + 1))} disabled={demo === 4} className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">Next →</button>
                  <div className="flex gap-1">
                    {STAGES.map((_, i) => (
                      <button key={i} aria-label={`Go to stage ${i + 1}`} onClick={() => setDemo(i)} className={`h-2.5 w-6 rounded-full ${i === demo ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                  <button onClick={() => setDemo(null)} className="ml-auto text-xs text-muted-foreground underline">Exit demo</button>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Faster water through the narrow throat can reduce local static pressure (<Term tip="Along a streamline, when fluid speeds up, its static pressure tends to fall.">Bernoulli principle</Term>). When that pressure falls below atmospheric pressure, air can be drawn in through the inlet and sheared into bubbles in the mixing zone.
            </p>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Dissolved-oxygen trend</h2>
              <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">SIMULATED</span>
            </div>
            <Chart data={history} />
            <p className="mt-1 text-xs text-muted-foreground">Illustrative demonstration model, not a validated prediction. Updates every 0.5 s while running.</p>
          </section>
          <section className="panel space-y-3 p-5 text-sm">
            <h2 className="font-semibold">Bernoulli &amp; the Venturi effect</h2>
            <p className="text-muted-foreground">In a pipe, the same volume of water must pass every point each second. Where the pipe narrows (the <Term tip="The narrowest section of the Venturi, where velocity is highest.">throat</Term>), water must move faster.</p>
            <p className="text-muted-foreground">Bernoulli's principle says faster flow tends to mean lower <Term tip="Pressure exerted by the fluid itself, independent of its motion.">static pressure</Term>. If throat pressure drops below atmospheric pressure, air can be sucked in — this is <Term tip="Air being drawn into and carried along by the moving water.">air entrainment</Term>.</p>
            <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">Actual entrainment depends on inlet pressure, throat geometry, flow rate, back-pressure and operating conditions. This model only illustrates the trend.</p>
          </section>
        </div>

        <section className="panel p-5 text-xs text-muted-foreground">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Demonstration model (transparent)</h2>
          <p>Suction (0–1) = 0 below a flow threshold (35% natural, 20% pump-assisted; pump adds +25% effective flow), then rises linearly to 1 at 100%. Air drawn = suction × air-intake setting. Each 0.5 s: DO += 0.24 × suction × (air/100) × (1 − DO/9) − 0.01. DO starts at 3.0 mg/L and is capped at 9 mg/L. All constants are chosen for illustration only.</p>
        </section>

        <section className="panel p-6">
          <h2 className="text-lg font-semibold">How it works</h2>
          <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Intake", "Water is drawn from the tank (by natural flow or a pump)."],
              ["Constriction", "The pipe narrows at the Venturi throat; velocity rises."],
              ["Pressure drop", "Local static pressure falls, potentially below atmospheric."],
              ["Air suction", "Air enters through the side inlet and mixes as bubbles."],
              ["Return", "Aerated water flows back to the tank, where oxygen can dissolve."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-lg bg-muted p-4">
                <span className="text-brand font-display text-2xl font-bold">{i + 1}</span>
                <p className="mt-1 font-semibold">{t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Problem", "text-destructive", "Low dissolved oxygen in polluted or stagnant water harms aquatic life and slows natural treatment."],
            ["Solution", "text-primary", "A low-cost Venturi injector with no moving parts, driven by natural flow or a recirculation pump."],
            ["Expected benefit", "text-accent", "Potentially improved oxygen transfer at low cost and maintenance — to be confirmed by physical testing."],
          ].map(([t, c, d], i) => (
            <div key={t} className="panel p-5">
              <p className={`font-display text-sm font-bold uppercase tracking-widest ${c}`}>{t} {i < 2 && "→"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-warning/40 bg-warning/5 p-5 text-xs text-muted-foreground">
          <p className="font-semibold text-warning">Disclaimer</p>
          <p className="mt-1">This is an illustrative simulation. Values are SIMULATED — NOT REAL SENSOR DATA — and do not accurately predict real oxygen transfer. Actual dissolved-oxygen improvement must be verified through physical testing with a dissolved-oxygen meter. Aeration alone does not establish that polluted water is safe to use or drink, and it does not remove all industrial contaminants (e.g. heavy metals, chemicals).</p>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, sub, pct, bar }: { label: string; value: string; sub: string; pct: number; bar: string }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">SIMULATED</span>
      </div>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <input type="range" min={0} max={100} value={value} aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full" />
    </div>
  );
}

const STAGE_BOXES = [
  { x: 150, y: 195, width: 185, height: 70 },
  { x: 330, y: 195, width: 115, height: 70 },
  { x: 395, y: 80, width: 50, height: 160 },
  { x: 440, y: 185, width: 165, height: 80 },
  { x: 15, y: 140, width: 150, height: 155 },
];

function Diagram({ running, started, flow, airDrawn, mode, stage }: { running: boolean; started: boolean; flow: number; airDrawn: number; mode: Mode; stage: number | null }) {
  const active = started;
  const speed = flow > 0 ? Math.max(0.3, 3 - flow / 40) : 0;
  const bubbleCount = active ? Math.round(airDrawn / 8) : 0;
  const flowStyle = { animationDuration: `${speed}s`, opacity: active && flow > 0 ? 1 : 0 };
  const label = "fill-[var(--muted-foreground)] text-[11px]";
  return (
    <div className={`w-full overflow-x-auto ${running ? "" : "paused"}`}>
      <svg viewBox="0 0 760 320" className="min-w-[600px] w-full">
        {/* Tank */}
        <rect x="20" y="150" width="140" height="140" rx="10" fill="none" stroke="var(--pipe)" strokeWidth="3" />
        <rect x="23" y="185" width="134" height="102" rx="6" fill="var(--water)" opacity="0.35" />
        <text x="90" y="305" textAnchor="middle" className={label}>Water Tank</text>
        {/* Pipe out of tank */}
        <path d="M160 230 H230" stroke="var(--pipe)" strokeWidth="18" fill="none" />
        {/* Pump */}
        <g opacity={mode === "pump" ? 1 : 0.25}>
          <circle cx="260" cy="230" r="26" fill="var(--secondary)" stroke="var(--primary)" strokeWidth="2" />
          <g className="impeller" style={{ animationDuration: mode === "pump" && active ? "0.8s" : "0s" }}>
            <path d="M260 210 V250 M240 230 H280" stroke="var(--primary)" strokeWidth="3" />
          </g>
          <text x="260" y="278" textAnchor="middle" className={label}>{mode === "pump" ? "Pump ⚡" : "Pump (off)"}</text>
        </g>
        {/* Venturi body: converging, throat, diverging */}
        <path d="M286 221 H330 L400 236 H440 L520 221 H600 V239 H520 L440 244 H400 L330 239 H286 Z" fill="var(--pipe)" />
        <path d="M286 221 H330 L400 216 H440 L520 221" fill="none" />
        <polygon points="286,221 330,221 400,226 440,226 520,221 600,221 600,212 520,212 440,217 400,217 330,212 286,212" fill="var(--pipe)" />
        <text x="420" y="200" textAnchor="middle" className={label}>Narrow Throat</text>
        {/* Air inlet */}
        <path d="M420 120 V222" stroke="var(--pipe)" strokeWidth="10" />
        <circle cx="420" cy="115" r="8" fill="none" stroke="var(--air)" strokeWidth="2" />
        <text x="420" y="98" textAnchor="middle" className={label}>Air Inlet ({airDrawn}%)</text>
        <text x="540" y="200" textAnchor="middle" className={label}>Air-Water Mixing</text>
        {/* Outlet + return */}
        <path d="M600 230 H700 V100 H90 V150" stroke="var(--pipe)" strokeWidth="14" fill="none" />
        <text x="700" y="250" textAnchor="middle" className={label}>Aerated Outlet</text>
        <text x="400" y="88" textAnchor="middle" className={label}>Return to Tank ←</text>

        {/* Flow lines */}
        <path d="M160 230 H700 V100 H90 V150" stroke="var(--water)" strokeWidth="4" fill="none" className="flow-line" style={flowStyle} />

        {/* Bubbles: fall down inlet, then travel along mixing zone */}
        {Array.from({ length: bubbleCount }).map((_, i) => (
          <circle key={`in${i}`} cx="420" cy="125" r="3" fill="var(--air)" className="bubble"
            style={{ ["--dx" as string]: "0px", ["--dy" as string]: "100px", animationDuration: "1.4s", animationDelay: `${(i * 0.17) % 1.4}s` }} />
        ))}
        {Array.from({ length: bubbleCount * 2 }).map((_, i) => (
          <circle key={`mx${i}`} cx="430" cy={224 + ((i * 7) % 12)} r={1.5 + (i % 3)} fill="var(--air)" className="bubble"
            style={{ ["--dx" as string]: "260px", ["--dy" as string]: `${(i % 5) - 2}px`, animationDuration: `${Math.max(0.6, speed * 1.2)}s`, animationDelay: `${(i * 0.11) % 1.5}s` }} />
        ))}
        {active && airDrawn === 0 && flow >= 0 && (
          <text x="420" y="160" textAnchor="middle" className="fill-[var(--destructive)] text-[12px] font-semibold">No air suction</text>
        )}
        {stage !== null && (
          <rect {...STAGE_BOXES[stage]} rx="10" fill="var(--primary)" fillOpacity="0.12" stroke="var(--primary)" strokeWidth="2" strokeDasharray="6 4" className="transition-all duration-500" />
        )}
      </svg>
    </div>
  );
}
