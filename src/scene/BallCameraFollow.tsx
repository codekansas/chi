import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef } from "react";
import { usePlayerStore } from "./playerStore";

const boomDistance = 3.5;
const boomHeightBase = 1.6;
const bounceVelocity = 3.5;
const gravity = -12;
const radius = 0.15;
const minPitch = -0.9;
const maxPitch = 0.55;
const pitchSensitivity = 0.0035; // radians per pixel

export function BallCameraFollow() {
  const { camera, gl } = useThree();
  const pos = usePlayerStore((s) => s.pos_w3);
  const yaw = usePlayerStore((s) => s.yaw_rad);
  const pitch = usePlayerStore((s) => s.pitch_rad);
  const groundY = usePlayerStore((s) => s.ground_y);
  const setPitch = usePlayerStore((s) => s.setPitch);
  const draggingRef = useRef(false);
  const lastYRef = useRef(0);

  const bounceHeight = (bounceVelocity * bounceVelocity) / (-2 * gravity); // ~2.66
  const focusY = groundY + radius + bounceHeight * 0.5;

  useEffect(() => {
    const dom = gl.domElement;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      draggingRef.current = true;
      lastYRef.current = event.clientY;
      dom.setPointerCapture?.(event.pointerId);
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (event.button !== 0) return;
      draggingRef.current = false;
      dom.releasePointerCapture?.(event.pointerId);
    };
    const handlePointerLeave = () => {
      draggingRef.current = false;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;
      const deltaY = event.clientY - lastYRef.current;
      lastYRef.current = event.clientY;
      const current = usePlayerStore.getState().pitch_rad;
      const next = THREE.MathUtils.clamp(current - deltaY * pitchSensitivity, minPitch, maxPitch);
      setPitch(next);
    };
    dom.addEventListener("pointerdown", handlePointerDown);
    dom.addEventListener("pointerup", handlePointerUp);
    dom.addEventListener("pointerleave", handlePointerLeave);
    dom.addEventListener("pointermove", handlePointerMove);
    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      dom.removeEventListener("pointerup", handlePointerUp);
      dom.removeEventListener("pointerleave", handlePointerLeave);
      dom.removeEventListener("pointermove", handlePointerMove);
    };
  }, [gl.domElement, setPitch]);

  useFrame(() => {
    const target = new THREE.Vector3(pos[0], focusY, pos[2]);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const offset = new THREE.Vector3(0, boomHeightBase + bounceHeight * 0.3, -boomDistance);
    offset.applyAxisAngle(yAxis, yaw);
    const rightAxis = new THREE.Vector3(1, 0, 0).applyAxisAngle(yAxis, yaw);
    offset.applyAxisAngle(rightAxis, pitch);
    const camPos = target.clone().add(offset);
    camera.position.lerp(camPos, 0.12);
    camera.lookAt(target);
  });

  return null;
}
