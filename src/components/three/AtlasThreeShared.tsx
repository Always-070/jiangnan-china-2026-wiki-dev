/* eslint-disable react-refresh/only-export-components */
import * as THREE from "three";
import { Float, Line, Preload } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type HomeAtlasMode =
  | "atom"
  | "travel"
  | "scaffold"
  | "docking"
  | "docked";

export interface HomeAtlasThreeSceneProps {
  logoUrl: string;
  mode?: HomeAtlasMode;
  progress?: number;
}

export interface ScrollSceneProps {
  scrollProgress: number;
}

export interface SceneShellProps {
  className: string;
  children: (reducedMotion: boolean) => ReactNode;
  cameraPosition?: [number, number, number];
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
}

export const fluidVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fluidFragmentShader = `
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

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

export function easeInOut(value: number) {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
}

export function easeOutCubic(value: number) {
  const t = clamp01(value);

  return 1 - Math.pow(1 - t, 3);
}

export function usePrefersReducedMotion() {
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

export function SceneShell({
  className,
  children,
  cameraPosition = [0, 0.15, 6.2],
  bloomIntensity = 0.72,
  bloomThreshold = 0.12,
  bloomSmoothing = 0.8,
}: SceneShellProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className={className}>
      <Canvas
        camera={{ position: cameraPosition, fov: 42 }}
        dpr={[1, 1.75]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          color="#9edbff"
          intensity={1.25}
          position={[4, 5, 5]}
        />
        <pointLight
          color="#ffe84a"
          intensity={3.1}
          position={[1.4, 0.85, 2.2]}
        />
        <pointLight
          color="#1267d8"
          intensity={2.3}
          position={[-3.2, -1.2, 2.5]}
        />
        <Suspense fallback={null}>{children(reducedMotion)}</Suspense>
        {!reducedMotion && (
          <EffectComposer multisampling={0}>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={bloomThreshold}
              luminanceSmoothing={bloomSmoothing}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.16} darkness={0.68} />
          </EffectComposer>
        )}
        <Preload all />
      </Canvas>
    </div>
  );
}

export function ringPoints(radius: number, sides: number, phase = 0) {
  return Array.from({ length: sides + 1 }, (_, index) => {
    const angle = phase + (index / sides) * Math.PI * 2;

    return new THREE.Vector3(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0,
    );
  });
}

export function FluidBackdrop({
  reducedMotion,
  alpha = 0.38,
}: {
  reducedMotion: boolean;
  alpha?: number;
}) {
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

    materialRef.current.uniforms.uTime.value = reducedMotion
      ? 2.2
      : clock.getElapsedTime();
    materialRef.current.uniforms.uAlpha.value = alpha;
    materialRef.current.uniforms.uPointer.value.set(pointer.x, pointer.y);

    if (!meshRef.current) {
      return;
    }

    const distance = 9.5;

    camera.getWorldDirection(direction);
    meshRef.current.position
      .copy(camera.position)
      .add(direction.multiplyScalar(distance));
    meshRef.current.quaternion.copy(camera.quaternion);

    if (camera instanceof THREE.PerspectiveCamera) {
      const height =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
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

export function SteroidScaffold({
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
  const basePosition = heroMode
    ? focusMode
      ? [0.04, 0.32, 1.04]
      : [0.12, -0.06, 0.78]
    : [0.36, -0.12, 0.82];
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
      const targetY =
        Math.sin(time * 0.18) * (focusMode ? 0.18 : 0.12) +
        pointer.x * (focusMode ? 0.58 : 0.32);
      const targetX =
        Math.sin(time * 0.14) * (focusMode ? 0.12 : 0.08) -
        pointer.y * (focusMode ? 0.36 : 0.18);
      const targetZ = focusMode ? pointer.x * 0.08 : 0.04;

      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetY,
        5,
        delta,
      );
      groupRef.current.rotation.x = THREE.MathUtils.damp(
        groupRef.current.rotation.x,
        targetX,
        5,
        delta,
      );
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        targetZ,
        5,
        delta,
      );

      if (focusMode) {
        const pulse = 1 + Math.sin(time * 1.05) * 0.018;

        groupRef.current.scale.setScalar(baseScale * pulse);
        groupRef.current.position.y =
          basePosition[1] + Math.sin(time * 0.72) * 0.035;
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
              <tubeGeometry
                args={[
                  tubeRings[index].curve,
                  128,
                  focusMode ? 0.032 : 0.026,
                  14,
                  true,
                ]}
              />
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
            <Line
              points={ring.points}
              color="#f6faff"
              lineWidth={2.4}
              transparent
              opacity={0.78}
            />
          )}
          {ring.points.slice(0, -1).map((point, nodeIndex) => (
            <mesh key={nodeIndex} position={point}>
              <sphereGeometry
                args={[heroMode ? (focusMode ? 0.042 : 0.038) : 0.028, 18, 18]}
              />
              <meshBasicMaterial
                color={index === 2 && nodeIndex === 1 ? "#d99b4d" : "#f6faff"}
                transparent
                opacity={heroMode ? (focusMode ? 1 : 0.92) : 1}
                blending={
                  heroMode ? THREE.AdditiveBlending : THREE.NormalBlending
                }
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
          <meshBasicMaterial
            color="#9edbff"
            transparent
            opacity={0.07}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

export function CellShell({ topologyMode }: { topologyMode: boolean }) {
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
        <meshBasicMaterial
          color="#9edbff"
          transparent
          opacity={0.09}
          wireframe
        />
      </mesh>
    </group>
  );
}

export function LipidDroplet({
  active,
  quiet = false,
}: {
  active: boolean;
  quiet?: boolean;
}) {
  return (
    <Float
      speed={quiet ? 0.75 : 1.2}
      rotationIntensity={0.08}
      floatIntensity={quiet ? 0.08 : 0.16}
    >
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

export function Mitochondrion({ active }: { active: boolean }) {
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
    <group
      position={[-0.72, -0.54, 0.12]}
      rotation={[0.1, 0.25, -0.18]}
      scale={[1.05, 0.48, 0.42]}
    >
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
        <Line
          key={index}
          points={points}
          color="#9edbff"
          lineWidth={1.5}
          transparent
          opacity={0.62}
        />
      ))}
    </group>
  );
}

export function ERRibbons({ active }: { active: boolean }) {
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

export function CarbonSeedCluster({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const atoms = useMemo(
    () =>
      [
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
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.92}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
