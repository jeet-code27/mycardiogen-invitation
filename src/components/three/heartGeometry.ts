/**
 * Procedural point clouds for the 3D scene: an anatomical-ish heart surface built from the
 * implicit heart equation (x² + 9/4·y² + z² − 1)³ − x²z³ − 9/80·y²z³ = 0 (z up, y depth),
 * glowing "veins" traced across that surface, and a DNA double helix wound into a ring.
 */

type Vec3 = [number, number, number];

function heartF(x: number, y: number, z: number): number {
  const a = x * x + 2.25 * y * y + z * z - 1;
  return a * a * a - x * x * z * z * z - 0.1125 * y * y * z * z * z;
}

/** Deterministic PRNG so the heart looks identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomDir(rand: () => number): Vec3 {
  const u = rand() * 2 - 1;
  const th = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th), s * Math.sin(th), u];
}

/** Distance from the origin (which is inside the heart) to the surface along `d`. */
function surfaceDistance(d: Vec3): number {
  const step = 0.02;
  let prev = 0;
  for (let t = step; t < 2; t += step) {
    if (heartF(d[0] * t, d[1] * t, d[2] * t) > 0) {
      let lo = prev;
      let hi = t;
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        if (heartF(d[0] * mid, d[1] * mid, d[2] * mid) > 0) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    }
    prev = t;
  }
  return 1;
}

const normalize = (v: Vec3): Vec3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export interface PointCloud {
  positions: Float32Array;
  random: Float32Array;
  kind: Float32Array; // 0 interior haze, 1 surface, 2 vein
  progress: Float32Array; // position along a vein (0..1), for travelling pulses
  count: number;
}

export function buildHeart(): PointCloud {
  const rand = mulberry32(28112026);
  const SURFACE = 7000;
  const INTERIOR = 2400;
  const VEINS = 18;
  const VEIN_STEPS = 95;
  const count = SURFACE + INTERIOR + VEINS * VEIN_STEPS;

  const positions = new Float32Array(count * 3);
  const random = new Float32Array(count);
  const kind = new Float32Array(count);
  const progress = new Float32Array(count);
  let i = 0;

  // Formula space has z up / y depth; three.js has y up / z depth.
  const push = (p: Vec3, k: number, prog = 0) => {
    positions[i * 3] = p[0];
    positions[i * 3 + 1] = p[2] - 0.08;
    positions[i * 3 + 2] = p[1];
    random[i] = rand();
    kind[i] = k;
    progress[i] = prog;
    i++;
  };

  for (let n = 0; n < SURFACE; n++) {
    const d = randomDir(rand);
    const t = surfaceDistance(d) * (0.985 + rand() * 0.03);
    push([d[0] * t, d[1] * t, d[2] * t], 1);
  }

  for (let n = 0; n < INTERIOR; n++) {
    const d = randomDir(rand);
    const t = surfaceDistance(d) * Math.cbrt(rand()) * 0.95;
    push([d[0] * t, d[1] * t, d[2] * t], 0);
  }

  // Veins: smooth random walks across the surface, re-projected onto it at every step.
  for (let v = 0; v < VEINS; v++) {
    let dir = randomDir(rand);
    // Bias vein starts towards the front so they read clearly.
    dir = normalize([dir[0], -Math.abs(dir[1]) - 0.3, dir[2] + 0.35]);
    let heading = normalize(cross(dir, randomDir(rand)));
    for (let s = 0; s < VEIN_STEPS; s++) {
      const t = surfaceDistance(dir) * 1.012;
      push([dir[0] * t, dir[1] * t, dir[2] * t], 2, s / (VEIN_STEPS - 1));
      // Wander the heading a little, keep it tangent to the sphere of directions.
      const jitter = randomDir(rand);
      heading = normalize([
        heading[0] + jitter[0] * 0.35,
        heading[1] + jitter[1] * 0.35,
        heading[2] + jitter[2] * 0.35,
      ]);
      const tangent = normalize(cross(cross(dir, heading), dir));
      dir = normalize([
        dir[0] + tangent[0] * 0.028,
        dir[1] + tangent[1] * 0.028,
        dir[2] + tangent[2] * 0.028,
      ]);
    }
  }

  return { positions, random, kind, progress, count };
}

export interface ColoredCloud {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  random: Float32Array;
  count: number;
}

/** A DNA double helix bent into a ring that orbits the heart. */
export function buildDnaRing(radius = 2.35, tube = 0.17, turns = 16): ColoredCloud {
  const rand = mulberry32(2026);
  const STEPS = 760;
  const RUNG_EVERY = 8;
  const RUNG_POINTS = 7;
  const rungs = Math.floor(STEPS / RUNG_EVERY);
  const count = STEPS * 2 + rungs * RUNG_POINTS;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const random = new Float32Array(count);
  let i = 0;

  const push = (p: Vec3, c: Vec3, size: number) => {
    positions.set(p, i * 3);
    colors.set(c, i * 3);
    sizes[i] = size;
    random[i] = rand();
    i++;
  };

  const cyan: Vec3 = [0.6, 0.97, 1.0];
  const coral: Vec3 = [1.0, 0.25, 0.16];
  const cream: Vec3 = [1.0, 0.92, 0.82];

  const strandPoint = (t: number, phase: number): Vec3 => {
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const a = turns * t + phase;
    const off = tube * Math.cos(a);
    return [(radius + off) * ct, tube * Math.sin(a), (radius + off) * st];
  };

  for (let s = 0; s < STEPS; s++) {
    const t = (s / STEPS) * Math.PI * 2;
    push(strandPoint(t, 0), cyan, 1.15);
    push(strandPoint(t, Math.PI), coral, 1.15);
    if (s % RUNG_EVERY === 0) {
      const a = strandPoint(t, 0);
      const b = strandPoint(t, Math.PI);
      for (let r = 1; r <= RUNG_POINTS; r++) {
        const f = r / (RUNG_POINTS + 1);
        push(
          [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f],
          cream,
          0.55,
        );
      }
    }
  }

  return { positions, colors, sizes, random, count: i };
}

/** Faint drifting dust that gives the scene depth. */
export function buildDust(count = 650): ColoredCloud {
  const rand = mulberry32(7);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const random = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const d = randomDir(rand);
    const r = 3.5 + rand() * 7;
    positions.set([d[0] * r * 1.6, d[1] * r, d[2] * r - 2], i * 3);
    const warm = rand() > 0.35;
    colors.set(warm ? [1, 0.35, 0.25] : [1, 0.95, 0.85], i * 3);
    sizes[i] = 0.4 + rand() * 0.9;
    random[i] = rand();
  }
  return { positions, colors, sizes, random, count };
}

/** Lub-dub heartbeat envelope at ~68 bpm, 0..1. */
export function heartbeat(time: number): number {
  const period = 0.88;
  const ph = (time % period) / period;
  const lub = Math.exp(-(((ph - 0.04) / 0.045) ** 2));
  const dub = 0.6 * Math.exp(-(((ph - 0.24) / 0.05) ** 2));
  return Math.min(1, lub + dub);
}
