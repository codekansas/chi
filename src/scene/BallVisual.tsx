import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePlayerStore } from "./playerStore";

export function BallVisual() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pos = usePlayerStore((s) => s.pos_w3);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(pos[0], pos[1], pos[2]);
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <sphereGeometry args={[0.15, 24, 24]} />
      <meshStandardMaterial
        color="#ffd6f6"
        emissive="#7ec4ff"
        emissiveIntensity={0.45}
        roughness={0.28}
        metalness={0.32}
      />
    </mesh>
  );
}
