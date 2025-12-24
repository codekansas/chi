import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { journey } from "../data/journey";
import { useGameStore } from "../store/gameStore";
import { Landmarks } from "./Landmarks";
import { SceneSprites } from "./Sprites";
import { PhysicsBallController } from "./PhysicsBallController";
import { BallVisual } from "./BallVisual";
import { CollidersDebug } from "./CollidersDebug";
import { BallCameraFollow } from "./BallCameraFollow";
import { BallFollowers } from "./BallFollowers";
import * as THREE from "three";

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 2.2, 3.8], fov: 55 }}
      dpr={[1, 1.5]}
      shadows
      gl={{ powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0f1226"]} />
      <fog attach="fog" args={["#0f1226", 12, 42]} />
      <hemisphereLight args={["#8ab9ff", "#1a1f33", 0.8]} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        color="#ffb5d1"
        castShadow
        shadow-mapSize={[768, 768]}
        shadow-camera-near={1}
        shadow-camera-far={22}
      />
      <pointLight position={[0, 6, 0]} intensity={1.0} color="#ff9fb1" distance={18} decay={1.6} />
      <pointLight position={[-6, 4, 6]} intensity={0.8} color="#9ff2d8" distance={16} decay={1.4} />
      <Suspense fallback={null}>
        <SceneManager />
      </Suspense>
    </Canvas>
  );
}

function SceneManager() {
  const activeSceneId = useGameStore((s) => s.activeSceneId);
  const scene = useMemo(() => journey.find((j) => j.id === activeSceneId), [activeSceneId]);
  if (!scene) return null;

  return (
    <>
      {scene.skybox && <Environment files={scene.skybox} background />}
      <GradientGround />
      <Landmarks scene={scene} />
      <SceneSprites scene={scene} />
      <BallVisual />
      <BallFollowers scene={scene} />
      <PhysicsBallController scene={scene} />
      <BallCameraFollow />
      <CollidersDebug scene={scene} visible={false} />
    </>
  );
}

function GradientGround() {
  const geoRef = useRef<THREE.PlaneGeometry>(null);

  useLayoutEffect(() => {
    const geo = geoRef.current;
    if (!geo) return;
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);
    for (let idx = 0; idx < count; idx += 1) {
      // Create a soft radial gradient from center -> edge.
      const x = geo.attributes.position.getX(idx) / 30;
      const y = geo.attributes.position.getY(idx) / 30;
      const r = Math.sqrt(x * x + y * y);
      const t = Math.min(1, r);
      const wave = 0.5 + 0.5 * Math.sin(r * 7 - Math.PI / 2);
      const mixFactor = THREE.MathUtils.clamp(t * 0.7 + wave * 0.3, 0, 1);
      const inner = new THREE.Color("#2f3a7a");
      const mid = new THREE.Color("#1c1f3c");
      const outer = new THREE.Color("#0e122a");
      const mixed = inner.lerp(mid, mixFactor * 0.6).lerp(outer, mixFactor * 0.4);
      colors[idx * 3] = mixed.r;
      colors[idx * 3 + 1] = mixed.g;
      colors[idx * 3 + 2] = mixed.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry ref={geoRef} args={[60, 60, 64, 64]} />
      <meshBasicMaterial vertexColors />
    </mesh>
  );
}
