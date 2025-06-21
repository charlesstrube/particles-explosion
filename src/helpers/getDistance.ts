import type { Position } from "../schemas";

export const getDistance = (position1: Position, position2: Position): number => {
  const dx = position1.x - position2.x;
  const dy = position1.y - position2.y;
  const dz = position1.z - position2.z;

  return Math.sqrt(
    Math.pow(dx, 2) +
    Math.pow(dy, 2) +
    Math.pow(dz, 2)
  );
};