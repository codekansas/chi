import { useEffect, useRef } from "react";
import { journey, type LineSurface, type SceneConfig } from "../data/journey";
import { useGameStore } from "../store/gameStore";

const targetFps = 60;
const fixedDt = 1 / targetFps;
const gravity = 2400; // px/s^2 downward
const moveAccel = 2400; // px/s^2 horizontal
const maxSpeed = 900; // clamp so handling stays bouncy not ballistic
const restitution = 1; // perfectly elastic for infinite bounce height
const buttonImpulse = 900;
const radius = 22;
const playerFill = "#f6c4d6";

type Vec2 = { x: number; y: number };

type Follower = {
  id: "husband" | "baby";
  color: string;
  scale: number;
  offset: number;
  pos: Vec2;
};

const followerDefs: Record<"husband" | "baby", { color: string; scale: number; offset: number }> = {
  husband: { color: "#4a8fe2", scale: 1, offset: 80 },
  baby: { color: "#64c09c", scale: 0.74, offset: 140 },
};

export function GameSketch() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeSceneId = useGameStore((s) => s.activeSceneId);
  const setFlag = useGameStore((s) => s.setFlag);
  const scene = journey.find((s) => s.id === activeSceneId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scene) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let lastTime = performance.now();
    let accumulator = 0;

    const pos: Vec2 = { x: scene.start_w2[0], y: scene.start_w2[1] };
    const vel: Vec2 = { x: 0, y: 0 };
    const surfaces = buildSurfaces(scene);

    const followers: Follower[] = (scene.followers ?? []).map((id) => {
      const def = followerDefs[id];
      return {
        id,
        color: def.color,
        scale: def.scale,
        offset: def.offset,
        pos: { x: scene.start_w2[0] - def.offset, y: scene.floorY - radius },
      };
    });

    const keys: Record<string, boolean> = {};
    const handleDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };
    const handleUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);

    const step = (dt: number) => {
      const flags = useGameStore.getState().flags;
      const prevPos = { x: pos.x, y: pos.y };
      const left = keys["a"] || keys["arrowleft"];
      const right = keys["d"] || keys["arrowright"];

      // Horizontal input.
      if (left) vel.x -= moveAccel * dt;
      if (right) vel.x += moveAccel * dt;
      vel.x = Math.max(-maxSpeed, Math.min(maxSpeed, vel.x));

      // Gravity.
      vel.y += gravity * dt;

      // Integrate.
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;

      let buttonBounce = false;
      scene.boxes.forEach((box) => {
        if (buttonBounceHit(prevPos, pos, radius, box)) {
          buttonBounce = true;
          if (!flags[box.flag]) setFlag(box.flag);
        }
      });

      surfaces.forEach((surf) => {
        resolveCircleSurface(pos, vel, radius, surf);
      });

      // Clamp overall speed so reflections don't explode.
      const speed = Math.hypot(vel.x, vel.y);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vel.x *= scale;
        vel.y *= scale;
      }

      if (buttonBounce) {
        const bounceSpeed = Math.min(maxSpeed, Math.max(buttonImpulse, Math.abs(vel.y)));
        vel.y = -bounceSpeed;
      }

      // Challenges (portal strips).
      (scene.challenges ?? []).forEach((gate) => {
        if (flags[gate.flag]) return;
        const okRequires = (gate.requires ?? []).every((f) => flags[f]);
        if (!okRequires) return;
        const crossing = pos.x >= gate.gateX - radius && pos.x <= gate.gateX + 16 && pos.y <= gate.gateHeight + radius;
        if (crossing) setFlag(gate.flag);
      });

      // Followers ease toward the player with delay offsets.
      followers.forEach((f, idx) => {
        const targetX = pos.x - f.offset - idx * 24;
        const targetY = scene.floorY - radius * f.scale;
        f.pos.x += (targetX - f.pos.x) * 0.12;
        f.pos.y += (targetY - f.pos.y) * 0.18;
      });
    };

    const draw = () => {
      const flags = useGameStore.getState().flags;
      const width = canvas.width;
      const height = canvas.height;
      const scale = Math.min(width / scene.bounds.width, height / scene.bounds.height);
      const strokeW = 4 * scale;
      ctx.save();
      ctx.scale(scale, scale);

      ctx.fillStyle = scene.palette.paper;
      ctx.fillRect(0, 0, scene.bounds.width, scene.bounds.height);

      // Minimal floor line.
      ctx.strokeStyle = scene.palette.ink;
      ctx.lineWidth = strokeW;
      ctx.beginPath();
      ctx.moveTo(0, scene.floorY);
      ctx.lineTo(scene.bounds.width, scene.floorY);
      ctx.stroke();

      // Platforms (stroke rectangles for readability; collisions use segment surfaces).
      scene.platforms.forEach((p) => drawPlatform(ctx, p, scene.palette.ink, strokeW));

      // Challenges.
      (scene.challenges ?? []).forEach((gate) => drawGate(ctx, gate, scene.palette.ink, strokeW, flags[gate.flag]));

      // Boxes.
      scene.boxes.forEach((box) => drawBox(ctx, box, flags[box.flag], scene.palette.ink, strokeW));

      // Player + followers.
      followers.slice().reverse().forEach((f) => drawBall(ctx, f.pos, radius * f.scale, f.color, scene.palette.ink, strokeW));
      drawBall(ctx, pos, radius, playerFill, scene.palette.ink, strokeW * 1.05);

      // Current scene label.
      ctx.fillStyle = scene.palette.ink;
      ctx.font = `700 ${22}px "DM Sans", "Inter", system-ui`;
      ctx.fillText(scene.title, 18, 32);

      ctx.restore();
    };

    const loop = (now: number) => {
      const dtMs = now - lastTime;
      lastTime = now;
      accumulator = Math.min(accumulator + dtMs / 1000, 0.25);
      while (accumulator >= fixedDt) {
        step(fixedDt);
        accumulator -= fixedDt;
      }
      draw();
      rafId = requestAnimationFrame(loop);
    };

    let rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [scene, setFlag]);

  if (!scene) return null;

  return <canvas className="sketch-canvas" ref={canvasRef} />;
}

function resolveCircleSurface(pos: Vec2, vel: Vec2, r: number, surf: LineSurface) {
  const cp = closestPointOnSegment(pos, surf);
  const dx = pos.x - cp.x;
  const dy = pos.y - cp.y;
  const distSq = dx * dx + dy * dy;
  if (distSq >= r * r) return false;
  const dist = Math.sqrt(Math.max(distSq, 1e-9));
  const nx = dist === 0 ? normalFromSegment(surf).x : dx / dist;
  const ny = dist === 0 ? normalFromSegment(surf).y : dy / dist;
  const penetration = r - dist;
  pos.x += nx * penetration;
  pos.y += ny * penetration;

  const vn = vel.x * nx + vel.y * ny;
  if (vn < 0) {
    vel.x -= (1 + restitution) * vn * nx;
    vel.y -= (1 + restitution) * vn * ny;
  }
  return true;
}

function closestPointOnSegment(p: Vec2, seg: LineSurface) {
  const ax = seg.p1[0];
  const ay = seg.p1[1];
  const bx = seg.p2[0];
  const by = seg.p2[1];
  const abx = bx - ax;
  const aby = by - ay;
  const apx = p.x - ax;
  const apy = p.y - ay;
  const abLenSq = abx * abx + aby * aby || 1e-9;
  const t = clamp((apx * abx + apy * aby) / abLenSq, 0, 1);
  return { x: ax + abx * t, y: ay + aby * t };
}

function normalFromSegment(seg: LineSurface) {
  const dx = seg.p2[0] - seg.p1[0];
  const dy = seg.p2[1] - seg.p1[1];
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len }; // left-hand normal
}

function buildSurfaces(scene: SceneConfig): LineSurface[] {
  const surfaces: LineSurface[] = [];

  // Scene bounds.
  surfaces.push({ id: "bound-top", p1: [0, 0], p2: [scene.bounds.width, 0] });
  surfaces.push({ id: "bound-bottom", p1: [0, scene.bounds.height], p2: [scene.bounds.width, scene.bounds.height] });
  surfaces.push({ id: "bound-left", p1: [0, 0], p2: [0, scene.bounds.height] });
  surfaces.push({ id: "bound-right", p1: [scene.bounds.width, 0], p2: [scene.bounds.width, scene.bounds.height] });

  // Explicit custom surfaces, if provided.
  (scene.surfaces ?? []).forEach((s) => surfaces.push(s));

  // Derive segment surfaces from axis-aligned platforms: top + sides for wall bounces.
  scene.platforms.forEach((p) => {
    const { x, y, width, height } = p;
    surfaces.push({ id: `${p.id}-top`, p1: [x, y], p2: [x + width, y] });
    surfaces.push({ id: `${p.id}-left`, p1: [x, y], p2: [x, y + height] });
    surfaces.push({ id: `${p.id}-right`, p1: [x + width, y], p2: [x + width, y + height] });
  });

  return surfaces;
}

function drawPlatform(ctx: CanvasRenderingContext2D, p: SceneConfig["platforms"][number], ink: string, strokeW: number) {
  ctx.strokeStyle = ink;
  ctx.lineWidth = strokeW;
  ctx.beginPath();
  if (p.id === "ground") {
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.width, p.y);
  } else {
    ctx.rect(p.x, p.y, p.width, p.height);
  }
  ctx.stroke();
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  box: SceneConfig["boxes"][number],
  completed: boolean,
  ink: string,
  strokeW: number,
) {
  const size = box.size ?? 54;
  const half = size / 2;
  ctx.lineWidth = strokeW;
  ctx.strokeStyle = ink;
  ctx.fillStyle = completed ? "rgba(0,0,0,0)" : box.color ?? ink;
  ctx.beginPath();
  ctx.rect(box.pos_w2[0] - half, box.pos_w2[1] - half, size, size);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.font = `700 ${14}px "DM Sans", "Inter", system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(box.label, box.pos_w2[0], box.pos_w2[1] - size * 0.75);
  if (box.prompt && !completed) {
    ctx.font = `500 ${12}px "DM Sans", "Inter", system-ui`;
    ctx.fillText(box.prompt, box.pos_w2[0], box.pos_w2[1] + size * 0.9);
  }
}

function drawGate(
  ctx: CanvasRenderingContext2D,
  gate: NonNullable<SceneConfig["challenges"]>[number],
  ink: string,
  strokeW: number,
  done: boolean,
) {
  const x = gate.gateX;
  const top = gate.gateHeight;
  const bottom = top + 420;
  ctx.save();
  ctx.lineWidth = strokeW;
  ctx.strokeStyle = done ? gate.color ?? ink : ink;
  ctx.fillStyle = done ? "rgba(0,0,0,0)" : `${gate.color ?? ink}22`;
  ctx.beginPath();
  ctx.rect(x - 8, top, 16, bottom - top);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(x, top - 10);
  ctx.lineTo(x, top + 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = ink;
  ctx.font = `700 ${14}px "DM Sans", "Inter", system-ui`;
  ctx.textAlign = "center";
  ctx.fillText(gate.label, x, top - 18);
  ctx.restore();
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  pos: Vec2,
  r: number,
  fill: string,
  ink: string,
  strokeW: number,
) {
  ctx.lineWidth = strokeW * 1.05;
  ctx.strokeStyle = ink;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function buttonBounceHit(prevPos: Vec2, pos: Vec2, r: number, box: SceneConfig["boxes"][number]) {
  const size = box.size ?? 54;
  const half = size / 2;
  const left = box.pos_w2[0] - half;
  const right = box.pos_w2[0] + half;
  const top = box.pos_w2[1] - half;

  const wasAbove = prevPos.y + r <= top;
  const nowTouching = pos.y + r >= top;
  const withinX = pos.x >= left - r && pos.x <= right + r;
  if (wasAbove && nowTouching && withinX) {
    pos.y = top - r;
    return true;
  }
  return false;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
