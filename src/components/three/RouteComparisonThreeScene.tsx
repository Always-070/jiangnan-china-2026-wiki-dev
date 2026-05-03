import * as THREE from "three";
import { Line, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CellShell,
  ERRibbons,
  FluidBackdrop,
  LipidDroplet,
  Mitochondrion,
  SceneShell,
  ScrollSceneProps,
  clamp01,
  easeInOut,
  easeOutCubic,
  ringPoints,
} from "./AtlasThreeShared";

const burdenVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const burdenFragmentShader = `
  uniform float uTime;
  uniform float uCollapse;
  uniform float uAlpha;
  uniform float uSeed;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 74.7 + uSeed);

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

  void main() {
    vec2 p = vUv * vec2(7.8, 5.2) + vec2(uSeed, -uSeed * 0.37);
    float grain = noise(p + uTime * 0.035);
    float dust = noise(p * 4.7 + vec2(uTime * 0.11, -uTime * 0.05));
    float fracture = smoothstep(0.62, 0.96, noise(vWorldPosition.xy * 4.4 + uSeed * 3.1 + uCollapse * 3.0));
    float edge = smoothstep(0.48, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

    vec3 soot = vec3(0.052, 0.058, 0.073);
    vec3 slate = vec3(0.26, 0.29, 0.34);
    vec3 ash = vec3(0.48, 0.52, 0.58);
    vec3 color = mix(soot, slate, grain * 0.58 + 0.16);
    color = mix(color, ash, dust * 0.18);
    color *= 0.72 + edge * 0.22;
    color += vec3(0.08, 0.1, 0.13) * fracture * (0.34 + uCollapse * 0.46);
    color *= 1.0 - uCollapse * 0.24;

    float alpha = uAlpha * (0.86 - fracture * 0.12 + dust * 0.08);

    gl_FragColor = vec4(color, alpha);
  }
`;

function RouteBurdenMaterial({
  collapse,
  alpha,
  seed,
  reducedMotion,
}: {
  collapse: number;
  alpha: number;
  seed: number;
  reducedMotion: boolean;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCollapse: { value: collapse },
      uAlpha: { value: alpha },
      uSeed: { value: seed },
    }),
    [alpha, collapse, seed],
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) {
      return;
    }

    materialRef.current.uniforms.uTime.value = reducedMotion
      ? seed * 2
      : clock.getElapsedTime();
    materialRef.current.uniforms.uCollapse.value = collapse;
    materialRef.current.uniforms.uAlpha.value = alpha;
  });

  return (
    <shaderMaterial
      ref={materialRef}
      uniforms={uniforms}
      vertexShader={burdenVertexShader}
      fragmentShader={burdenFragmentShader}
      transparent
    />
  );
}

function ExtractionBurdenStack({
  fold,
  reducedMotion,
}: {
  fold: number;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const layers = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => ({
        width: 1.1 - index * 0.055,
        depth: 0.78 - index * 0.032,
        x: -0.18 + index * 0.052,
        y: index * 0.17,
        z: -index * 0.035,
        seed: index * 1.73 + 0.42,
      })),
    [],
  );
  const feedstockNodes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        x: -0.56 + (index % 3) * 0.22,
        y: -0.22 + Math.floor(index / 3) * 0.11,
        z: -0.44 + ((index * 7) % 5) * 0.08,
        scale: 0.08 + ((index * 5) % 4) * 0.012,
      })),
    [],
  );
  const debrisNodes = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        x: -0.64 + ((index * 7) % 9) * 0.14,
        y: 0.04 + ((index * 5) % 7) * 0.12,
        z: -0.5 + ((index * 11) % 8) * 0.11,
        scatter: 0.42 + ((index * 13) % 10) * 0.052,
        scale: 0.038 + ((index * 3) % 6) * 0.008,
        spin: 0.38 + index * 0.31,
      })),
    [],
  );
  const routeStations = useMemo(
    () => [
      {
        label: "FEEDSTOCK",
        x: -0.9,
        y: -0.1,
        z: 0.42,
        color: "#8d96a8",
      },
      {
        label: "EXTRACT",
        x: -0.52,
        y: 0.08,
        z: 0.46,
        color: "#a6adba",
      },
      {
        label: "PURIFY",
        x: -0.08,
        y: 0.18,
        z: 0.42,
        color: "#c1c8d5",
      },
      {
        label: "SEMISYNTH",
        x: 0.38,
        y: 0.22,
        z: 0.36,
        color: "#d7ddea",
      },
    ],
    [],
  );
  const routePoints = routeStations.map((station, index) => {
    const breakage = easeOutCubic((fold - 0.28 - index * 0.05) / 0.56);
    const side = index < 2 ? -1 : 1;

    return new THREE.Vector3(
      station.x + breakage * side * (0.1 + index * 0.045),
      station.y - breakage * (0.18 + index * 0.08),
      station.z - breakage * (0.14 + index * 0.04),
    );
  });

  useFrame(({ clock, pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      -0.18 + pointer.x * 0.08 + Math.sin(time * 0.18) * 0.05,
      4,
      delta,
    );
    rootRef.current.rotation.x = THREE.MathUtils.damp(
      rootRef.current.rotation.x,
      pointer.y * -0.04,
      4,
      delta,
    );
  });

  return (
    <group ref={rootRef}>
      <Line
        points={routePoints}
        color="#c3cad8"
        lineWidth={2.2}
        transparent
        opacity={clamp01(0.54 - fold * 0.36)}
      />
      {routeStations.map((station, index) => {
        const breakage = easeOutCubic((fold - 0.28 - index * 0.05) / 0.56);
        const side = index < 2 ? -1 : 1;

        return (
          <group
            key={station.label}
            position={[
              station.x + breakage * side * (0.16 + index * 0.06),
              station.y - breakage * (0.24 + index * 0.1),
              station.z - breakage * (0.18 + index * 0.055),
            ]}
            rotation={[
              0.06 + breakage * (0.44 + index * 0.05),
              -0.12 + index * 0.08 - breakage * side * 0.34,
              breakage * side * 0.3,
            ]}
            scale={1 - breakage * 0.16}
          >
            <mesh>
              <boxGeometry args={[0.28, 0.075, 0.18, 1, 1, 1]} />
              <meshStandardMaterial
                color={station.color}
                roughness={0.82}
                metalness={0.04}
                transparent
                opacity={clamp01(0.62 - fold * 0.34)}
              />
            </mesh>
            <mesh position={[0, 0, 0.105]}>
              <sphereGeometry args={[0.052, 18, 18]} />
              <meshBasicMaterial
                color={index === 0 ? "#7a829a" : "#f6faff"}
                transparent
                opacity={clamp01(0.5 - fold * 0.24)}
              />
            </mesh>
          </group>
        );
      })}
      {layers.map((layer, index) => {
        const collapse = easeOutCubic((fold - 0.08 - index * 0.048) / 0.7);
        const drift = collapse * (0.26 + index * 0.068);

        return (
          <mesh
            key={layer.seed}
            position={[
              layer.x - drift * 1.12,
              layer.y - collapse * (0.24 + index * 0.15),
              layer.z - collapse * (0.38 + index * 0.07),
            ]}
            rotation={[
              0.08 + collapse * (0.76 + index * 0.06),
              0.18 * index - collapse * (0.52 + index * 0.035),
              -0.16 + collapse * (-0.88 - index * 0.055),
            ]}
            scale={1 - collapse * (0.18 + index * 0.022)}
          >
            <boxGeometry args={[layer.width, 0.13, layer.depth, 7, 1, 7]} />
            <RouteBurdenMaterial
              collapse={collapse}
              alpha={clamp01(0.84 - fold * 0.66 + index * 0.012)}
              seed={layer.seed}
              reducedMotion={reducedMotion}
            />
          </mesh>
        );
      })}
      {feedstockNodes.map((node, index) => (
        <mesh
          key={`${node.x}-${index}`}
          position={[
            node.x - fold * (0.48 + index * 0.015),
            node.y - fold * (0.74 + index * 0.035),
            node.z - fold * (0.26 + (index % 3) * 0.05),
          ]}
          rotation={[
            0.3 + index * 0.2 + fold * 1.4,
            index * 0.62 - fold * 0.9,
            -0.2 - fold * 0.72,
          ]}
          scale={node.scale * (1 - fold * 0.46)}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={index % 2 ? "#4d5568" : "#303746"}
            roughness={0.95}
            metalness={0.02}
            transparent
            opacity={clamp01(0.5 - fold * 0.34)}
          />
        </mesh>
      ))}
      {debrisNodes.map((node, index) => {
        const collapse = easeOutCubic((fold - 0.16 - index * 0.012) / 0.7);
        const side = index % 2 === 0 ? -1 : 1;

        return (
          <mesh
            key={`${node.x}-${node.spin}`}
            position={[
              node.x + side * collapse * node.scatter,
              node.y - collapse * (0.58 + index * 0.035),
              node.z + collapse * (0.22 + (index % 4) * 0.08),
            ]}
            rotation={[
              node.spin + collapse * (1.6 + index * 0.04),
              index * 0.37 - collapse * 1.1,
              -0.4 + collapse * side * 1.2,
            ]}
            scale={node.scale * (0.78 + collapse * 1.34)}
          >
            <tetrahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={index % 3 === 0 ? "#6f7689" : "#2d3442"}
              roughness={1}
              metalness={0}
              transparent
              opacity={clamp01(collapse * (0.46 - fold * 0.18))}
            />
          </mesh>
        );
      })}
      <Line
        points={[
          new THREE.Vector3(-0.78, 0.92 - fold * 0.68, -0.24),
          new THREE.Vector3(-0.28, 0.38 - fold * 0.82, 0.12),
          new THREE.Vector3(0.5, 0.7 - fold * 1.08, -0.16),
        ]}
        color="#9ca3b8"
        lineWidth={1.2}
        transparent
        opacity={clamp01(0.38 - fold * 0.32)}
      />
      <Sparkles
        count={42}
        scale={[1.6, 1.35, 0.96]}
        size={1.05}
        speed={reducedMotion ? 0 : 0.08}
        color="#7a829a"
      />
    </group>
  );
}

function SteroidRouteHub({
  fold,
  reducedMotion,
}: {
  fold: number;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const hex = useMemo(() => ringPoints(0.32, 6, Math.PI / 6), []);
  const pent = useMemo(() => ringPoints(0.28, 5, Math.PI / 2), []);
  const rings = useMemo(
    () => [
      { points: hex, position: [-0.58, 0, 0] as [number, number, number] },
      { points: hex, position: [-0.08, 0.01, 0] as [number, number, number] },
      { points: hex, position: [0.42, 0.015, 0] as [number, number, number] },
      { points: pent, position: [0.82, 0.015, 0] as [number, number, number] },
    ],
    [hex, pent],
  );

  useFrame(({ clock, pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      -0.06 + fold * 0.34 + pointer.x * 0.1 + Math.sin(time * 0.22) * 0.08,
      4,
      delta,
    );
    rootRef.current.rotation.x = THREE.MathUtils.damp(
      rootRef.current.rotation.x,
      0.1 - pointer.y * 0.08 + Math.sin(time * 0.18) * 0.035,
      4,
      delta,
    );
  });

  return (
    <group
      ref={rootRef}
      scale={0.94 + fold * 0.08}
      rotation={[0.1, -0.06, 0.04]}
    >
      <mesh scale={[3.5, 1.55, 0.34]}>
        <sphereGeometry args={[0.48, 48, 24]} />
        <meshBasicMaterial
          color="#9edbff"
          transparent
          opacity={0.055 + fold * 0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {rings.map((ring, ringIndex) => (
        <group key={ringIndex} position={ring.position}>
          <Line
            points={ring.points}
            color={ringIndex === 3 ? "#f2dd6a" : "#dff3ff"}
            lineWidth={2.25 + fold * 1.05}
            transparent
            opacity={0.7 + fold * 0.08}
          />
          {ring.points.slice(0, -1).map((point, nodeIndex) => (
            <mesh key={`${ringIndex}-${nodeIndex}`} position={point}>
              <sphereGeometry args={[0.033 + fold * 0.012, 18, 18]} />
              <meshBasicMaterial
                color={
                  ringIndex === 2 && nodeIndex === 1 ? "#d99b4d" : "#f6faff"
                }
                transparent
                opacity={0.76}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0.12, -0.02, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.01, 8, 120]} />
        <meshBasicMaterial
          color="#9edbff"
          transparent
          opacity={0.13 + fold * 0.09}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <Sparkles
        count={34}
        scale={[2.3, 1.2, 0.7]}
        size={1.15}
        speed={reducedMotion ? 0 : 0.24}
        color="#f6faff"
      />
    </group>
  );
}

function RoutePulsePackets({
  curve,
  color,
  count,
  fold,
  phase,
  reducedMotion,
}: {
  curve: THREE.CatmullRomCurve3;
  color: string;
  count: number;
  fold: number;
  phase: number;
  reducedMotion: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        offset:
          (index / count + (((index * 29) % 89) / 89) * 0.035 + phase) % 1,
        lane: ((index % 5) - 2) * 0.012,
        scale: 0.55 + ((index * 13) % 10) / 18,
      })),
    [count, phase],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const time = reducedMotion ? phase * 7 : clock.getElapsedTime();
    const speed = 0.036 + fold * 0.074;

    seeds.forEach((seed, index) => {
      const t = (seed.offset + time * speed) % 1;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t);
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0)
        .normalize()
        .multiplyScalar(seed.lane);

      dummy.position.copy(point).add(normal);
      dummy.scale.setScalar(
        (0.032 + fold * 0.018) *
          seed.scale *
          (0.82 + Math.sin(t * Math.PI) * 0.34),
      );
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.12 + fold * 0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

function RouteEnergyNetwork({
  fold,
  reducedMotion,
}: {
  fold: number;
  reducedMotion: boolean;
}) {
  const ignition = easeOutCubic((fold - 0.16) / 0.66);
  const curves = useMemo(
    () => [
      {
        color: "#9edbff",
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.05, 0.16, 0.22),
          new THREE.Vector3(-0.42, 0.56, 0.46),
          new THREE.Vector3(0.34, 0.22, 0.58),
          new THREE.Vector3(1.08, 0.08, 0.24),
        ]),
      },
      {
        color: "#27c46a",
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-1.18, -0.46, 0.18),
          new THREE.Vector3(-0.42, -0.16, 0.4),
          new THREE.Vector3(0.24, -0.34, 0.44),
          new THREE.Vector3(1.18, -0.08, 0.22),
        ]),
      },
      {
        color: "#ffe84a",
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.34, 0.58, 0.08),
          new THREE.Vector3(0.08, 0.24, 0.44),
          new THREE.Vector3(0.58, 0.42, 0.36),
          new THREE.Vector3(0.94, 0.02, 0.2),
        ]),
      },
    ],
    [],
  );
  const nodes = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        curveIndex: index % 3,
        t: 0.08 + ((index * 17) % 82) / 100,
        lift: ((index % 5) - 2) * 0.035,
        scale: 0.032 + ((index * 7) % 8) * 0.006,
      })),
    [],
  );

  return (
    <group visible={ignition > 0.02} scale={0.84 + ignition * 0.24}>
      <mesh scale={[3.45 + ignition * 0.86, 1.1 + ignition * 0.24, 0.32]}>
        <sphereGeometry args={[0.36, 48, 18]} />
        <meshBasicMaterial
          color="#7fc8ff"
          transparent
          opacity={0.025 + ignition * 0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {curves.map((item, index) => (
        <group key={item.color}>
          <Line
            points={item.curve.getPoints(110)}
            color={item.color}
            lineWidth={1.35 + ignition * (index === 0 ? 2.55 : 2.05)}
            transparent
            opacity={0.14 + ignition * 0.48}
          />
          <RoutePulsePackets
            curve={item.curve}
            color={item.color}
            count={index === 0 ? 180 : 128}
            fold={ignition}
            phase={index * 0.17}
            reducedMotion={reducedMotion}
          />
        </group>
      ))}
      {nodes.map((node) => {
        const curve = curves[node.curveIndex];
        const point = curve.curve.getPoint(node.t);

        return (
          <mesh
            key={`${curve.color}-${node.t}`}
            position={[point.x, point.y + node.lift, point.z + ignition * 0.08]}
            scale={node.scale * (0.42 + ignition * 1.7)}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial
              color={curve.color}
              transparent
              opacity={0.05 + ignition * 0.42}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function FungalFactoryRoute({
  fold,
  reducedMotion,
}: {
  fold: number;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const ignition = easeOutCubic((fold - 0.16) / 0.68);

  useFrame(({ clock, pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();

    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      -0.2 + ignition * 0.32 + pointer.x * 0.09 + Math.sin(time * 0.12) * 0.08,
      4.2,
      delta,
    );
    rootRef.current.rotation.x = THREE.MathUtils.damp(
      rootRef.current.rotation.x,
      -0.06 - pointer.y * 0.05,
      4,
      delta,
    );
  });

  return (
    <group
      ref={rootRef}
      scale={0.7 + ignition * 0.26}
      rotation={[-0.06, -0.2, 0]}
    >
      <CellShell topologyMode={false} />
      <group scale={0.78}>
        <ERRibbons active />
        <Mitochondrion active={ignition > 0.48} />
        <LipidDroplet active quiet />
      </group>
      <RouteEnergyNetwork fold={fold} reducedMotion={reducedMotion} />
      <mesh scale={[2.8, 1.55, 0.62]}>
        <sphereGeometry args={[0.42, 48, 24]} />
        <meshBasicMaterial
          color="#1267d8"
          transparent
          opacity={0.035 + ignition * 0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={1.08 + ignition * 0.18}>
        <torusGeometry args={[0.86, 0.012, 10, 140]} />
        <meshBasicMaterial
          color="#9edbff"
          transparent
          opacity={0.045 + ignition * 0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.26, Math.PI / 2, 0.18]} scale={0.92 + ignition * 0.2}>
        <torusGeometry args={[0.92, 0.008, 10, 140]} />
        <meshBasicMaterial
          color="#27c46a"
          transparent
          opacity={0.03 + ignition * 0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Sparkles
        count={82}
        scale={[3.8, 2.15, 1.32]}
        size={1.34}
        speed={reducedMotion ? 0 : 0.32}
        color="#9edbff"
      />
    </group>
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
  const oldCollapse = easeOutCubic((fold - 0.08) / 0.64);
  const newIgnition = easeOutCubic((fold - 0.18) / 0.62);
  const oldConnector = useMemo(
    () => [
      new THREE.Vector3(-1.5, 0.16, 0.06),
      new THREE.Vector3(-0.82, 0.22, 0.22),
      new THREE.Vector3(-0.18, 0.04, 0.34),
    ],
    [],
  );
  const newConnector = useMemo(
    () => [
      new THREE.Vector3(0.18, 0.06, 0.34),
      new THREE.Vector3(0.84, 0.28, 0.42),
      new THREE.Vector3(1.64, 0.08, 0.24),
    ],
    [],
  );

  useFrame(({ clock, pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    const time = clock.getElapsedTime();
    const targetY =
      -0.68 + fold * 1.62 + pointer.x * 0.08 + Math.sin(time * 0.13) * 0.05;
    const targetX = 0.08 - fold * 0.34 - pointer.y * 0.04;
    const targetZ = -0.08 + fold * 0.2;

    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      targetY,
      4.4,
      delta,
    );
    rootRef.current.rotation.x = THREE.MathUtils.damp(
      rootRef.current.rotation.x,
      targetX,
      4.4,
      delta,
    );
    rootRef.current.rotation.z = THREE.MathUtils.damp(
      rootRef.current.rotation.z,
      targetZ,
      4.4,
      delta,
    );
  });

  return (
    <>
      <FluidBackdrop reducedMotion={reducedMotion} alpha={0.3 + fold * 0.16} />
      <group ref={rootRef} position={[0, -0.08, 0]} scale={1.03}>
        <group
          position={[
            -1.55 - oldCollapse * 0.72,
            -0.2 - oldCollapse * 0.64,
            -0.2 - oldCollapse * 0.54,
          ]}
          rotation={[
            0.06 + oldCollapse * 0.82,
            -0.38 - fold * 0.58,
            -0.08 - oldCollapse * 0.56,
          ]}
          scale={0.9 - oldCollapse * 0.22}
        >
          <ExtractionBurdenStack fold={fold} reducedMotion={reducedMotion} />
        </group>

        <group
          position={[-0.05, 0.0, 0.3]}
          rotation={[fold * -0.08, fold * 0.32, fold * 0.06]}
        >
          <SteroidRouteHub fold={fold} reducedMotion={reducedMotion} />
        </group>

        <group
          position={[
            1.42 + (1 - newIgnition) * 0.46,
            -0.08 + newIgnition * 0.18,
            0.02 + newIgnition * 0.36,
          ]}
          rotation={[
            0.04 - newIgnition * 0.16,
            0.34 - (1 - newIgnition) * 0.46,
            0.02 + newIgnition * 0.04,
          ]}
          scale={0.78 + newIgnition * 0.36}
        >
          <FungalFactoryRoute fold={fold} reducedMotion={reducedMotion} />
        </group>

        <Line
          points={oldConnector}
          color="#7a829a"
          lineWidth={1.4}
          transparent
          opacity={clamp01(0.44 - oldCollapse * 0.42)}
        />
        <Line
          points={newConnector}
          color="#9edbff"
          lineWidth={1.35 + newIgnition * 2.55}
          transparent
          opacity={0.12 + newIgnition * 0.5}
        />
        <mesh position={[0.02, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5 + fold * 0.18, 0.01, 8, 180]} />
          <meshBasicMaterial
            color="#f1d96d"
            transparent
            opacity={0.06 + fold * 0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0.4, 0.02, 0.18]} scale={[2.7, 1.22, 0.22]}>
          <sphereGeometry args={[0.36, 48, 18]} />
          <meshBasicMaterial
            color="#9edbff"
            transparent
            opacity={newIgnition * 0.07}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

export function RouteComparisonThreeScene({
  scrollProgress,
}: ScrollSceneProps) {
  return (
    <SceneShell
      className="route-three-scene"
      cameraPosition={[0, 0.1, 5.4]}
      bloomIntensity={0.38}
      bloomThreshold={0.24}
      bloomSmoothing={0.62}
    >
      {(reducedMotion) => (
        <RouteComparisonModel
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
        />
      )}
    </SceneShell>
  );
}

export default RouteComparisonThreeScene;
