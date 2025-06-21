import type { Position } from "../schemas";

export const projectPoint = (
  position: Position,
  size: number,
  perspective: number,
  containerWidth: number,
  containerHeight: number
) => {
  const scale = perspective / (perspective + position.z);

  const projectedX = (position.x - containerWidth / 2) * scale + containerWidth / 2;
  const projectedY = (position.y - containerHeight / 2) * scale + containerHeight / 2;

  const zFactor = Math.max(0, -position.z / perspective);

  return {
    size: size * (1 + zFactor * 0.2) * scale,
    projectedX,
    projectedY,
    zFactor
  };
}