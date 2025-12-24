import React from "react";
import { Html, useCursor } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { SceneConfig } from "../data/journey";
import { journey } from "../data/journey";
import { useGameStore } from "../store/gameStore";
import { usePlayerStore } from "./playerStore";

const interactRadius = 2.2;
const plinthHeight = 0.24;
const buildingSize = { width: 3.2, depth: 2.4, height: 4.8, roofHeight: 0.38 };
const windowRows = 3;
const windowCols = 4;
const windowSize = { w: 0.4, h: 0.55 };
const windowInset = 0.3;

export function Landmarks({ scene }: { scene: SceneConfig }) {
  const playerPos_w3 = usePlayerStore((s) => s.pos_w3);
  const setFlag = useGameStore((s) => s.setFlag);
  const flags = useGameStore((s) => s.flags);

  const interactNearest = React.useCallback(() => {
    let nearest: { lmId: string; dist: number } | null = null;
    scene.landmarks.forEach((lm) => {
      if (!lm.interaction) return;
      const dist = new THREE.Vector3(...playerPos_w3).distanceTo(new THREE.Vector3(...lm.pos_w3));
      if (dist > interactRadius) return;
      if (!nearest || dist < nearest.dist) {
        nearest = { lmId: lm.id, dist };
      }
    });
    if (!nearest) return;
    const target = scene.landmarks.find((lm) => lm.id === nearest?.lmId);
    if (!target?.interaction) return;
    if (flags[target.interaction.onCompleteFlag]) return;
    setFlag(target.interaction.onCompleteFlag);
  }, [flags, playerPos_w3, scene.landmarks, setFlag]);

  // Keyboard interaction with nearest target (F key).
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        interactNearest();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [interactNearest]);

  return (
    <>
      {scene.landmarks.map((lm) => (
        <LandmarkMesh key={lm.id} sceneId={scene.id} landmarkId={lm.id} pos_w3={lm.pos_w3} />
      ))}
    </>
  );
}

function LandmarkMesh({
  sceneId,
  landmarkId,
  pos_w3,
}: {
  sceneId: string;
  landmarkId: string;
  pos_w3: [number, number, number];
}) {
  const playerPos_w3 = usePlayerStore((s) => s.pos_w3);
  const setFlag = useGameStore((s) => s.setFlag);
  const flags = useGameStore((s) => s.flags);

  const sceneConfig = journey.find((cfg) => cfg.id === sceneId);
  const lm = sceneConfig?.landmarks.find((l) => l.id === landmarkId);
  if (!lm) return null;

  const isNear =
    new THREE.Vector3(...playerPos_w3).distanceTo(new THREE.Vector3(...pos_w3)) < interactRadius;
  useCursor(isNear);
  const completed = lm.interaction ? flags[lm.interaction.onCompleteFlag] : false;
  const isInside = pointInsideBuilding(playerPos_w3, pos_w3);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!lm.interaction) return;
    if (completed) return;
    setFlag(lm.interaction.onCompleteFlag);
  };

  return (
    <group position={pos_w3} onClick={handleClick}>
      <BuildingVisual completed={completed} translucent={isInside} />
      <Html position={[0, buildingSize.height + buildingSize.roofHeight + plinthHeight + 0.5, 0]} center>
        <div className="label">
          {lm.label}
          {lm.interaction && (
            <div className="prompt">{isNear ? lm.interaction.prompt : "Walk closer to interact"}</div>
          )}
        </div>
      </Html>
    </group>
  );
}

function BuildingVisual({ completed, translucent }: { completed: boolean; translucent: boolean }) {
  const structuralOpacity = translucent ? 0.32 : 0.98;
  const accentOpacity = translucent ? 0.48 : 1;
  const windowOpacity = translucent ? 0.32 : 0.9;
  const bodyColor = completed ? "#8ad9b0" : "#e8d4c6";
  const roofColor = completed ? "#5ea885" : "#c59c7a";
  const windowColor = completed ? "#cffff1" : "#dfeeff";
  const windowOffColor = "#506079";

  const windowTransforms = React.useMemo(() => {
    const entries: { pos: [number, number, number]; rotY: number; lit: boolean }[] = [];
    const xStep = (buildingSize.width - 2 * windowInset) / (windowCols - 1);
    const yStart = plinthHeight + 0.8;
    const yStep = (buildingSize.height - 1.2) / Math.max(1, windowRows - 1);
    for (let row = 0; row < windowRows; row += 1) {
      for (let col = 0; col < windowCols; col += 1) {
        const x = -buildingSize.width / 2 + windowInset + col * xStep;
        const y = yStart + row * yStep;
        const flicker = (row + col) % 2 === 0;
        entries.push({ pos: [x, y, buildingSize.depth / 2 + 0.01], rotY: 0, lit: flicker });
        entries.push({ pos: [x, y, -buildingSize.depth / 2 - 0.01], rotY: Math.PI, lit: !flicker });
      }
    }
    return entries;
  }, []);

  return (
    <group>
      <mesh position={[0, plinthHeight / 2, 0]}>
        <boxGeometry args={[buildingSize.width * 1.04, plinthHeight, buildingSize.depth * 1.04]} />
        <meshStandardMaterial
          color="#2c314f"
          emissive="#2c314f"
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={accentOpacity}
        />
      </mesh>

      <mesh position={[0, buildingSize.height / 2 + plinthHeight, 0]}>
        <boxGeometry args={[buildingSize.width, buildingSize.height, buildingSize.depth]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={0.42}
          roughness={0.65}
          metalness={0.08}
          transparent
          opacity={structuralOpacity}
          depthWrite={!translucent}
        />
      </mesh>

      <mesh
        position={[0, buildingSize.height + plinthHeight + buildingSize.roofHeight / 2, 0]}
      >
        <boxGeometry
          args={[buildingSize.width * 0.92, buildingSize.roofHeight, buildingSize.depth * 0.92]}
        />
        <meshStandardMaterial
          color={roofColor}
          emissive={roofColor}
          emissiveIntensity={0.5}
          roughness={0.55}
          metalness={0.2}
          transparent
          opacity={structuralOpacity}
          depthWrite={!translucent}
        />
      </mesh>

      <mesh position={[0, plinthHeight + 0.65, buildingSize.depth / 2 + 0.01]}>
        <boxGeometry args={[0.72, 1.3, 0.04]} />
        <meshStandardMaterial
          color="#20283c"
          emissive="#20283c"
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.12}
          transparent
          opacity={accentOpacity}
          depthWrite={!translucent}
        />
      </mesh>

      {windowTransforms.map((win, idx) => (
        <mesh
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          position={win.pos}
          rotation={[0, win.rotY, 0]}
        >
          <planeGeometry args={[windowSize.w, windowSize.h]} />
          <meshStandardMaterial
            color={win.lit ? windowColor : windowOffColor}
            emissive={win.lit ? windowColor : windowOffColor}
            emissiveIntensity={win.lit ? 0.75 : 0.25}
            roughness={0.2}
            metalness={0.1}
            transparent
            opacity={windowOpacity}
            depthWrite={!translucent}
          />
        </mesh>
      ))}
    </group>
  );
}

function pointInsideBuilding(p: [number, number, number], center: [number, number, number]) {
  const halfW = buildingSize.width / 2;
  const halfD = buildingSize.depth / 2;
  const minX = center[0] - halfW;
  const maxX = center[0] + halfW;
  const minZ = center[2] - halfD;
  const maxZ = center[2] + halfD;
  const maxY = buildingSize.height + plinthHeight + buildingSize.roofHeight;
  return p[0] >= minX && p[0] <= maxX && p[2] >= minZ && p[2] <= maxZ && p[1] >= 0 && p[1] <= maxY;
}
