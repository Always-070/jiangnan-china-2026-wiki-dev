import * as THREE from "three";
import gsap from "gsap";
import { Line, Sparkles, useTexture } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CarbonSeedCluster,
  CellShell,
  ERRibbons,
  HomeAtlasThreeSceneProps,
  LipidDroplet,
  Mitochondrion,
  SceneShell,
  SteroidScaffold,
} from "./AtlasThreeShared";

interface ControlMapThreeSceneProps {
  activeModule: string;
  topologyMode: boolean;
}

const moduleColors: Record<string, string> = {
  flux: "#27c46a",
  catalysis: "#d99b4d",
  transport: "#9edbff",
};

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
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, index) => index / count),
    [count],
  );

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
      point.scale.setScalar(
        quiet ? 0.68 + seed * 0.18 : 0.62 + Math.sin(t * Math.PI) * 0.46,
      );
    });
  });

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={active ? 2.1 : 1.2}
        transparent
        opacity={active ? 0.48 : 0.22}
      />
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

function ParticleField({
  reducedMotion,
  quiet = false,
}: {
  reducedMotion: boolean;
  quiet?: boolean;
}) {
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
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
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
    <mesh
      position={[-1.1, -1.14, -0.32]}
      rotation={[0, 0.06, 0]}
      scale={[1.1, 0.58, 1]}
    >
      <planeGeometry args={[2.25, 1.18]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </mesh>
  );
}

function TopologyNodes({ activeModule }: { activeModule: string }) {
  const nodes = [
    {
      id: "flux",
      position: [-1.2, -0.16, 0.18] as [number, number, number],
      color: "#27c46a",
    },
    {
      id: "catalysis",
      position: [0.15, 0.52, 0.28] as [number, number, number],
      color: "#d99b4d",
    },
    {
      id: "transport",
      position: [1.24, -0.18, 0.18] as [number, number, number],
      color: "#9edbff",
    },
  ];

  return (
    <group>
      <Line
        points={nodes.map((node) => new THREE.Vector3(...node.position))}
        color="#9edbff"
        lineWidth={1.6}
        transparent
        opacity={0.44}
      />
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
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={active ? 0.96 : 0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh scale={active ? 2.7 : 1.9}>
              <sphereGeometry args={[0.14, 24, 24]} />
              <meshBasicMaterial
                color={node.color}
                transparent
                opacity={active ? 0.18 : 0.07}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
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
      duration:
        cinematic && playedIntroRef.current ? 2.1 : topologyMode ? 1.25 : 0.95,
      ease: "power3.out",
      onUpdate: () => camera.lookAt(0, 0, 0),
    });

    return () => {
      tween.kill();
    };
  }, [
    activeModule,
    camera,
    cinematic,
    posterMode,
    reducedMotion,
    topologyMode,
  ]);

  return null;
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
    const catalyticKick =
      !posterMode && activeModule === "catalysis"
        ? Math.sin(time * 18) * 0.008
        : 0;
    const baseY = posterMode ? -0.12 : -0.18;
    const baseX = posterMode ? -0.04 : -0.05;
    const targetY =
      Math.sin(time * 0.13) * (posterMode ? 0.1 : 0.18) +
      pointer.x * (posterMode ? 0.28 : 0.08) +
      baseY;
    const targetX =
      baseX +
      Math.sin(time * 0.1) * (posterMode ? 0.045 : 0.08) -
      pointer.y * (posterMode ? 0.11 : 0.04);

    rootRef.current.rotation.y = THREE.MathUtils.damp(
      rootRef.current.rotation.y,
      targetY,
      posterMode ? 4.8 : 3.2,
      delta,
    );
    rootRef.current.rotation.x = THREE.MathUtils.damp(
      rootRef.current.rotation.x,
      targetX,
      posterMode ? 4.2 : 3,
      delta,
    );
    rootRef.current.position.x = THREE.MathUtils.damp(
      rootRef.current.position.x,
      catalyticKick,
      6,
      delta,
    );
    rootRef.current.position.y = THREE.MathUtils.damp(
      rootRef.current.position.y,
      catalyticKick * 0.55,
      6,
      delta,
    );
  });

  return (
    <group
      ref={rootRef}
      rotation={[-0.08, posterMode ? -0.12 : -0.18, 0]}
      scale={topologyMode ? 1.18 : posterMode ? 0.76 : 1}
    >
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
          {logoUrl && !posterMode ? (
            <LogoTexturePlane logoUrl={logoUrl} />
          ) : null}
          {cinematic ? (
            <CarbonSeedCluster reducedMotion={reducedMotion} />
          ) : null}
        </>
      )}
      {!topologyMode && !posterMode && (
        <Sparkles
          count={52}
          scale={[4.2, 2.2, 1.5]}
          size={2.1}
          speed={reducedMotion ? 0 : 0.34}
          color="#9edbff"
        />
      )}
    </group>
  );
}

export function ControlMapThreeScene({
  activeModule,
  topologyMode,
}: ControlMapThreeSceneProps) {
  return (
    <SceneShell className="control-three-scene" cameraPosition={[0, 0.05, 5.6]}>
      {(reducedMotion) => (
        <CellFactoryModel
          activeModule={activeModule}
          topologyMode={topologyMode}
          reducedMotion={reducedMotion}
        />
      )}
    </SceneShell>
  );
}

export default ControlMapThreeScene;
