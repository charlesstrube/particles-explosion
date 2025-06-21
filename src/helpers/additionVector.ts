import type { Vector } from "../schemas";

const additionVector = (vector1: Vector, vector2: Vector): Vector => {
  return {
    x: vector1.x + vector2.x,
    y: vector1.y + vector2.y,
    z: vector1.z + vector2.z,
  };
};

export default additionVector;