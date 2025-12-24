import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { usePlayerStore } from "./playerStore";
import type { SceneConfig } from "../data/journey";

type FollowerConfig = {
  id: string;
  color: string;
  scale: number;
  lateralOffset: number;
  phase: number;
};

const bounceVelocity = 3.5;
const gravity = -12;
const radius = 0.15;
const followStiffness = 6; // exponential decay rate toward anchor
const behindOffset = 0.85;

const followerConfigMap: Record<string, FollowerConfig> = {
  husband: { id: "husband", color: "#4f7dff", scale: 1.0, lateralOffset: -1.1, phase: Math.PI / 4 },
  baby: { id: "baby", color: "#b5e5ff", scale: 0.65, lateralOffset: 1.1, phase: Math.PI / 2 },
};

export function BallFollowers({ scene }: { scene: SceneConfig }) {
  const leaderPos = usePlayerStore((s) => s.pos_w3);
  const groundY = usePlayerStore((s) => s.ground_y);
  const meshes = useRef<Record<string, THREE.Mesh>>({});

  const bounceHeight = (bounceVelocity * bounceVelocity) / (2 * Math.abs(gravity));
  const bounceAngular = (Math.PI * Math.abs(gravity)) / bounceVelocity; // aligns bounce cadence with physics

  useFrame((state, delta) => {
    const { clock, camera } = state;
    const t = clock.getElapsedTime();
    const viewDir = new THREE.Vector3();
    camera.getWorldDirection(viewDir);
    viewDir.y = 0;
    viewDir.normalize();
    const rightDir = new THREE.Vector3().crossVectors(viewDir, new THREE.Vector3(0, 1, 0)).normalize();
    const decay = 1 - Math.exp(-followStiffness * delta);

    const followers = scene.followers ?? [];
    followers.forEach((fid) => {
      const f = followerConfigMap[fid];
      if (!f) return;
      const mesh = meshes.current[f.id];
      if (!mesh) return;
      const offset = new THREE.Vector3()
        .addScaledVector(viewDir, -behindOffset)
        .addScaledVector(rightDir, f.lateralOffset);

      const target = new THREE.Vector3(leaderPos[0], groundY, leaderPos[2]).add(offset);
      const bounce = Math.abs(Math.sin(t * bounceAngular + f.phase)) * bounceHeight + radius * f.scale;
      target.y = groundY + bounce;

      mesh.position.lerp(target, decay);
    });
  });

  return (
    <>
      {(scene.followers ?? []).map((fid) => {
        const f = followerConfigMap[fid];
        if (!f) return null;
        return (
          <mesh key={f.id} ref={(ref) => ref && (meshes.current[f.id] = ref)} scale={f.scale}>
            <sphereGeometry args={[radius, 20, 20]} />
            <meshStandardMaterial
              color={f.color}
              emissive={f.color}
              emissiveIntensity={0.45}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </>
  );
}
