import { Box } from "@react-three/drei";
import type { SceneConfig } from "../data/journey";

export function CollidersDebug({ scene, visible = false }: { scene: SceneConfig; visible?: boolean }) {
  if (!visible || !scene.colliders) return null;
  return (
    <>
      {scene.colliders.map((c) => {
        const size: [number, number, number] = [
          c.max_w3[0] - c.min_w3[0],
          c.max_w3[1] - c.min_w3[1],
          c.max_w3[2] - c.min_w3[2],
        ];
        const center = [
          c.min_w3[0] + size[0] / 2,
          c.min_w3[1] + size[1] / 2,
          c.min_w3[2] + size[2] / 2,
        ] as [number, number, number];
        return (
          <Box key={c.id} args={size} position={center}>
            <meshBasicMaterial color="#7af" wireframe transparent opacity={0.3} />
          </Box>
        );
      })}
    </>
  );
}
