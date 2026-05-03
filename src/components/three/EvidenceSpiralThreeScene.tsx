import * as THREE from "three";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { SceneShell, ScrollSceneProps, easeInOut } from "./AtlasThreeShared";

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

        return new THREE.Vector3(
          Math.cos(angle) * 0.96,
          1.78 - t * 3.56,
          Math.sin(angle) * 0.96,
        );
      }),
    [],
  );
  const helixB = useMemo(
    () =>
      helixA.map((point, index) => {
        const t = index / (helixA.length - 1);
        const angle = t * Math.PI * 7.2 + Math.PI;

        return new THREE.Vector3(
          Math.cos(angle) * 0.96,
          point.y,
          Math.sin(angle) * 0.96,
        );
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
        <meshBasicMaterial
          color="#9edbff"
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={[7, 1, 7]}>
        <sphereGeometry args={[0.1, 32, 16]} />
        <meshBasicMaterial
          color="#1267d8"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <Line
        points={helixA}
        color="#9edbff"
        lineWidth={2.45}
        transparent
        opacity={0.82}
      />
      <Line
        points={helixB}
        color="#ffe84a"
        lineWidth={1.75}
        transparent
        opacity={0.66}
      />
      {helixA
        .filter((_, index) => index % 10 === 0)
        .map((point, index) => (
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
          <group
            key={label}
            position={[
              Math.cos(angle) * 1.58,
              1.18 - index * 0.76,
              Math.sin(angle) * 1.58,
            ]}
          >
            <mesh>
              <boxGeometry args={[isActive ? 0.72 : 0.58, 0.28, 0.035]} />
              <meshBasicMaterial
                color={isActive ? "#ffe84a" : "#f6faff"}
                transparent
                opacity={isActive ? 0.28 : 0.13}
              />
            </mesh>
            <mesh position={[-0.22, 0, 0.04]}>
              <sphereGeometry args={[isActive ? 0.075 : 0.055, 18, 18]} />
              <meshBasicMaterial
                color={
                  isActive ? "#ffe84a" : index === 1 ? "#d99b4d" : "#9edbff"
                }
                transparent
                opacity={0.9}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function EvidenceSpiralThreeScene({ scrollProgress }: ScrollSceneProps) {
  return (
    <SceneShell
      className="evidence-three-scene"
      cameraPosition={[0, 0.02, 4.5]}
    >
      {(reducedMotion) => (
        <EvidenceHelixModel
          reducedMotion={reducedMotion}
          scrollProgress={scrollProgress}
        />
      )}
    </SceneShell>
  );
}

export default EvidenceSpiralThreeScene;
