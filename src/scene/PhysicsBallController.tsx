import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";
import { usePlayerStore } from "./playerStore";
import type { BoxCollider, SceneConfig } from "../data/journey";

const gravity = -12;
const moveAccel = 10;
const turnSpeed = 2.6; // rad/s
const damping = 0.985; // tuned for ~30 fps baseline
const idleHorizontalDamping = 0.9;
const restitution = 0.2; // only used for walls/ceilings
const radius = 0.15;
const bounceVelocity = 3.5; // fixed upward velocity each ground contact
const targetFrameRate = 60;
const fixedStep = 1 / targetFrameRate;
const maxAccumulated = 0.1; // avoid spiral of death on stalls
// Convert frame-based damping to time-based so feel stays the same regardless of FPS.
const baseFrameRate = 30;
const dampingPerSecond = Math.pow(damping, baseFrameRate);
const idleHorizontalDampingPerSecond = Math.pow(idleHorizontalDamping, baseFrameRate);
const dampingPerFixedStep = Math.pow(dampingPerSecond, fixedStep);
const idleHorizontalDampingPerFixedStep = Math.pow(idleHorizontalDampingPerSecond, fixedStep);

export function PhysicsBallController({ scene }: { scene: SceneConfig }) {
  const velRef = useRef(new THREE.Vector3(0, 0, 0));
  const setPos = usePlayerStore((s) => s.setPos);
  const setYaw = usePlayerStore((s) => s.setYaw);
  const setSpeed = usePlayerStore((s) => s.setSpeed);
  const groundYRef = useRef(0);
  const setGroundY = usePlayerStore((s) => s.setGroundY);
  const keys = useRef<Record<string, boolean>>({});
  const accumulatorRef = useRef(0);

  const colliders = useMemo(() => scene.colliders ?? [], [scene.colliders]);

  useMemo(() => {
    const handleDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const handleUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  useFrame((_, delta) => {
    const simPos = new THREE.Vector3(...usePlayerStore.getState().pos_w3);
    const simState = { yaw: usePlayerStore.getState().yaw_rad, pos: simPos };
    accumulatorRef.current = Math.min(accumulatorRef.current + Math.min(delta, maxAccumulated), maxAccumulated);
    while (accumulatorRef.current >= fixedStep) {
      stepPhysics(fixedStep, simState);
      accumulatorRef.current -= fixedStep;
    }
    setPos([simState.pos.x, simState.pos.y, simState.pos.z]);
    setYaw(simState.yaw);
    setSpeed(velRef.current.length());
    setGroundY(groundYRef.current);
  });

  const stepPhysics = (dt: number, simState: { yaw: number; pos: THREE.Vector3 }) => {
    const v = velRef.current;
    // Horizontal input
    const forward = (keys.current["w"] ?? false) || (keys.current["arrowup"] ?? false);
    const back = (keys.current["s"] ?? false) || (keys.current["arrowdown"] ?? false);
    const turnLeft = (keys.current["a"] ?? false) || (keys.current["arrowleft"] ?? false);
    const turnRight = (keys.current["d"] ?? false) || (keys.current["arrowright"] ?? false);
    const strafeLeft = keys.current["q"] ?? false;
    const strafeRight = keys.current["e"] ?? false;

    let yawNext = simState.yaw;
    if (turnLeft) yawNext += turnSpeed * dt;
    if (turnRight) yawNext -= turnSpeed * dt;
    simState.yaw = yawNext;

    const forwardDir = new THREE.Vector3(Math.sin(yawNext), 0, Math.cos(yawNext));
    const rightDir = new THREE.Vector3().crossVectors(forwardDir, new THREE.Vector3(0, 1, 0));
    const input = new THREE.Vector3();
    if (forward) input.add(forwardDir);
    if (back) input.sub(forwardDir);
    if (strafeRight) input.add(rightDir);
    if (strafeLeft) input.sub(rightDir);
    const hasMoveInput = input.lengthSq() > 0;
    if (hasMoveInput) {
      input.normalize().multiplyScalar(moveAccel * dt);
      v.add(input);
    } else {
      v.x *= idleHorizontalDampingPerFixedStep;
      v.z *= idleHorizontalDampingPerFixedStep;
    }

    // gravity
    v.y += gravity * dt;

    // integrate
    const nextPos = simState.pos.clone().addScaledVector(v, dt);

    // collisions and ground capture
    colliders.forEach((c) => resolveSphereAabb(nextPos, v, c, radius, groundYRef));

    // damping
    v.multiplyScalar(dampingPerFixedStep);

    simState.pos.copy(nextPos);
  };

  return null;
}

function resolveSphereAabb(
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  box: BoxCollider,
  r: number,
  groundYRef: React.MutableRefObject<number>,
) {
  const min = new THREE.Vector3(...box.min_w3);
  const max = new THREE.Vector3(...box.max_w3);
  // expand box by sphere radius
  const expandedMin = min.clone().subScalar(r);
  const expandedMax = max.clone().addScalar(r);

  // if outside expanded box, skip
  if (
    pos.x < expandedMin.x ||
    pos.x > expandedMax.x ||
    pos.y < expandedMin.y ||
    pos.y > expandedMax.y ||
    pos.z < expandedMin.z ||
    pos.z > expandedMax.z
  ) {
    return;
  }

  // compute penetration depths on each axis
  const penX = Math.min(expandedMax.x - pos.x, pos.x - expandedMin.x);
  const penY = Math.min(expandedMax.y - pos.y, pos.y - expandedMin.y);
  const penZ = Math.min(expandedMax.z - pos.z, pos.z - expandedMin.z);

  const bounce = box.bounciness ?? restitution;

  if (penX < penY && penX < penZ) {
    // resolve X
    const dir = pos.x > (min.x + max.x) / 2 ? 1 : -1;
    pos.x = dir === 1 ? expandedMax.x : expandedMin.x;
    vel.x = -vel.x * bounce;
  } else if (penY < penZ) {
    // resolve Y
    const dir = pos.y > (min.y + max.y) / 2 ? 1 : -1;
    pos.y = dir === 1 ? expandedMax.y : expandedMin.y;
    if (dir === 1) {
      // landing on top of box (ground)
      vel.y = bounceVelocity;
      groundYRef.current = max.y;
      vel.x *= 0.9;
      vel.z *= 0.9;
    } else {
      // hitting underside (ceiling)
      vel.y = -Math.abs(vel.y) * bounce;
    }
  } else {
    // resolve Z
    const dir = pos.z > (min.z + max.z) / 2 ? 1 : -1;
    pos.z = dir === 1 ? expandedMax.z : expandedMin.z;
    vel.z = -vel.z * bounce;
  }
}
