import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Float, Line, Preload, Sparkles, useTexture } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

type HomeAtlasMode = "atom" | "travel" | "scaffold" | "docking" | "docked";

interface HomeAtlasThreeSceneProps {
  logoUrl: string;
  mode?: HomeAtlasMode;
  progress?: number;
}

interface ControlMapThreeSceneProps {
  activeModule: string;
  topologyMode: boolean;
}

interface ScrollSceneProps {
  scrollProgress: number;
}

interface SceneShellProps {
  className: string;
  children: (reducedMotion: boolean) => ReactNode;
  cameraPosition?: [number, number, number];
}

const moduleColors: Record<string, string> = {
  flux: "#27c46a",
  catalysis: "#d99b4d",
  transport: "#9edbff",
};

const CARBON_ANCHOR = new THREE.Vector3(-1.95, -0.78, 1.08);
const SCAFFOLD_TARGET = new THREE.Vector3(0.12, -0.06, 0.78);
const SCAFFOLD_FOCUS_TARGET = new THREE.Vector3(0.1, 0.26, 1.08);

const fluidVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fluidFragmentShader = `
  uniform float uTime;
  uniform float uAlpha;
  uniform vec2 uPointer;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);

    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 turn = mat2(0.82, -0.57, 0.57, 0.82);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = turn * p * 2.03 + 17.13;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= 1.46;
    p += uPointer * 0.055;

    float t = uTime * 0.075;
    vec2 drift = vec2(t * -0.72, t * 0.48);
    vec2 q = vec2(
      fbm(p * 1.08 + drift + vec2(0.0, 3.7)),
      fbm(p * 1.04 - drift.yx + vec2(5.2, 1.1))
    );
    vec2 r = vec2(
      fbm(p * 1.82 + q * 2.35 + vec2(1.7, -0.8) + drift.yx),
      fbm(p * 1.66 + q * 2.1 + vec2(-2.6, 2.4) - drift)
    );

    vec2 warp = (q - 0.5) * 1.02 + (r - 0.5) * 0.64;
    float slowSwell = fbm(p * 0.34 + warp * 0.5 + vec2(t * 0.5, -t * 0.34));
    float waveA = sin((p.x + warp.x) * 2.95 + (p.y + warp.y) * 3.55 + t * 5.9);
    float waveB = sin((p.x - warp.y) * 4.85 - (p.y + warp.x) * 2.55 - t * 5.05);
    float waveC = sin(length(p + warp * 0.7) * 5.35 - t * 4.7);
    float waveMix = waveA * 0.48 + waveB * 0.34 + waveC * 0.18;
    float cytoplasm = 0.5 + 0.5 * waveMix;
    float filament = pow(1.0 - abs(waveMix), 2.35) * smoothstep(0.18, 0.88, slowSwell);
    float caustic = smoothstep(0.86, 0.99, cytoplasm) * (0.36 + slowSwell * 0.64);
    float undercurrent = smoothstep(0.62, 0.98, fbm(p * 1.18 + warp * 1.4 + vec2(-t * 1.25, t * 0.52)));
    float pulse = cytoplasm * 0.72 + slowSwell * 0.28;
    float vignette = smoothstep(1.72, 0.12, length(p * vec2(0.62, 0.92)));

    vec3 deep = vec3(0.0235, 0.1059, 0.4078);
    vec3 abyss = vec3(0.0039, 0.017, 0.082);
    vec3 electrophoresis = vec3(0.0706, 0.4039, 0.8471);
    vec3 ice = vec3(0.62, 0.86, 1.0);
    vec3 color = mix(abyss, deep, 0.58 + slowSwell * 0.34);
    color = mix(color, electrophoresis, 0.08 + pulse * 0.34);
    color += ice * filament * 0.145;
    color += electrophoresis * vignette * 0.035;
    color += vec3(0.08, 0.66, 1.0) * caustic * 0.072;
    color += vec3(0.15, 0.78, 0.42) * undercurrent * 0.038;
    color *= 0.78 + vignette * 0.26;

    float alpha = uAlpha * (0.72 + pulse * 0.24 + filament * 0.18 + caustic * 0.08);

    gl_FragColor = vec4(color, alpha);
  }
`;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function easeInOut(value: number) {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
}

function easeOutCubic(value: number) {
  const t = clamp01(value);

  return 1 - Math.pow(1 - t, 3);
}

function cubicBezierPoint(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  d: THREE.Vector3,
  t: number,
) {
  const u = 1 - t;

  return new THREE.Vector3(
    u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
    u * u * u * a.z + 3 * u * u * t * b.z + 3 * u * t * t * c.z + t * t * t * d.z,
  );
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    setReducedMotion(media.matches);

    const handleChange = () => setReducedMotion(media.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);

      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);

    return () => media.removeListener(handleChange);
  }, []);

  return reducedMotion;
}

function SceneShell({
  className,
  children,
  cameraPosition = [0, 0.15, 6.2],
}: SceneShellProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={className}>
      <Canvas
        camera={{ position: cameraPosition, fov: 42 }}
        dpr={[1, 1.75]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight color="#9edbff" intensity={1.25} position={[4, 5, 5]} />
        <pointLight color="#ffe84a" intensity={3.1} position={[1.4, 0.85, 2.2]} />
        <pointLight color="#1267d8" intensity={2.3} position={[-3.2, -1.2, 2.5]} />
        <Suspense fallback={null}>{children(reducedMotion)}</Suspense>
        {!reducedMotion && (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.72} luminanceThreshold={0.12} luminanceSmoothing={0.8} mipmapBlur />
            <Vignette eskil={false} offset={0.16} darkness={0.68} />
          </EffectComposer>
        )}
        <Preload all />
      </Canvas>
    </div>
  );
}

function ringPoints(radius: number, sides: number, phase = 0) {
  return Array.from({ length: sides + 1 }, (_, index) => {
    const angle = phase + (index / sides) * Math.PI * 2;

    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });
}

function FluidBackdrop({ reducedMotion, alpha = 0.38 }: { reducedMotion: boolean; alpha?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera, size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAlpha: { value: 0.38 },
      uPointer: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );
  const direction = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock, pointer }) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = reducedMotion ? 2.2 : clock.getElapsedTime();
    materialRef.current.uniforms.uAlpha.value = alpha;
    materialRef.current.uniforms.uPointer.value.set(pointer.x, pointer.y);

    if (!meshRef.current) {
      return;
    }

    const distance = 9.5;

    camera.getWorldDirection(direction);
    meshRef.current.position.copy(camera.position).add(direction.multiplyScalar(distance));
    meshRef.current.quaternion.copy(camera.quaternion);

    if (camera instanceof THREE.PerspectiveCamera) {
      const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
      const width = height * (size.width / Math.max(size.height, 1));

      meshRef.current.scale.set(width * 1.18, height * 1.18, 1);
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={-20}>
      <planeGeometry args={[1, 1, 48, 48]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={fluidVertexShader}
        fragmentShader={fluidFragmentShader}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function SteroidScaffold({
  reducedMotion,
  heroMode = false,
  focusMode = false,
}: {
  reducedMotion: boolean;
  heroMode?: boolean;
  focusMode?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const baseScale = heroMode ? (focusMode ? 0.78 : 1.1) : 0.82;
  const basePosition = heroMode ? (focusMode ? [0.04, 0.32, 1.04] : [0.12, -0.06, 0.78]) : [0.36, -0.12, 0.82];
  const hex = useMemo(() => ringPoints(0.38, 6, Math.PI / 6), []);
  const pent = useMemo(() => ringPoints(0.32, 5, Math.PI / 2), []);
  const rings = useMemo(
    () => [
      { points: hex, position: [-0.55, 0, 0] as [number, number, number] },
      { points: hex, position: [0, 0, 0] as [number, number, number] },
      { points: hex, position: [0.55, 0.02, 0] as [number, number, number] },
      { points: pent, position: [0.98, 0.02, 0] as [number, number, number] },
    ],
    [hex, pent],
  );
  const tubeRings = useMemo(
    () =>
      rings.map((ring) => ({
        curve: new THREE.CatmullRomCurve3(ring.points.slice(0, -1), true),
        position: ring.position,
      })),
    [rings],
  );

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    if (heroMode) {
      const targetY = Math.sin(time * 0.18) * (focusMode ? 0.18 : 0.12) + pointer.x * (focusMode ? 0.58 : 0.32);
      const targetX = Math.sin(time * 0.14) * (focusMode ? 0.12 : 0.08) - pointer.y * (focusMode ? 0.36 : 0.18);
      const targetZ = focusMode ? pointer.x * 0.08 : 0.04;

      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetY, 5, delta);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetX, 5, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, targetZ, 5, delta);

      if (focusMode) {
        const pulse = 1 + Math.sin(time * 1.05) * 0.018;

        groupRef.current.scale.setScalar(baseScale * pulse);
        groupRef.current.position.y = basePosition[1] + Math.sin(time * 0.72) * 0.035;
      }

      return;
    }

    groupRef.current.rotation.y = Math.sin(time * 0.32) * 0.2;
    groupRef.current.rotation.x = Math.sin(time * 0.24) * 0.1;
  });

  return (
    <group
      ref={groupRef}
      position={basePosition as [number, number, number]}
      rotation={[0.15, heroMode ? (focusMode ? -0.02 : -0.06) : -0.18, 0.04]}
      scale={baseScale}
    >
      {rings.map((ring, index) => (
        <group key={index} position={ring.position}>
          {heroMode ? (
            <mesh>
              <tubeGeometry args={[tubeRings[index].curve, 128, focusMode ? 0.032 : 0.026, 14, true]} />
              <meshPhysicalMaterial
                color="#f6faff"
                emissive="#9edbff"
                emissiveIntensity={focusMode ? 1.95 : 1.12}
                roughness={0.08}
                metalness={0.02}
                transmission={focusMode ? 0.58 : 0.48}
                thickness={focusMode ? 0.36 : 0.22}
                transparent
                opacity={focusMode ? 0.92 : 0.78}
                depthWrite={false}
                depthTest={!focusMode}
              />
            </mesh>
          ) : (
            <Line points={ring.points} color="#f6faff" lineWidth={2.4} transparent opacity={0.78} />
          )}
          {ring.points.slice(0, -1).map((point, nodeIndex) => (
            <mesh key={nodeIndex} position={point}>
              <sphereGeometry args={[heroMode ? (focusMode ? 0.042 : 0.038) : 0.028, 18, 18]} />
              <meshBasicMaterial
                color={index === 2 && nodeIndex === 1 ? "#d99b4d" : "#f6faff"}
                transparent
                opacity={heroMode ? (focusMode ? 1 : 0.92) : 1}
                blending={heroMode ? THREE.AdditiveBlending : THREE.NormalBlending}
                depthTest={!focusMode}
              />
            </mesh>
          ))}
        </group>
      ))}
      <Line
        points={[
          new THREE.Vector3(1.22, 0.08, 0),
          new THREE.Vector3(1.62, 0.28, 0.18),
          new THREE.Vector3(1.88, 0.08, 0.02),
        ]}
        color="#d99b4d"
        lineWidth={heroMode ? (focusMode ? 4.2 : 3.2) : 2}
        transparent
        opacity={heroMode ? (focusMode ? 1 : 0.92) : 0.8}
      />
      {heroMode ? (
        <mesh position={[0.48, 0.02, -0.08]} scale={[2.55, 1.02, 0.4]}>
          <sphereGeometry args={[0.54, 48, 24]} />
          <meshBasicMaterial color="#9edbff" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
}

function CellShell({ topologyMode }: { topologyMode: boolean }) {
  return (
    <group scale={topologyMode ? [1.08, 0.72, 0.52] : [1.5, 0.94, 0.72]}>
      <mesh>
        <sphereGeometry args={[1.55, 64, 32]} />
        <meshPhysicalMaterial
          color="#9edbff"
          roughness={0.22}
          metalness={0.02}
          transparent
          opacity={topologyMode ? 0.035 : 0.075}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.62, 48, 24]} />
        <meshBasicMaterial color="#9edbff" transparent opacity={0.09} wireframe />
      </mesh>
    </group>
  );
}

function LipidDroplet({ active, quiet = false }: { active: boolean; quiet?: boolean }) {
  return (
    <Float speed={quiet ? 0.75 : 1.2} rotationIntensity={0.08} floatIntensity={quiet ? 0.08 : 0.16}>
      <group position={[0.96, 0.12, 0.3]}>
        <mesh>
          <sphereGeometry args={[quiet ? 0.28 : 0.42, 48, 48]} />
          <meshBasicMaterial
            color="#ffe84a"
            transparent
            opacity={quiet ? (active ? 0.66 : 0.4) : active ? 0.95 : 0.74}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh scale={quiet ? 1.55 : 1.8}>
          <sphereGeometry args={[quiet ? 0.28 : 0.42, 48, 48]} />
          <meshBasicMaterial
            color="#ffe84a"
            transparent
            opacity={quiet ? (active ? 0.05 : 0.025) : active ? 0.16 : 0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

function Mitochondrion({ active }: { active: boolean }) {
  const cristae = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const x = -0.28 + index * 0.14;

        return [
          new THREE.Vector3(x, -0.11, 0.03),
          new THREE.Vector3(x + 0.08, 0.02, 0.09),
          new THREE.Vector3(x, 0.14, 0.03),
        ];
      }),
    [],
  );

  return (
    <group position={[-0.72, -0.54, 0.12]} rotation={[0.1, 0.25, -0.18]} scale={[1.05, 0.48, 0.42]}>
      <mesh>
        <sphereGeometry args={[0.56, 42, 24]} />
        <meshPhysicalMaterial
          color="#07158c"
          emissive={active ? "#1267d8" : "#061b68"}
          emissiveIntensity={active ? 0.9 : 0.38}
          roughness={0.36}
          transparent
          opacity={0.86}
        />
      </mesh>
      {cristae.map((points, index) => (
        <Line key={index} points={points} color="#9edbff" lineWidth={1.5} transparent opacity={0.62} />
      ))}
    </group>
  );
}

function ERRibbons({ active }: { active: boolean }) {
  const curves = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const z = -0.2 + index * 0.09;
        const y = 0.34 - index * 0.075;

        return new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.5, y, z),
          new THREE.Vector3(-0.92, y + 0.24, z + 0.08),
          new THREE.Vector3(-0.22, y - 0.1, z - 0.08),
          new THREE.Vector3(0.44, y + 0.16, z + 0.04),
          new THREE.Vector3(1.08, y - 0.04, z),
        ]);
      }),
    [],
  );

  return (
    <group>
      {curves.map((curve, index) => (
        <Line
          key={index}
          points={curve.getPoints(68)}
          color={active ? "#9edbff" : "#1267d8"}
          lineWidth={active ? 4.4 : 3}
          transparent
          opacity={active ? 0.78 : 0.45}
        />
      ))}
    </group>
  );
}

function CurveTrail({
  curve,
  color,
  reducedMotion,
  phase = 0,
  active = true,
  quiet = false,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  reducedMotion: boolean;
  phase?: number;
  active?: boolean;
  quiet?: boolean;
}) {
  const pointRefs = useRef<THREE.Mesh[]>([]);
  const points = useMemo(() => curve.getPoints(92), [curve]);
  const count = quiet ? (active ? 34 : 10) : active ? 72 : 24;
  const seeds = useMemo(() => Array.from({ length: count }, (_, index) => index / count), [count]);

  useFrame(({ clock }) => {
    if (reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    seeds.forEach((seed, index) => {
      const point = pointRefs.current[index];

      if (!point) {
        return;
      }

      const t = (seed + phase + time * 0.075) % 1;
      point.position.copy(curve.getPoint(t));
      point.scale.setScalar(quiet ? 0.68 + seed * 0.18 : 0.62 + Math.sin(t * Math.PI) * 0.46);
    });
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={active ? 2.1 : 1.2} transparent opacity={active ? 0.48 : 0.22} />
      {seeds.map((seed, index) => {
        const point = curve.getPoint((seed + phase) % 1);

        return (
          <mesh
            key={index}
            ref={(mesh) => {
              if (mesh) {
                pointRefs.current[index] = mesh;
              }
            }}
            position={point}
          >
            <sphereGeometry args={[quiet ? 0.018 : 0.025, 12, 12]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={quiet ? (active ? 0.58 : 0.18) : active ? 0.88 : 0.34}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ParticleField({ reducedMotion, quiet = false }: { reducedMotion: boolean; quiet?: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const buffer = new Float32Array(quiet ? 720 : 2400);

    for (let i = 0; i < buffer.length; i += 3) {
      const radius = 1.2 + Math.random() * 2.2;
      const angle = Math.random() * Math.PI * 2;

      buffer[i] = Math.cos(angle) * radius;
      buffer[i + 1] = (Math.random() - 0.5) * 2.2;
      buffer[i + 2] = Math.sin(angle) * 0.62 + (Math.random() - 0.5) * 0.9;
    }

    return buffer;
  }, [quiet]);

  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) {
      return;
    }

    ref.current.rotation.y = clock.getElapsedTime() * 0.035;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color="#9edbff"
        size={quiet ? 0.016 : 0.028}
        transparent
        opacity={quiet ? 0.22 : 0.42}
        depthWrite={false}
      />
    </points>
  );
}

function LogoTexturePlane({ logoUrl }: HomeAtlasThreeSceneProps) {
  const texture = useTexture(logoUrl);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  return (
    <mesh position={[-1.1, -1.14, -0.32]} rotation={[0, 0.06, 0]} scale={[1.1, 0.58, 1]}>
      <planeGeometry args={[2.25, 1.18]} />
      <meshBasicMaterial map={texture} transparent opacity={0.42} depthWrite={false} />
    </mesh>
  );
}

function TopologyNodes({ activeModule }: { activeModule: string }) {
  const nodes = [
    { id: "flux", position: [-1.2, -0.16, 0.18] as [number, number, number], color: "#27c46a" },
    { id: "catalysis", position: [0.15, 0.52, 0.28] as [number, number, number], color: "#d99b4d" },
    { id: "transport", position: [1.24, -0.18, 0.18] as [number, number, number], color: "#9edbff" },
  ];

  return (
    <group>
      <Line points={nodes.map((node) => new THREE.Vector3(...node.position))} color="#9edbff" lineWidth={1.6} transparent opacity={0.44} />
      <Line
        points={[
          new THREE.Vector3(...nodes[2].position),
          new THREE.Vector3(...nodes[0].position),
        ]}
        color="#ffe84a"
        lineWidth={1.2}
        transparent
        opacity={0.32}
      />
      {nodes.map((node) => {
        const active = activeModule === node.id;

        return (
          <group key={node.id} position={node.position}>
            <mesh>
              <sphereGeometry args={[active ? 0.14 : 0.095, 28, 28]} />
              <meshBasicMaterial color={node.color} transparent opacity={active ? 0.96 : 0.5} blending={THREE.AdditiveBlending} />
            </mesh>
            <mesh scale={active ? 2.7 : 1.9}>
              <sphereGeometry args={[0.14, 24, 24]} />
              <meshBasicMaterial color={node.color} transparent opacity={active ? 0.18 : 0.07} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ControlCameraRig({
  activeModule,
  topologyMode,
  reducedMotion,
  cinematic,
  posterMode,
}: {
  activeModule: string;
  topologyMode: boolean;
  reducedMotion: boolean;
  cinematic?: boolean;
  posterMode?: boolean;
}) {
  const { camera } = useThree();
  const playedIntroRef = useRef(false);

  useEffect(() => {
    const cameraTargets: Record<string, [number, number, number]> = {
      flux: [-1.45, 0.05, 4.55],
      catalysis: [0.62, 0.36, 4.2],
      transport: [1.38, -0.12, 4.65],
    };
    const targetPosition = topologyMode
      ? ([0, 0.28, 5.45] as [number, number, number])
      : posterMode
        ? ([0.12, 0.06, 5.7] as [number, number, number])
        : cameraTargets[activeModule];

    if (reducedMotion) {
      camera.position.set(...targetPosition);
      camera.lookAt(0, 0, 0);
      return undefined;
    }

    if (cinematic && !playedIntroRef.current) {
      playedIntroRef.current = true;
      camera.position.set(0.08, -0.04, 1.12);
      camera.lookAt(0, 0, 0);
    }

    const tween = gsap.to(camera.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
      duration: cinematic && playedIntroRef.current ? 2.1 : topologyMode ? 1.25 : 0.95,
      ease: "power3.out",
      onUpdate: () => camera.lookAt(0, 0, 0),
    });

    return () => {
      tween.kill();
    };
  }, [activeModule, camera, cinematic, posterMode, reducedMotion, topologyMode]);

  return null;
}

function CarbonSeedCluster({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const atoms = useMemo(
    () => [
      [-1.95, -0.78, 1.08, 0.065, "#27c46a"],
      [-1.75, -0.68, 0.92, 0.044, "#9edbff"],
      [-1.56, -0.52, 0.72, 0.034, "#f6faff"],
      [-1.32, -0.32, 0.58, 0.026, "#ffe84a"],
    ] as const,
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    groupRef.current.position.x = Math.sin(time * 1.15) * 0.04;
    groupRef.current.position.y = Math.cos(time * 0.95) * 0.025;
  });

  return (
    <group ref={groupRef}>
      <Line
        points={atoms.map(([x, y, z]) => new THREE.Vector3(x, y, z))}
        color="#27c46a"
        lineWidth={1.4}
        transparent
        opacity={0.42}
      />
      {atoms.map(([x, y, z, radius, color], index) => (
        <mesh key={index} position={[x, y, z]}>
          <sphereGeometry args={[radius, 20, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.92} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function CarbonAtomFocus({
  reducedMotion,
  opacity,
}: {
  reducedMotion: boolean;
  opacity: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const orbitRefs = useRef<THREE.Group[]>([]);

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, time * 0.18 + pointer.x * 0.28, 3.6, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, pointer.y * -0.18, 3.6, delta);
    groupRef.current.scale.setScalar(0.72 * (1 + Math.sin(time * 1.6) * 0.045));

    orbitRefs.current.forEach((orbit, index) => {
      orbit.rotation.z += delta * (0.42 + index * 0.18);
    });
  });

  return (
    <group ref={groupRef} position={CARBON_ANCHOR} scale={0.72}>
      <mesh>
        <sphereGeometry args={[0.13, 42, 42]} />
        <meshBasicMaterial color="#27c46a" transparent opacity={0.88 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh scale={2.25}>
        <sphereGeometry args={[0.13, 42, 42]} />
        <meshBasicMaterial color="#27c46a" transparent opacity={0.13 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <group
          key={index}
          ref={(group) => {
            if (group) {
              orbitRefs.current[index] = group;
            }
          }}
          rotation={[index === 1 ? Math.PI / 2 : 0.38, index === 2 ? Math.PI / 2 : 0.1, index * 0.72]}
        >
          <mesh>
            <torusGeometry args={[0.34, 0.0048, 8, 96]} />
            <meshBasicMaterial color={index === 2 ? "#ffe84a" : "#9edbff"} transparent opacity={0.72 * opacity} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <mesh position={[0.34, 0, 0]}>
            <sphereGeometry args={[0.026, 18, 18]} />
            <meshBasicMaterial color="#f6faff" transparent opacity={0.9 * opacity} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function HeroCameraRig({
  reducedMotion,
  mode,
  progress,
}: {
  reducedMotion: boolean;
  mode: HomeAtlasMode;
  progress: number;
}) {
  const { camera } = useThree();
  const lookAtRef = useRef(SCAFFOLD_TARGET.clone());
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetLook = useMemo(() => new THREE.Vector3(), []);
  const atomCamera = useMemo(() => CARBON_ANCHOR.clone().add(new THREE.Vector3(0.02, 0.015, 3.05)), []);
  const tunnelCameraA = useMemo(() => new THREE.Vector3(-1.58, -0.54, 1.62), []);
  const tunnelCameraB = useMemo(() => new THREE.Vector3(-0.38, 0.08, 2.72), []);
  const scaffoldCamera = useMemo(() => new THREE.Vector3(0.08, 0.02, 9.0), []);
  const dockedCamera = useMemo(() => new THREE.Vector3(0.08, 0.04, 7.35), []);

  useEffect(() => {
    const focusMode = mode === "scaffold" || mode === "docking";

    camera.position.copy(mode === "docked" ? dockedCamera : focusMode ? scaffoldCamera : atomCamera);
    lookAtRef.current.copy(mode === "docked" ? SCAFFOLD_TARGET : focusMode ? SCAFFOLD_FOCUS_TARGET : CARBON_ANCHOR);
    camera.lookAt(lookAtRef.current);
  }, [atomCamera, camera, dockedCamera, mode, scaffoldCamera]);

  useFrame(({ pointer }, delta) => {
    const travel = mode === "atom" ? 0 : mode === "travel" ? easeInOut(progress) : 1;
    const finalCamera = mode === "docked" ? dockedCamera : scaffoldCamera;
    const finalFov = mode === "scaffold" || mode === "docking" ? 42 : mode === "docked" ? 42 : 38 - travel * 3;

    if (mode === "docked") {
      targetPosition.copy(dockedCamera);
    } else {
      targetPosition.copy(cubicBezierPoint(atomCamera, tunnelCameraA, tunnelCameraB, finalCamera, easeOutCubic(travel)));
    }

    targetLook.copy(CARBON_ANCHOR).lerp(mode === "scaffold" || mode === "docking" ? SCAFFOLD_FOCUS_TARGET : SCAFFOLD_TARGET, easeInOut(travel));

    if (mode === "scaffold" || mode === "docking" || mode === "docked") {
      const isFocus = mode === "scaffold" || mode === "docking";

      targetLook.x += pointer.x * (isFocus ? 0.16 : 0.08);
      targetLook.y += pointer.y * (isFocus ? 0.1 : 0.05);
      targetPosition.x += pointer.x * (isFocus ? 0.11 : 0.04);
      targetPosition.y += pointer.y * (isFocus ? 0.06 : 0.03);
    }

    const damp = reducedMotion ? 1 : 1 - Math.exp(-delta * (mode === "travel" ? 8.5 : 5.2));

    camera.position.lerp(targetPosition, damp);
    lookAtRef.current.lerp(targetLook, damp);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, finalFov, reducedMotion ? 100 : 4.4, delta);
      camera.updateProjectionMatrix();
    }

    camera.lookAt(lookAtRef.current);
  });

  return null;
}

function HeroCellMembrane({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, delta) => {
    if (!ref.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, pointer.x * 0.08 + Math.sin(time * 0.1) * 0.04, 3, delta);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, -pointer.y * 0.045, 3, delta);
  });

  return (
    <group ref={ref} scale={[1.52, 0.9, 0.66]}>
      <mesh>
        <sphereGeometry args={[1.55, 96, 48]} />
        <meshPhysicalMaterial
          color="#9edbff"
          roughness={0.18}
          metalness={0.02}
          transparent
          opacity={0.045}
          transmission={0.24}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.58, 52, 26]} />
        <meshBasicMaterial color="#9edbff" transparent opacity={0.075} wireframe depthWrite={false} />
      </mesh>
    </group>
  );
}

function InstancedCurveParticles({
  curve,
  color,
  count,
  speed,
  reducedMotion,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  count: number;
  speed: number;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        offset: (index / count + (((index * 37) % 97) / 97) * (1 / count) * 4) % 1,
        lane: (index % 7) * 0.012 - 0.036,
        scale: 0.58 + ((index * 17) % 11) / 22,
      })),
    [count],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const time = reducedMotion ? 1.8 : clock.getElapsedTime();

    seeds.forEach((seed, index) => {
      const t = (seed.offset + time * speed) % 1;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize().multiplyScalar(seed.lane);

      dummy.position.copy(point).add(normal);
      dummy.scale.setScalar(0.65 + seed.scale * (0.4 + Math.sin(t * Math.PI) * 0.1));
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.014, 10, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.66} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function HeroMetabolicFlux({ reducedMotion }: { reducedMotion: boolean }) {
  const curves = useMemo(
    () => ({
      carbon: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.45, -0.92, 0.78),
        new THREE.Vector3(-1.82, -0.58, 0.68),
        new THREE.Vector3(-1.22, -0.1, 0.56),
        new THREE.Vector3(-0.45, 0.06, 0.72),
        new THREE.Vector3(0.12, -0.04, 0.88),
      ]),
      er: new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.62, 0.42, 0.24),
        new THREE.Vector3(-0.82, 0.72, 0.48),
        new THREE.Vector3(-0.18, 0.28, 0.78),
        new THREE.Vector3(0.46, 0.22, 0.86),
        new THREE.Vector3(0.92, 0.06, 0.7),
      ]),
      export: new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.05, -0.32, 0.62),
        new THREE.Vector3(0.6, -0.64, 0.78),
        new THREE.Vector3(1.25, -0.5, 0.66),
        new THREE.Vector3(1.92, -0.12, 0.44),
      ]),
    }),
    [],
  );

  return (
    <group>
      <Line points={curves.carbon.getPoints(110)} color="#27c46a" lineWidth={1.2} transparent opacity={0.38} />
      <Line points={curves.er.getPoints(110)} color="#9edbff" lineWidth={1.5} transparent opacity={0.42} />
      <Line points={curves.export.getPoints(110)} color="#d99b4d" lineWidth={1.1} transparent opacity={0.34} />
      <InstancedCurveParticles curve={curves.carbon} color="#27c46a" count={280} speed={0.055} reducedMotion={reducedMotion} />
      <InstancedCurveParticles curve={curves.er} color="#9edbff" count={340} speed={0.042} reducedMotion={reducedMotion} />
      <InstancedCurveParticles curve={curves.export} color="#d99b4d" count={220} speed={0.036} reducedMotion={reducedMotion} />
    </group>
  );
}

function HeroOrganelleField({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group scale={0.78}>
      <group position={[-0.08, 0.02, 0.36]} scale={0.9}>
        <ERRibbons active />
      </group>
      <group position={[-0.1, -0.03, 0.18]} scale={0.94}>
        <Mitochondrion active />
      </group>
      <group position={[0.28, 0.0, 0.14]} scale={0.68}>
        <LipidDroplet active quiet />
      </group>
      <CarbonSeedCluster reducedMotion={reducedMotion} />
    </group>
  );
}

function HeroAtlasModel({
  reducedMotion,
  mode,
  progress,
}: {
  reducedMotion: boolean;
  mode: HomeAtlasMode;
  progress: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const reveal = mode === "atom" ? 0 : mode === "travel" ? easeInOut(progress) : 1;
  const atomOpacity = mode === "atom" ? 1 : clamp01(1 - progress * 2.4);
  const sceneVisible = reveal > 0.035;
  const scaffoldFocus = mode === "scaffold" || mode === "docking";
  const targetScale = scaffoldFocus ? 0.78 : mode === "travel" ? 0.5 + reveal * 0.68 : 1;

  useFrame(({ pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, pointer.x * (mode === "scaffold" ? 0.12 : 0.08), 4, delta);
    rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, pointer.y * (mode === "scaffold" ? 0.072 : 0.045), 4, delta);
    rootRef.current.scale.setScalar(THREE.MathUtils.damp(rootRef.current.scale.x, targetScale, 4, delta));
  });

  return (
    <>
      <FluidBackdrop
        reducedMotion={reducedMotion}
        alpha={mode === "atom" ? 0.76 : mode === "travel" ? 0.72 + reveal * 0.16 : 0.86}
      />
      <HeroCameraRig reducedMotion={reducedMotion} mode={mode} progress={progress} />
      <CarbonAtomFocus reducedMotion={reducedMotion} opacity={atomOpacity} />
      <group ref={rootRef} position={[0, 0, 0]} rotation={[-0.03, -0.08, 0]} scale={targetScale} visible={sceneVisible}>
        <HeroCellMembrane reducedMotion={reducedMotion} />
        <group position={scaffoldFocus ? [0, -0.22, -0.46] : [0, 0, 0]} scale={scaffoldFocus ? 0.72 : 1}>
          <HeroOrganelleField reducedMotion={reducedMotion} />
          <HeroMetabolicFlux reducedMotion={reducedMotion} />
        </group>
        <group position={scaffoldFocus ? [0, 0.02, 0.42] : [0, 0, 0]}>
          <SteroidScaffold reducedMotion={reducedMotion} heroMode focusMode={scaffoldFocus} />
          <mesh position={[1.08, 0.05, 0.62]} scale={1.42}>
            <sphereGeometry args={[0.22, 36, 36]} />
            <meshBasicMaterial color="#d99b4d" transparent opacity={0.11} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </>
  );
}

function CellFactoryModel({
  activeModule = "catalysis",
  topologyMode = false,
  reducedMotion,
  logoUrl,
  cinematic = false,
  posterMode = false,
}: {
  activeModule?: string;
  topologyMode?: boolean;
  reducedMotion: boolean;
  logoUrl?: string;
  cinematic?: boolean;
  posterMode?: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const fluxCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.0, -0.78, 0.25),
        new THREE.Vector3(-1.15, -0.12, 0.42),
        new THREE.Vector3(-0.28, 0.26, 0.35),
        new THREE.Vector3(0.9, 0.16, 0.3),
      ]),
    [],
  );
  const catalysisCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.42, 0.45, 0.18),
        new THREE.Vector3(-0.6, 0.68, 0.34),
        new THREE.Vector3(0.36, 0.24, 0.62),
        new THREE.Vector3(1.24, 0.05, 0.38),
      ]),
    [],
  );
  const transportCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.72, -0.56, 0.16),
        new THREE.Vector3(-0.06, -1.0, 0.34),
        new THREE.Vector3(0.82, -0.72, 0.44),
        new THREE.Vector3(1.78, -0.16, 0.22),
      ]),
    [],
  );

  useFrame(({ clock, pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();
    const catalyticKick = !posterMode && activeModule === "catalysis" ? Math.sin(time * 18) * 0.008 : 0;
    const baseY = posterMode ? -0.12 : -0.18;
    const baseX = posterMode ? -0.04 : -0.05;
    const targetY = Math.sin(time * 0.13) * (posterMode ? 0.1 : 0.18) + pointer.x * (posterMode ? 0.28 : 0.08) + baseY;
    const targetX = baseX + Math.sin(time * 0.1) * (posterMode ? 0.045 : 0.08) - pointer.y * (posterMode ? 0.11 : 0.04);

    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetY, posterMode ? 4.8 : 3.2, delta);
    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetX, posterMode ? 4.2 : 3, delta);
    rootRef.current.position.x = THREE.MathUtils.damp(rootRef.current.position.x, catalyticKick, 6, delta);
    rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, catalyticKick * 0.55, 6, delta);
  });

  return (
    <group ref={rootRef} rotation={[-0.08, posterMode ? -0.12 : -0.18, 0]} scale={topologyMode ? 1.18 : posterMode ? 0.76 : 1}>
      <ControlCameraRig
        activeModule={activeModule}
        topologyMode={topologyMode}
        reducedMotion={reducedMotion}
        cinematic={cinematic}
        posterMode={posterMode}
      />
      <CellShell topologyMode={topologyMode} />
      <ParticleField reducedMotion={reducedMotion} quiet={posterMode} />
      {topologyMode ? (
        <TopologyNodes activeModule={activeModule} />
      ) : (
        <>
          <ERRibbons active={activeModule === "catalysis"} />
          <Mitochondrion active={activeModule === "transport"} />
          <LipidDroplet active={activeModule === "flux"} />
          <SteroidScaffold reducedMotion={reducedMotion} />
          <CurveTrail
            curve={fluxCurve}
            color={moduleColors.flux}
            reducedMotion={reducedMotion}
            active={activeModule === "flux"}
            quiet={posterMode}
          />
          <CurveTrail
            curve={catalysisCurve}
            color={moduleColors.catalysis}
            reducedMotion={reducedMotion}
            phase={0.2}
            active={activeModule === "catalysis"}
            quiet={posterMode}
          />
          <CurveTrail
            curve={transportCurve}
            color={moduleColors.transport}
            reducedMotion={reducedMotion}
            phase={0.42}
            active={activeModule === "transport"}
            quiet={posterMode}
          />
          {logoUrl && !posterMode ? <LogoTexturePlane logoUrl={logoUrl} /> : null}
          {cinematic ? <CarbonSeedCluster reducedMotion={reducedMotion} /> : null}
        </>
      )}
      {!topologyMode && !posterMode && (
        <Sparkles count={52} scale={[4.2, 2.2, 1.5]} size={2.1} speed={reducedMotion ? 0 : 0.34} color="#9edbff" />
      )}
    </group>
  );
}

export function HomeAtlasThreeScene({ logoUrl, mode = "docked", progress = 1 }: HomeAtlasThreeSceneProps) {
  void logoUrl;

  return (
    <SceneShell
      className="atlas-three-scene"
      cameraPosition={mode === "docked" ? [0.08, 0.04, 7.35] : [-1.93, -0.765, 2.11]}
    >
      {(reducedMotion) => <HeroAtlasModel reducedMotion={reducedMotion} mode={mode} progress={progress} />}
    </SceneShell>
  );
}

export function ControlMapThreeScene({ activeModule, topologyMode }: ControlMapThreeSceneProps) {
  return (
    <SceneShell className="control-three-scene" cameraPosition={[0, 0.05, 5.6]}>
      {(reducedMotion) => (
        <CellFactoryModel activeModule={activeModule} topologyMode={topologyMode} reducedMotion={reducedMotion} />
      )}
    </SceneShell>
  );
}

function RouteComparisonModel({
  reducedMotion,
  scrollProgress,
}: {
  reducedMotion: boolean;
  scrollProgress: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const fold = easeInOut(scrollProgress);
  const newRouteCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.15, -0.62, 0.18),
        new THREE.Vector3(0.84, -0.08, 0.46),
        new THREE.Vector3(1.35, 0.42, 0.26),
        new THREE.Vector3(2.02, 0.08, 0.16),
      ]),
    [],
  );

  useFrame(({ clock }) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    rootRef.current.rotation.y = Math.sin(time * 0.16) * 0.18;
  });

  return (
    <group ref={rootRef} rotation={[-0.02 + fold * 0.18, -0.2 + fold * 0.42, 0]}>
      <group
        position={[-1.72 - fold * 0.22, -0.22 - fold * 0.42, -fold * 0.22]}
        rotation={[0.08 + fold * 0.42, 0.32, -0.08 - fold * 0.38]}
      >
        {Array.from({ length: 5 }, (_, index) => (
          <mesh key={index} position={[0, index * 0.18, -index * 0.04]} rotation={[0.08, 0.12 * index, 0]}>
            <boxGeometry args={[0.86 - index * 0.05, 0.1, 0.58]} />
            <meshStandardMaterial
              color="#7a829a"
              roughness={0.92}
              metalness={0.05}
              transparent
              opacity={0.36}
            />
          </mesh>
        ))}
        <Sparkles count={18} scale={[1.2, 0.9, 0.6]} size={1.2} speed={reducedMotion ? 0 : 0.18} color="#9ca3b8" />
      </group>

      <group position={[0, 0.03, 0.18]} scale={0.88}>
        <SteroidScaffold reducedMotion={reducedMotion} />
      </group>

      <group position={[1.25, -0.08 + fold * 0.18, 0.05 + fold * 0.2]} scale={0.78 + fold * 0.16}>
        <CellShell topologyMode={false} />
        <ERRibbons active />
        <LipidDroplet active />
        <CurveTrail curve={newRouteCurve} color="#27c46a" reducedMotion={reducedMotion} active />
      </group>

      <Line
        points={[
          new THREE.Vector3(-1.22, 0.08, 0.08),
          new THREE.Vector3(-0.55, 0.25, 0.24),
          new THREE.Vector3(0.1, 0.1, 0.32),
          new THREE.Vector3(0.82, 0.24, 0.32),
          new THREE.Vector3(1.5, 0.02, 0.2),
        ]}
        color="#ffe84a"
        lineWidth={1.8}
        transparent
        opacity={0.58}
      />
    </group>
  );
}

function EvidenceHelixModel({
  reducedMotion,
  scrollProgress,
}: {
  reducedMotion: boolean;
  scrollProgress: number;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const descent = easeInOut(scrollProgress);
  const activeIndex = Math.min(3, Math.max(0, Math.round(scrollProgress * 3)));
  const helixA = useMemo(
    () =>
      Array.from({ length: 150 }, (_, index) => {
        const t = index / 149;
        const angle = t * Math.PI * 7.2;

        return new THREE.Vector3(Math.cos(angle) * 0.96, 1.78 - t * 3.56, Math.sin(angle) * 0.96);
      }),
    [],
  );
  const helixB = useMemo(
    () =>
      helixA.map((point, index) => {
        const t = index / (helixA.length - 1);
        const angle = t * Math.PI * 7.2 + Math.PI;

        return new THREE.Vector3(Math.cos(angle) * 0.96, point.y, Math.sin(angle) * 0.96);
      }),
    [helixA],
  );

  useFrame(({ clock }) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    rootRef.current.rotation.y = clock.getElapsedTime() * 0.16;
  });

  return (
    <group
      ref={rootRef}
      position={[0, -0.18 + descent * 1.32, 0]}
      rotation={[0.12, -0.42 + descent * Math.PI * 1.8, 0]}
      scale={1.28}
    >
      <mesh>
        <cylinderGeometry args={[0.042, 0.042, 4.35, 32]} />
        <meshBasicMaterial color="#9edbff" transparent opacity={0.42} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh scale={[7, 1, 7]}>
        <sphereGeometry args={[0.1, 32, 16]} />
        <meshBasicMaterial color="#1267d8" transparent opacity={0.06} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <Line points={helixA} color="#9edbff" lineWidth={2.45} transparent opacity={0.82} />
      <Line points={helixB} color="#ffe84a" lineWidth={1.75} transparent opacity={0.66} />
      {helixA.filter((_, index) => index % 10 === 0).map((point, index) => (
        <Line
          key={index}
          points={[point, helixB[index * 10] || point]}
          color={index % 2 ? "#27c46a" : "#d99b4d"}
          lineWidth={1}
          transparent
          opacity={0.34}
        />
      ))}
      {["01", "02", "03", "04"].map((label, index) => {
        const angle = index * Math.PI * 1.82 + 0.4 + descent * Math.PI * 1.8;
        const isActive = activeIndex === index;

        return (
          <group key={label} position={[Math.cos(angle) * 1.58, 1.18 - index * 0.76, Math.sin(angle) * 1.58]}>
            <mesh>
              <boxGeometry args={[isActive ? 0.72 : 0.58, 0.28, 0.035]} />
              <meshBasicMaterial color={isActive ? "#ffe84a" : "#f6faff"} transparent opacity={isActive ? 0.28 : 0.13} />
            </mesh>
            <mesh position={[-0.22, 0, 0.04]}>
              <sphereGeometry args={[isActive ? 0.075 : 0.055, 18, 18]} />
              <meshBasicMaterial color={isActive ? "#ffe84a" : index === 1 ? "#d99b4d" : "#9edbff"} transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function RouteComparisonThreeScene({ scrollProgress }: ScrollSceneProps) {
  return (
    <SceneShell className="route-three-scene" cameraPosition={[0, 0.1, 5.4]}>
      {(reducedMotion) => <RouteComparisonModel reducedMotion={reducedMotion} scrollProgress={scrollProgress} />}
    </SceneShell>
  );
}

export function EvidenceSpiralThreeScene({ scrollProgress }: ScrollSceneProps) {
  return (
    <SceneShell className="evidence-three-scene" cameraPosition={[0, 0.02, 4.5]}>
      {(reducedMotion) => <EvidenceHelixModel reducedMotion={reducedMotion} scrollProgress={scrollProgress} />}
    </SceneShell>
  );
}
