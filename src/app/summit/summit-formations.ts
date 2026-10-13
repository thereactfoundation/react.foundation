const TAU = Math.PI * 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export const formationIds = ["connect", "align", "build", "share"] as const;
export type FormationId = (typeof formationIds)[number];

export interface ProjectedPoint {
  x: number;
  y: number;
  /** Perspective scale. */
  scale: number;
  /** 0 (far) to 1 (near). */
  depth: number;
}

export interface SceneColors {
  primary: string;
  muted: string;
  success: string;
}

export interface OverlayContext {
  ctx: CanvasRenderingContext2D;
  /** Projects a world point. Reuses the returned object. */
  project: (x: number, y: number, z: number) => ProjectedPoint;
  t: number;
  alpha: number;
  colors: SceneColors;
  dpr: number;
}

export interface Formation {
  id: FormationId;
  /** Writes particle i's world position at time t into out[o..o+2]. */
  place: (i: number, t: number, out: Float32Array, o: number) => void;
  overlay?: (c: OverlayContext) => void;
}

/** Rotates (x, y, z) by yaw (Y axis) then pitch (X axis) into out. */
function rotate(out: Float32Array, o: number, x: number, y: number, z: number, yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  out[o] = x1;
  out[o + 1] = y * cp - z1 * sp;
  out[o + 2] = y * sp + z1 * cp;
}

function fibonacciSphere(i: number, count: number, out: Float32Array, o: number) {
  const y = 1 - (2 * (i + 0.5)) / count;
  const r = Math.sqrt(1 - y * y);
  const theta = i * GOLDEN_ANGLE;
  out[o] = Math.cos(theta) * r;
  out[o + 1] = y;
  out[o + 2] = Math.sin(theta) * r;
}

function latLon(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), -Math.cos(la) * Math.cos(lo)];
}

// connect — the world converging on London.

const GLOBE_RADIUS = 0.9;
const GLOBE_PITCH = -0.6;
const globeYaw = (t: number) => Math.sin(t * 0.22) * 0.55;

const LONDON = latLon(51.51, -0.13);
const CITIES: [number, number][] = [
  [37.77, -122.42], // San Francisco
  [40.71, -74.0], // New York
  [43.65, -79.38], // Toronto
  [19.43, -99.13], // Mexico City
  [-23.55, -46.63], // São Paulo
  [5.6, -0.19], // Accra
  [6.52, 3.38], // Lagos
  [-1.29, 36.82], // Nairobi
  [50.06, 19.94], // Kraków
  [12.97, 77.59], // Bengaluru
  [1.35, 103.82], // Singapore
  [35.68, 139.69], // Tokyo
];
const ARC_SAMPLES = 28;

/** Great-circle arcs from each city to London, lifted off the surface. */
const ARCS = CITIES.map(([lat, lon]) => {
  const a = latLon(lat, lon);
  const b = LONDON;
  const angle = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const lift = 0.04 + 0.2 * (angle / Math.PI);
  const points = new Float32Array(ARC_SAMPLES * 3);
  for (let k = 0; k < ARC_SAMPLES; k++) {
    const s = k / (ARC_SAMPLES - 1);
    const wa = Math.sin((1 - s) * angle) / Math.sin(angle);
    const wb = Math.sin(s * angle) / Math.sin(angle);
    const r = GLOBE_RADIUS * (1 + lift * Math.sin(Math.PI * s));
    points[k * 3] = (a[0] * wa + b[0] * wb) * r;
    points[k * 3 + 1] = (a[1] * wa + b[1] * wb) * r;
    points[k * 3 + 2] = (a[2] * wa + b[2] * wb) * r;
  }
  return points;
});

const scratch = new Float32Array(3);

function drawGlobeOverlay({ ctx, project, t, alpha, colors, dpr }: OverlayContext) {
  const yaw = globeYaw(t);
  ctx.lineWidth = 1.4 * dpr;
  ctx.lineCap = "round";

  ARCS.forEach((points, arcIndex) => {
    const head = ((t * 0.3 + arcIndex * 0.37) % 1.4) / 1.1;
    let prevX = 0;
    let prevY = 0;
    for (let k = 0; k < ARC_SAMPLES; k++) {
      rotate(scratch, 0, points[k * 3], points[k * 3 + 1], points[k * 3 + 2], yaw, GLOBE_PITCH);
      const p = project(scratch[0], scratch[1], scratch[2]);
      if (k > 0) {
        const s = k / (ARC_SAMPLES - 1);
        const trail = s <= head ? Math.max(0, 1 - (head - s) / 0.22) : 0;
        ctx.globalAlpha = alpha * p.depth * (0.16 + 0.84 * trail);
        ctx.strokeStyle = trail > 0 ? colors.primary : colors.muted;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      if (k === 0) {
        ctx.globalAlpha = alpha * p.depth;
        ctx.fillStyle = colors.primary;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * dpr * p.scale, 0, TAU);
        ctx.fill();
      }
      prevX = p.x;
      prevY = p.y;
    }
  });

  rotate(scratch, 0, LONDON[0] * GLOBE_RADIUS, LONDON[1] * GLOBE_RADIUS, LONDON[2] * GLOBE_RADIUS, yaw, GLOBE_PITCH);
  const london = project(scratch[0], scratch[1], scratch[2]);
  const pulse = (t * 0.8) % 1;
  ctx.strokeStyle = colors.success;
  ctx.globalAlpha = alpha * (1 - pulse);
  ctx.beginPath();
  ctx.arc(london.x, london.y, (4 + pulse * 18) * dpr, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colors.success;
  ctx.beginPath();
  ctx.arc(london.x, london.y, 4 * dpr, 0, TAU);
  ctx.fill();
  ctx.fillStyle = colors.muted;
  ctx.font = `500 ${11 * dpr}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText("London", london.x + 10 * dpr, london.y - 8 * dpr);
}

// align — the React atom, with particles flowing around its orbits.

const ORBIT_MINOR = 0.37;
const NUCLEUS_SHARE = 0.12;

// build — eight blocks snapping together and apart.

const BLOCK_HALF = 0.22;
const CUBE_CORNERS = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z])));
const CUBE_EDGES = CUBE_CORNERS.flatMap((a, i) =>
  CUBE_CORNERS.slice(i + 1)
    .filter((b) => a.filter((v, axis) => v !== b[axis]).length === 1)
    .map((b) => [a, b] as const),
);

export function createFormations(count: number, random: () => number): Formation[] {
  const nucleusCount = Math.round(count * NUCLEUS_SHARE);
  const ringAngle = new Float32Array(count);
  const ringJitter = new Float32Array(count * 2);
  const ringSpeed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const ring = i % 3;
    // A third of each orbit's particles bunch into a comet so the flow reads.
    const inComet = random() < 0.35;
    ringAngle[i] = inComet ? ring * 2.1 + (random() - 0.5) * 0.9 : random() * TAU;
    ringJitter[i * 2] = (random() - 0.5) * 0.06;
    ringJitter[i * 2 + 1] = (random() - 0.5) * 0.06;
    ringSpeed[i] = 0.55 + random() * 0.08;
  }

  const blockEdgeCount = CUBE_CORNERS.length * CUBE_EDGES.length;
  const pointsPerEdge = Math.ceil(count / blockEdgeCount);

  return [
    {
      id: "connect",
      place(i, t, out, o) {
        fibonacciSphere(i, count, out, o);
        rotate(out, o, out[o] * GLOBE_RADIUS, out[o + 1] * GLOBE_RADIUS, out[o + 2] * GLOBE_RADIUS, globeYaw(t), GLOBE_PITCH);
      },
      overlay: drawGlobeOverlay,
    },
    {
      id: "align",
      place(i, t, out, o) {
        const yaw = Math.sin(t * 0.35) * 0.6;
        const pitch = Math.sin(t * 0.27) * 0.25;
        if (i < nucleusCount) {
          fibonacciSphere(i, nucleusCount, out, o);
          const r = 0.13 * (1 + 0.08 * Math.sin(t * 2.4));
          rotate(out, o, out[o] * r, out[o + 1] * r, out[o + 2] * r, yaw + t * 0.5, pitch);
          return;
        }
        const ring = i % 3;
        const theta = ringAngle[i] + t * ringSpeed[i];
        const ex = Math.cos(theta) * (0.98 + ringJitter[i * 2]);
        const ey = Math.sin(theta) * ORBIT_MINOR * (1 + ringJitter[i * 2]);
        const tilt = (ring * Math.PI) / 3;
        const c = Math.cos(tilt);
        const s = Math.sin(tilt);
        rotate(out, o, ex * c - ey * s, ex * s + ey * c, ringJitter[i * 2 + 1], yaw, pitch);
      },
    },
    {
      id: "build",
      place(i, t, out, o) {
        const block = i % CUBE_CORNERS.length;
        const [a, b] = CUBE_EDGES[Math.floor(i / CUBE_CORNERS.length) % CUBE_EDGES.length];
        const p = Math.floor(i / blockEdgeCount) / Math.max(1, pointsPerEdge - 1);
        const phase = 0.5 + 0.5 * Math.cos(t * 0.9 - block * 0.18);
        const offset = BLOCK_HALF + 0.015 + 0.2 * phase ** 4;
        const center = CUBE_CORNERS[block];
        rotate(
          out,
          o,
          center[0] * offset + (a[0] + (b[0] - a[0]) * p) * BLOCK_HALF,
          center[1] * offset + (a[1] + (b[1] - a[1]) * p) * BLOCK_HALF,
          center[2] * offset + (a[2] + (b[2] - a[2]) * p) * BLOCK_HALF,
          t * 0.4 + 0.6,
          -0.55,
        );
      },
    },
    {
      id: "share",
      place(i, t, out, o) {
        const r = 1.08 * Math.sqrt((i + 0.5) / count);
        const theta = i * GOLDEN_ANGLE;
        const y = 0.2 * Math.sin(r * 9 - t * 3) * (1 - r * 0.55);
        rotate(out, o, Math.cos(theta) * r, y, Math.sin(theta) * r, t * 0.12, -0.75);
      },
    },
  ];
}
