import { useMemo } from "react";
import { Sprite, SpriteMaterial, Texture, CanvasTexture, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import type { SceneConfig, SpriteBillboard } from "../data/journey";

const tempVec3 = new Vector3();

function makeTexture(label: string, emoji?: string, color?: string): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, color ?? "#7cc4ff");
  gradient.addColorStop(1, "#f7c5e8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft vignette for smoother edges.
  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    30,
    canvas.width / 2,
    canvas.height / 2,
    180,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.32)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.shadowColor = "rgba(12, 18, 32, 0.4)";
  ctx.shadowBlur = 18;
  ctx.font = "bold 80px 'Segoe UI', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji ?? "⭐", canvas.width / 2, canvas.height / 2 - 30);
  ctx.font = "bold 32px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 60);
  const tex = new CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function SpriteBillboardMesh({ config }: { config: SpriteBillboard }) {
  const material = useMemo(() => new SpriteMaterial({ map: makeTexture(config.label, config.emoji, config.color) }), [config]);
  const sprite = useMemo(() => new Sprite(material), [material]);
  const basePos_w3 = useMemo(() => new Vector3(...config.pos_w3), [config.pos_w3]);
  const bobAmp = config.bobAmp ?? 0.25;
  const bobFreq = config.bobFreq ?? 1.2;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    tempVec3.copy(basePos_w3);
    tempVec3.y += Math.sin(t * bobFreq) * bobAmp;
    sprite.position.copy(tempVec3);
    if (config.spin) {
      sprite.material.rotation = t * 0.6;
    }
  });

  return <primitive object={sprite} />;
}

export function SceneSprites({ scene }: { scene: SceneConfig }) {
  if (!scene.sprites) return null;
  return (
    <>
      {scene.sprites.map((sp) => (
        <SpriteBillboardMesh key={sp.id} config={sp} />
      ))}
    </>
  );
}
