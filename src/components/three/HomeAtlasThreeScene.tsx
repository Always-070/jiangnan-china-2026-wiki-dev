import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  CarbonSeedCluster,
  ERRibbons,
  FluidBackdrop,
  HomeAtlasMode,
  HomeAtlasThreeSceneProps,
  LipidDroplet,
  Mitochondrion,
  SceneShell,
  SteroidScaffold,
  clamp01,
  easeInOut,
  easeOutCubic,
} from "./AtlasThreeShared";

const CARBON_ANCHOR = new THREE.Vector3(-1.95, -0.78, 1.08);

const SCAFFOLD_TARGET = new THREE.Vector3(0.12, -0.06, 0.78);

const SCAFFOLD_FOCUS_TARGET = new THREE.Vector3(0.1, 0.26, 1.08);

function cubicBezierPoint(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  d: THREE.Vector3,
  t: number,
) {
  const u = 1 - t;

  return new THREE.Vector3(
    u * u * u * a.x +
      3 * u * u * t * b.x +
      3 * u * t * t * c.x +
      t * t * t * d.x,
    u * u * u * a.y +
      3 * u * u * t * b.y +
      3 * u * t * t * c.y +
      t * t * t * d.y,
    u * u * u * a.z +
      3 * u * u * t * b.z +
      3 * u * t * t * c.z +
      t * t * t * d.z,
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

    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      time * 0.18 + pointer.x * 0.28,
      3.6,
      delta,
    );
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      pointer.y * -0.18,
      3.6,
      delta,
    );
    groupRef.current.scale.setScalar(0.72 * (1 + Math.sin(time * 1.6) * 0.045));

    orbitRefs.current.forEach((orbit, index) => {
      orbit.rotation.z += delta * (0.42 + index * 0.18);
    });
  });

  return (
    <group ref={groupRef} position={CARBON_ANCHOR} scale={0.72}>
      <mesh>
        <sphereGeometry args={[0.13, 42, 42]} />
        <meshBasicMaterial
          color="#27c46a"
          transparent
          opacity={0.88 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={2.25}>
        <sphereGeometry args={[0.13, 42, 42]} />
        <meshBasicMaterial
          color="#27c46a"
          transparent
          opacity={0.13 * opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {[0, 1, 2].map((index) => (
        <group
          key={index}
          ref={(group) => {
            if (group) {
              orbitRefs.current[index] = group;
            }
          }}
          rotation={[
            index === 1 ? Math.PI / 2 : 0.38,
            index === 2 ? Math.PI / 2 : 0.1,
            index * 0.72,
          ]}
        >
          <mesh>
            <torusGeometry args={[0.34, 0.0048, 8, 96]} />
            <meshBasicMaterial
              color={index === 2 ? "#ffe84a" : "#9edbff"}
              transparent
              opacity={0.72 * opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0.34, 0, 0]}>
            <sphereGeometry args={[0.026, 18, 18]} />
            <meshBasicMaterial
              color="#f6faff"
              transparent
              opacity={0.9 * opacity}
              blending={THREE.AdditiveBlending}
            />
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
  const atomCamera = useMemo(
    () => CARBON_ANCHOR.clone().add(new THREE.Vector3(0.02, 0.015, 3.05)),
    [],
  );
  const tunnelCameraA = useMemo(
    () => new THREE.Vector3(-1.58, -0.54, 1.62),
    [],
  );
  const tunnelCameraB = useMemo(() => new THREE.Vector3(-0.38, 0.08, 2.72), []);
  const scaffoldCamera = useMemo(() => new THREE.Vector3(0.08, 0.02, 9.0), []);
  const dockedCamera = useMemo(() => new THREE.Vector3(0.08, 0.04, 7.35), []);

  useEffect(() => {
    const focusMode = mode === "scaffold" || mode === "docking";

    camera.position.copy(
      mode === "docked"
        ? dockedCamera
        : focusMode
          ? scaffoldCamera
          : atomCamera,
    );
    lookAtRef.current.copy(
      mode === "docked"
        ? SCAFFOLD_TARGET
        : focusMode
          ? SCAFFOLD_FOCUS_TARGET
          : CARBON_ANCHOR,
    );
    camera.lookAt(lookAtRef.current);
  }, [atomCamera, camera, dockedCamera, mode, scaffoldCamera]);

  useFrame(({ pointer }, delta) => {
    const travel =
      mode === "atom" ? 0 : mode === "travel" ? easeInOut(progress) : 1;
    const finalCamera = mode === "docked" ? dockedCamera : scaffoldCamera;
    const finalFov =
      mode === "scaffold" || mode === "docking"
        ? 42
        : mode === "docked"
          ? 42
          : 38 - travel * 3;

    if (mode === "docked") {
      targetPosition.copy(dockedCamera);
    } else {
      targetPosition.copy(
        cubicBezierPoint(
          atomCamera,
          tunnelCameraA,
          tunnelCameraB,
          finalCamera,
          easeOutCubic(travel),
        ),
      );
    }

    targetLook
      .copy(CARBON_ANCHOR)
      .lerp(
        mode === "scaffold" || mode === "docking"
          ? SCAFFOLD_FOCUS_TARGET
          : SCAFFOLD_TARGET,
        easeInOut(travel),
      );

    if (mode === "scaffold" || mode === "docking" || mode === "docked") {
      const isFocus = mode === "scaffold" || mode === "docking";

      targetLook.x += pointer.x * (isFocus ? 0.16 : 0.08);
      targetLook.y += pointer.y * (isFocus ? 0.1 : 0.05);
      targetPosition.x += pointer.x * (isFocus ? 0.11 : 0.04);
      targetPosition.y += pointer.y * (isFocus ? 0.06 : 0.03);
    }

    const damp = reducedMotion
      ? 1
      : 1 - Math.exp(-delta * (mode === "travel" ? 8.5 : 5.2));

    camera.position.lerp(targetPosition, damp);
    lookAtRef.current.lerp(targetLook, damp);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(
        camera.fov,
        finalFov,
        reducedMotion ? 100 : 4.4,
        delta,
      );
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

    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      pointer.x * 0.08 + Math.sin(time * 0.1) * 0.04,
      3,
      delta,
    );
    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      -pointer.y * 0.045,
      3,
      delta,
    );
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
        <meshBasicMaterial
          color="#9edbff"
          transparent
          opacity={0.075}
          wireframe
          depthWrite={false}
        />
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
        offset:
          (index / count + (((index * 37) % 97) / 97) * (1 / count) * 4) % 1,
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
      const normal = new THREE.Vector3(-tangent.y, tangent.x, 0)
        .normalize()
        .multiplyScalar(seed.lane);

      dummy.position.copy(point).add(normal);
      dummy.scale.setScalar(
        0.65 + seed.scale * (0.4 + Math.sin(t * Math.PI) * 0.1),
      );
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(index, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.014, 10, 10]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.66}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
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
      <Line
        points={curves.carbon.getPoints(110)}
        color="#27c46a"
        lineWidth={1.2}
        transparent
        opacity={0.38}
      />
      <Line
        points={curves.er.getPoints(110)}
        color="#9edbff"
        lineWidth={1.5}
        transparent
        opacity={0.42}
      />
      <Line
        points={curves.export.getPoints(110)}
        color="#d99b4d"
        lineWidth={1.1}
        transparent
        opacity={0.34}
      />
      <InstancedCurveParticles
        curve={curves.carbon}
        color="#27c46a"
        count={280}
        speed={0.055}
        reducedMotion={reducedMotion}
      />
      <InstancedCurveParticles
        curve={curves.er}
        color="#9edbff"
        count={340}
        speed={0.042}
        reducedMotion={reducedMotion}
      />
      <InstancedCurveParticles
        curve={curves.export}
        color="#d99b4d"
        count={220}
        speed={0.036}
        reducedMotion={reducedMotion}
      />
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
  const reveal =
    mode === "atom" ? 0 : mode === "travel" ? easeInOut(progress) : 1;
  const atomOpacity = mode === "atom" ? 1 : clamp01(1 - progress * 2.4);
  const sceneVisible = reveal > 0.035;
  const scaffoldFocus = mode === "scaffold" || mode === "docking";
  const targetScale = scaffoldFocus
    ? 0.78
    : mode === "travel"
      ? 0.5 + reveal * 0.68
      : 1;

  useFrame(({ pointer }, delta) => {
    if (!rootRef.current || reducedMotion) {
      return;
    }

    rootRef.current.position.x = THREE.MathUtils.damp(
      rootRef.current.position.x,
      pointer.x * (mode === "scaffold" ? 0.12 : 0.08),
      4,
      delta,
    );
    rootRef.current.position.y = THREE.MathUtils.damp(
      rootRef.current.position.y,
      pointer.y * (mode === "scaffold" ? 0.072 : 0.045),
      4,
      delta,
    );
    rootRef.current.scale.setScalar(
      THREE.MathUtils.damp(rootRef.current.scale.x, targetScale, 4, delta),
    );
  });

  return (
    <>
      <FluidBackdrop
        reducedMotion={reducedMotion}
        alpha={
          mode === "atom"
            ? 0.76
            : mode === "travel"
              ? 0.72 + reveal * 0.16
              : 0.86
        }
      />
      <HeroCameraRig
        reducedMotion={reducedMotion}
        mode={mode}
        progress={progress}
      />
      <CarbonAtomFocus reducedMotion={reducedMotion} opacity={atomOpacity} />
      <group
        ref={rootRef}
        position={[0, 0, 0]}
        rotation={[-0.03, -0.08, 0]}
        scale={targetScale}
        visible={sceneVisible}
      >
        <HeroCellMembrane reducedMotion={reducedMotion} />
        <group
          position={scaffoldFocus ? [0, -0.22, -0.46] : [0, 0, 0]}
          scale={scaffoldFocus ? 0.72 : 1}
        >
          <HeroOrganelleField reducedMotion={reducedMotion} />
          <HeroMetabolicFlux reducedMotion={reducedMotion} />
        </group>
        <group position={scaffoldFocus ? [0, 0.02, 0.42] : [0, 0, 0]}>
          <SteroidScaffold
            reducedMotion={reducedMotion}
            heroMode
            focusMode={scaffoldFocus}
          />
          <mesh position={[1.08, 0.05, 0.62]} scale={1.42}>
            <sphereGeometry args={[0.22, 36, 36]} />
            <meshBasicMaterial
              color="#d99b4d"
              transparent
              opacity={0.11}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </>
  );
}

export function HomeAtlasThreeScene({
  logoUrl,
  mode = "docked",
  progress = 1,
}: HomeAtlasThreeSceneProps) {
  void logoUrl;

  return (
    <SceneShell
      className="atlas-three-scene"
      cameraPosition={
        mode === "docked" ? [0.08, 0.04, 7.35] : [-1.93, -0.765, 2.11]
      }
    >
      {(reducedMotion) => (
        <HeroAtlasModel
          reducedMotion={reducedMotion}
          mode={mode}
          progress={progress}
        />
      )}
    </SceneShell>
  );
}

export default HomeAtlasThreeScene;
