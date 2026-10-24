"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { buildDnaRing, buildDust, buildHeart, heartbeat } from "./heartGeometry";

const heartVertex = /* glsl */ `
  uniform float uTime;
  uniform float uBeat;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aRandom;
  attribute float aKind;
  attribute float aProgress;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 p = position;
    float isVein = step(1.5, aKind);
    float isHaze = 1.0 - step(0.5, aKind);
    p *= 1.0 + uBeat * (0.05 + 0.025 * step(0.5, aKind));
    p += 0.012 * vec3(sin(uTime * 1.7 + aRandom * 91.0), sin(uTime * 1.3 + aRandom * 57.0), cos(uTime * 1.5 + aRandom * 33.0)) * (1.0 - isVein);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float size = uSize * mix(0.55, 1.35, aRandom);
    size *= mix(1.0, 0.8, isVein);
    size *= mix(1.0, 1.5, isHaze);
    gl_PointSize = size * uPixelRatio * (1.0 + uBeat * 0.3) / -mv.z;

    vec3 red = vec3(1.0, 0.11, 0.06);
    vec3 hot = vec3(1.0, 0.6, 0.4);
    vec3 col = mix(red, hot, smoothstep(0.93, 1.0, aRandom));
    float alpha = (0.6 + 0.4 * sin(uTime * 2.3 + aRandom * 80.0)) * 0.72;

    if (isHaze > 0.5) {
      alpha *= 0.3;
      col = vec3(0.85, 0.05, 0.03);
    }
    if (isVein > 0.5) {
      float flow = pow(0.5 + 0.5 * sin(aProgress * 26.0 - uTime * 3.6 + aRandom * 0.3), 8.0);
      alpha = 0.32 + 1.3 * flow;
      col = mix(red, vec3(1.0, 0.86, 0.72), flow * 0.85);
    }

    vAlpha = alpha * (0.85 + uBeat * 0.45);
    vColor = col;
  }
`;

const pointFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = pow(1.0 - d * 2.0, 1.7);
    gl_FragColor = vec4(vColor, a * vAlpha * uOpacity);
  }
`;

const coloredVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aRandom;
  attribute float aSize;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aSize * uPixelRatio / -mv.z;
    vAlpha = 0.55 + 0.45 * sin(uTime * 1.6 + aRandom * 70.0);
    vColor = aColor;
  }
`;

/** Parameters for an additive, glowing point-sprite ShaderMaterial. */
function usePointMaterialParams(vertexShader: string, size: number) {
  const gl = useThree((s) => s.gl);
  return useMemo<THREE.ShaderMaterialParameters>(
    () => ({
      vertexShader,
      fragmentShader: pointFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uBeat: { value: 0 },
        uOpacity: { value: 0 },
        uSize: { value: size },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      },
    }),
    [vertexShader, size, gl],
  );
}

function makeGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.55)");
  g.addColorStop(0.5, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function Heart({ active }: { active: boolean }) {
  const cloud = useMemo(() => buildHeart(), []);
  const params = usePointMaterialParams(heartVertex, 26);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const heartRef = useRef<THREE.Points>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const coreRef = useRef<THREE.Sprite>(null);
  const ignite = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const beat = heartbeat(t);
    ignite.current = THREE.MathUtils.damp(ignite.current, active ? 1 : 0.35, 1.6, delta);

    const u = matRef.current?.uniforms;
    if (u) {
      u.uTime.value = t;
      u.uBeat.value = beat;
      u.uOpacity.value = ignite.current;
    }

    if (heartRef.current) {
      // Sway rather than spin: side-on, the heart reads as an oval.
      heartRef.current.rotation.y = Math.sin(t * 0.35) * 0.62;
      heartRef.current.rotation.z = Math.sin(t * 0.23) * 0.06;
      const s = 0.82 + ignite.current * 0.18;
      heartRef.current.scale.setScalar(s);
    }
    if (haloRef.current) {
      const s = (2.9 + beat * 0.7) * ignite.current;
      haloRef.current.scale.set(s, s, 1);
      (haloRef.current.material as THREE.SpriteMaterial).opacity = 0.32 + beat * 0.25;
    }
    if (coreRef.current) {
      const s = (0.75 + beat * 0.45) * ignite.current;
      coreRef.current.scale.set(s, s, 1);
      (coreRef.current.material as THREE.SpriteMaterial).opacity = 0.55 + beat * 0.45;
    }
  });

  return (
    <group>
      <sprite ref={haloRef} position={[0, 0.05, -0.3]}>
        <spriteMaterial
          map={glowTex}
          color="#ff2a14"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite ref={coreRef} position={[0.05, 0.15, 0.2]}>
        <spriteMaterial
          map={glowTex}
          color="#ffb48a"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <points ref={heartRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
          <bufferAttribute attach="attributes-aRandom" args={[cloud.random, 1]} />
          <bufferAttribute attach="attributes-aKind" args={[cloud.kind, 1]} />
          <bufferAttribute attach="attributes-aProgress" args={[cloud.progress, 1]} />
        </bufferGeometry>
        <shaderMaterial ref={matRef} args={[params]} />
      </points>
    </group>
  );
}

function DnaRing({ active }: { active: boolean }) {
  const cloud = useMemo(() => buildDnaRing(), []);
  const params = usePointMaterialParams(coloredVertex, 30);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const ref = useRef<THREE.Points>(null);
  const reveal = useRef(0);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    reveal.current = THREE.MathUtils.damp(reveal.current, active ? 1 : 0.2, 1.1, delta);
    const u = matRef.current?.uniforms;
    if (u) {
      u.uTime.value = t;
      u.uOpacity.value = reveal.current * 0.85;
    }
    if (ref.current) {
      ref.current.rotation.y = -t * 0.12;
      ref.current.scale.setScalar(0.75 + reveal.current * 0.25);
    }
  });

  return (
    <group rotation={[1.18, 0, 0.32]}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[cloud.colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[cloud.sizes, 1]} />
          <bufferAttribute attach="attributes-aRandom" args={[cloud.random, 1]} />
        </bufferGeometry>
        <shaderMaterial ref={matRef} args={[params]} />
      </points>
    </group>
  );
}

function Dust() {
  const cloud = useMemo(() => buildDust(), []);
  const params = usePointMaterialParams(coloredVertex, 22);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const u = matRef.current?.uniforms;
    if (u) {
      u.uTime.value = t;
      u.uOpacity.value = 0.45;
    }
    if (ref.current) ref.current.rotation.y = t * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[cloud.colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[cloud.sizes, 1]} />
        <bufferAttribute attach="attributes-aRandom" args={[cloud.random, 1]} />
      </bufferGeometry>
      <shaderMaterial ref={matRef} args={[params]} />
    </points>
  );
}

/** Places the heart beside the text on wide screens and above it on phones, with pointer parallax. */
function Rig({ children, layout }: { children: React.ReactNode; layout: "side" | "center" }) {
  const ref = useRef<THREE.Group>(null);
  const { viewport, camera } = useThree();

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const portrait = vp.width / vp.height < 0.9;
    let x = 0;
    let y = 0;
    let s = 1;
    if (layout === "side" && !portrait) {
      x = vp.width * 0.24;
      s = Math.min(1.1, vp.height / 5.4);
    } else if (layout === "side") {
      y = vp.height * 0.2;
      s = Math.min(0.78, vp.width / 3.6);
    } else {
      s = Math.min(0.95, vp.width / 4.6, vp.height / 5.2);
    }
    g.position.x = THREE.MathUtils.damp(g.position.x, x, 4, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, y, 4, delta);
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 4, delta));
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, state.pointer.x * 0.35, 2.5, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.2, 2.5, delta);
  });

  return <group ref={ref}>{children}</group>;
}

export default function HeartScene({
  active = true,
  layout = "side",
  className,
}: {
  active?: boolean;
  layout?: "side" | "center";
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  // Stop rendering while scrolled out of view to save battery on phones.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.5], fov: 40 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        fallback={<div className="h-full w-full bg-[radial-gradient(circle_at_70%_45%,rgba(253,41,27,0.35),transparent_45%)]" />}
      >
        <Dust />
        <Rig layout={layout}>
          <Heart active={active} />
          <DnaRing active={active} />
        </Rig>
      </Canvas>
    </div>
  );
}
