import {
  createFormations,
  type Formation,
  type ProjectedPoint,
  type SceneColors,
} from "./summit-formations";

const PARTICLE_COUNT = 1400;
const TRANSITION = 1.6;
const STAGGER = 0.7;
const HOLD = 5.2;
const SWIRL = 0.4;
const CAMERA_DISTANCE = 3;
const REPEL_RADIUS = 80;
const REPEL_FORCE = 26;
/** Seconds each formation is on screen, transition included. */
export const PHASE_SECONDS = TRANSITION + STAGGER + HOLD;

/** Particle tones, by share of the total: primary, muted, success. */
const TONE_SHARES = [0.72, 0.18, 0.1] as const;
const TONE_KEYS = ["primary", "muted", "success"] as const;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOutCubic = (v: number) => (v < 0.5 ? 4 * v * v * v : 1 - (-2 * v + 2) ** 3 / 2);

function readColors(): SceneColors {
  const style = getComputedStyle(document.documentElement);
  const hsl = (name: string) => `hsl(${style.getPropertyValue(name).trim()})`;
  return { primary: hsl("--primary"), muted: hsl("--muted-foreground"), success: hsl("--success") };
}

/**
 * Canvas particle field for the Summit hero. Particles morph between
 * formations on a timer; the pointer tilts the camera and pushes particles.
 */
export class ParticleScene {
  readonly formations: Formation[];
  private readonly from = new Float32Array(PARTICLE_COUNT * 3);
  private readonly target = new Float32Array(PARTICLE_COUNT * 3);
  private readonly current = new Float32Array(PARTICLE_COUNT * 3);
  private readonly swirl = new Float32Array(PARTICLE_COUNT * 3);
  private readonly delay = new Float32Array(PARTICLE_COUNT);
  private readonly size = new Float32Array(PARTICLE_COUNT);
  /** Particle indices grouped by tone, so fillStyle is set once per group. */
  private readonly toneGroups: Uint16Array[];
  private readonly listeners = new Set<() => void>();
  private readonly projected: ProjectedPoint = { x: 0, y: 0, scale: 1, depth: 1 };

  private phase = 0;
  private previousPhase = -1;
  private phaseStart = 0;
  private time = 0;
  private lastFrame = 0;
  private frame = 0;
  private running = false;
  private reducedMotion = false;
  private onScreen = false;
  private cameraYaw = 0;
  private cameraPitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private pointer: { x: number; y: number } | null = null;
  private colors!: SceneColors;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;

  constructor() {
    const random = mulberry32(2026);
    this.formations = createFormations(PARTICLE_COUNT, random);

    const tones: number[][] = [[], [], []];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const o = i * 3;
      // Start scattered on a wide shell so the first formation pulls in.
      const u = random() * 2 - 1;
      const a = random() * Math.PI * 2;
      const r = 1.4 + random() * 0.9;
      const s = Math.sqrt(1 - u * u) * r;
      this.from[o] = Math.cos(a) * s;
      this.from[o + 1] = u * r;
      this.from[o + 2] = Math.sin(a) * s;
      this.swirl[o] = random() - 0.5;
      this.swirl[o + 1] = random() - 0.5;
      this.swirl[o + 2] = random() - 0.5;
      this.delay[i] = random() * STAGGER;
      this.size[i] = 1 + random() ** 3 * 1.8;
      const pick = random();
      tones[pick < TONE_SHARES[0] ? 0 : pick < TONE_SHARES[0] + TONE_SHARES[1] ? 1 : 2].push(i);
    }
    this.current.set(this.from);
    this.toneGroups = tones.map((group) => Uint16Array.from(group));
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getPhase = () => this.phase;

  goTo = (phase: number) => {
    if (phase === this.phase) return;
    this.from.set(this.current);
    this.previousPhase = this.phase;
    this.phase = phase;
    this.phaseStart = this.time;
    this.listeners.forEach((listener) => listener());
    if (!this.running) this.draw();
  };

  /** Pointer position in client coordinates, or null when it leaves. */
  setPointer = (clientX: number | null, clientY: number | null) => {
    if (!this.canvas || clientX === null || clientY === null) {
      this.pointer = null;
      this.targetYaw = 0;
      this.targetPitch = 0;
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((clientY - rect.top) / rect.height) * 2 - 1;
    this.pointer = { x: (clientX - rect.left) * this.dpr, y: (clientY - rect.top) * this.dpr };
    this.targetYaw = nx * 0.45;
    this.targetPitch = ny * 0.3;
  };

  /** Binds the scene to a canvas. Returns the detach function. */
  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.colors = readColors();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      this.reducedMotion = motionQuery.matches;
      this.updateLoop();
    };
    motionQuery.addEventListener("change", onMotionChange);
    this.reducedMotion = motionQuery.matches;

    const themeObserver = new MutationObserver(() => {
      this.colors = readColors();
      if (!this.running) this.draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });

    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(canvas);
    this.resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.updateLoop();
    });
    intersectionObserver.observe(canvas);

    return () => {
      motionQuery.removeEventListener("change", onMotionChange);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      this.onScreen = false;
      this.updateLoop();
      this.canvas = null;
      this.ctx = null;
    };
  }

  private resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.round(this.canvas.clientWidth * this.dpr);
    this.height = Math.round(this.canvas.clientHeight * this.dpr);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (!this.running) this.draw();
  }

  private updateLoop() {
    const shouldRun = this.onScreen && !this.reducedMotion;
    if (shouldRun === this.running) return;
    this.running = shouldRun;
    if (shouldRun) {
      this.lastFrame = performance.now();
      this.frame = requestAnimationFrame(this.tick);
    } else {
      cancelAnimationFrame(this.frame);
      this.draw();
    }
  }

  private tick = (now: number) => {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;
    this.time += dt;
    if (this.time - this.phaseStart > PHASE_SECONDS) {
      this.goTo((this.phase + 1) % this.formations.length);
    }
    const ease = 1 - Math.exp(-dt * 4);
    this.cameraYaw += (this.targetYaw - this.cameraYaw) * ease;
    this.cameraPitch += (this.targetPitch - this.cameraPitch) * ease;
    this.draw();
    this.frame = requestAnimationFrame(this.tick);
  };

  private project = (x: number, y: number, z: number) => {
    const cy = Math.cos(this.cameraYaw);
    const sy = Math.sin(this.cameraYaw);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const cp = Math.cos(this.cameraPitch);
    const sp = Math.sin(this.cameraPitch);
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp;
    const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE + z2);
    const radius = Math.min(this.width, this.height) * 0.42;
    const p = this.projected;
    p.x = this.width / 2 + x1 * radius * scale;
    p.y = this.height / 2 - y2 * radius * scale;
    p.scale = scale;
    p.depth = Math.min(1, Math.max(0.15, 0.6 - z2 * 0.5));
    return p;
  };

  private draw() {
    const ctx = this.ctx;
    if (!ctx || this.width === 0) return;

    // Reduced motion shows each formation settled, with time frozen.
    const elapsed = this.reducedMotion ? Infinity : this.time - this.phaseStart;
    const formation = this.formations[this.phase];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const o = i * 3;
      formation.place(i, this.time, this.target, o);
      const progress = clamp01((elapsed - this.delay[i]) / TRANSITION);
      if (progress >= 1) {
        this.current[o] = this.target[o];
        this.current[o + 1] = this.target[o + 1];
        this.current[o + 2] = this.target[o + 2];
        continue;
      }
      const e = easeInOutCubic(progress);
      const w = Math.sin(Math.PI * e) * SWIRL;
      this.current[o] = this.from[o] + (this.target[o] - this.from[o]) * e + this.swirl[o] * w;
      this.current[o + 1] = this.from[o + 1] + (this.target[o + 1] - this.from[o + 1]) * e + this.swirl[o + 1] * w;
      this.current[o + 2] = this.from[o + 2] + (this.target[o + 2] - this.from[o + 2]) * e + this.swirl[o + 2] * w;
    }

    ctx.clearRect(0, 0, this.width, this.height);
    const pointer = this.pointer;
    const repelRadius = REPEL_RADIUS * this.dpr;
    this.toneGroups.forEach((group, tone) => {
      ctx.fillStyle = this.colors[TONE_KEYS[tone]];
      for (const i of group) {
        const o = i * 3;
        const p = this.project(this.current[o], this.current[o + 1], this.current[o + 2]);
        let { x, y } = p;
        if (pointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < repelRadius && distance > 0) {
            const push = (1 - distance / repelRadius) ** 2 * REPEL_FORCE * this.dpr;
            x += (dx / distance) * push;
            y += (dy / distance) * push;
          }
        }
        ctx.globalAlpha = p.depth;
        ctx.beginPath();
        ctx.arc(x, y, this.size[i] * p.scale * this.dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const overlayBase = { ctx, project: this.project, t: this.time, colors: this.colors, dpr: this.dpr };
    const outgoing = this.formations[this.previousPhase]?.overlay;
    const outgoingAlpha = 1 - clamp01(elapsed / 0.4);
    if (outgoing && outgoingAlpha > 0) outgoing({ ...overlayBase, alpha: outgoingAlpha });
    const incomingAlpha = clamp01((elapsed - TRANSITION) / 0.8);
    if (formation.overlay && incomingAlpha > 0) formation.overlay({ ...overlayBase, alpha: incomingAlpha });
    ctx.globalAlpha = 1;
  }
}
