import {
  createFormations,
  type Formation,
  type ProjectedPoint,
  type SceneColors,
} from "./summit-formations";

const PARTICLE_COUNT = 1400;
/** Roughly how long a particle takes to settle into a new formation. */
const TRANSITION = 1.6;
/** Seconds over which the formation switch sweeps across the field, left to right. */
const STAGGER = 0.9;
const HOLD = 5.2;
/** Spring angular frequency range, per particle, so arrivals spread out. */
const SPRING_MIN = 2.4;
const SPRING_MAX = 4;
const DAMPING_RATIO = 0.8;
/** Peak swirl acceleration while a particle changes formation, and how long it lasts. */
const SWIRL = 3.5;
const SWIRL_SECONDS = 1.4;
/** Time offset used to measure formation velocity for the spring's feed-forward. */
const VELOCITY_PROBE = 1 / 60;
const MAX_STEP = 1 / 60;
const CAMERA_DISTANCE = 3;
const REPEL_RADIUS = 80;
const REPEL_FORCE = 26;
const SETTLE = TRANSITION + STAGGER;
const PHASE_SECONDS = SETTLE + HOLD;
/** How far, in stops, the timeline ball creeps toward the next stop while holding. */
const BALL_CREEP = 0.25;
/** Track fraction at each end over which the ball fades as it wraps. */
const BALL_FADE = 0.06;

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
  private readonly target = new Float32Array(PARTICLE_COUNT * 3);
  private readonly targetBehind = new Float32Array(PARTICLE_COUNT * 3);
  private readonly current = new Float32Array(PARTICLE_COUNT * 3);
  private readonly velocity = new Float32Array(PARTICLE_COUNT * 3);
  private readonly swirl = new Float32Array(PARTICLE_COUNT * 3);
  /** Seconds after a switch before each particle starts chasing the new formation. */
  private readonly delay = new Float32Array(PARTICLE_COUNT);
  private readonly jitter = new Float32Array(PARTICLE_COUNT);
  private readonly omega = new Float32Array(PARTICLE_COUNT);
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
  /** Shrinks dots on small canvases so the field doesn't clot on phones. */
  private dotScale = 1;
  private timeline: HTMLElement | null = null;
  /** Ball position in stop units, unwrapped. Stop i sits at (i + 0.5) / count of the track. */
  private ballPosition = -0.5;
  private ballFrom = -0.5;
  private ballTarget = 0;

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
      this.current[o] = Math.cos(a) * s;
      this.current[o + 1] = u * r;
      this.current[o + 2] = Math.sin(a) * s;
      this.swirl[o] = random() - 0.5;
      this.swirl[o + 1] = random() - 0.5;
      this.swirl[o + 2] = random() - 0.5;
      this.jitter[i] = random();
      this.delay[i] = this.jitter[i] * STAGGER;
      this.omega[i] = SPRING_MIN + random() * (SPRING_MAX - SPRING_MIN);
      this.size[i] = 1 + random() ** 3 * 1.8;
      const pick = random();
      tones[pick < TONE_SHARES[0] ? 0 : pick < TONE_SHARES[0] + TONE_SHARES[1] ? 1 : 2].push(i);
    }
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
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const sweep = Math.min(1, Math.max(0, (this.current[i * 3] + 1.1) / 2.2));
      this.delay[i] = STAGGER * (0.7 * sweep + 0.3 * this.jitter[i]);
    }
    const stops = this.formations.length;
    this.ballFrom = this.ballPosition >= stops - 0.5 ? this.ballPosition - stops : this.ballPosition;
    // Leaving the last stop for the first keeps moving forward, off the end and around.
    this.ballTarget = phase === 0 && this.ballFrom > stops - 1 ? stops : phase;
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

  /** Binds the timeline track, which receives --ball and --ball-opacity. Returns the detach function. */
  attachTimeline(track: HTMLElement) {
    this.timeline = track;
    this.updateTimeline();
    return () => {
      this.timeline = null;
    };
  }

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
    this.dotScale = Math.min(1, Math.max(0.65, Math.min(this.canvas.clientWidth, this.canvas.clientHeight) / 480));
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
    this.integrate(dt);
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

  /**
   * Each particle is a damped spring chasing its formation point. The spring
   * also matches the formation's own velocity, so particles keep their
   * momentum through a switch and track moving formations without lag.
   */
  private integrate(dt: number) {
    const elapsed = this.time - this.phaseStart;
    const incoming = this.formations[this.phase];
    const outgoing = this.formations[this.previousPhase] ?? incoming;
    const steps = Math.ceil(dt / MAX_STEP);
    const h = dt / steps;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const o = i * 3;
      const sinceSwitch = elapsed - this.delay[i];
      const formation = sinceSwitch >= 0 ? incoming : outgoing;
      formation.place(i, this.time, this.target, o);
      formation.place(i, this.time - VELOCITY_PROBE, this.targetBehind, o);
      const w = this.omega[i];
      const stiffness = w * w;
      const damping = 2 * DAMPING_RATIO * w;
      const swirl =
        sinceSwitch > 0 && sinceSwitch < SWIRL_SECONDS ? SWIRL * Math.sin((Math.PI * sinceSwitch) / SWIRL_SECONDS) : 0;
      for (let axis = o; axis < o + 3; axis++) {
        const target = this.target[axis];
        const targetVelocity = (target - this.targetBehind[axis]) / VELOCITY_PROBE;
        const push = this.swirl[axis] * swirl;
        let p = this.current[axis];
        let v = this.velocity[axis];
        for (let step = 0; step < steps; step++) {
          v += (stiffness * (target - p) + damping * (targetVelocity - v) + push) * h;
          p += v * h;
        }
        this.current[axis] = p;
        this.velocity[axis] = v;
      }
    }
  }

  /** Puts every particle on its formation point, at rest. */
  private settle() {
    const formation = this.formations[this.phase];
    for (let i = 0; i < PARTICLE_COUNT; i++) formation.place(i, this.time, this.current, i * 3);
    this.velocity.fill(0);
  }

  private draw() {
    const ctx = this.ctx;
    if (!ctx || this.width === 0) return;

    // Reduced motion shows each formation settled, with time frozen.
    if (this.reducedMotion) this.settle();
    const elapsed = this.reducedMotion ? Infinity : this.time - this.phaseStart;
    const formation = this.formations[this.phase];

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
        ctx.arc(x, y, this.size[i] * p.scale * this.dpr * this.dotScale, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    const overlayBase = { ctx, project: this.project, t: this.time, colors: this.colors, dpr: this.dpr };
    const outgoing = this.formations[this.previousPhase]?.overlay;
    const outgoingAlpha = 1 - clamp01(elapsed / 1);
    if (outgoing && outgoingAlpha > 0) outgoing({ ...overlayBase, alpha: outgoingAlpha });
    const incomingAlpha = clamp01((elapsed - TRANSITION) / 0.8);
    if (formation.overlay && incomingAlpha > 0) formation.overlay({ ...overlayBase, alpha: incomingAlpha });
    ctx.globalAlpha = 1;
    this.updateTimeline();
  }

  private updateTimeline() {
    const elapsed = this.reducedMotion ? Infinity : this.time - this.phaseStart;
    this.ballPosition =
      elapsed < SETTLE
        ? this.ballFrom + (this.ballTarget - this.ballFrom) * easeInOutCubic(elapsed / SETTLE)
        : this.ballTarget + (this.reducedMotion ? 0 : BALL_CREEP * clamp01((elapsed - SETTLE) / HOLD));
    if (!this.timeline) return;
    const stops = this.formations.length;
    const x = ((((this.ballPosition + 0.5) % stops) + stops) % stops) / stops;
    this.timeline.style.setProperty("--ball", x.toFixed(4));
    this.timeline.style.setProperty("--ball-opacity", clamp01(Math.min(x, 1 - x) / BALL_FADE).toFixed(3));
  }
}
