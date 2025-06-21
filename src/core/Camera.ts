import type { CameraSchema, Position } from "../schemas";


export class Camera implements CameraSchema {
  constructor(
    protected _position: Position = { x: 0, y: 0, z: 1000 },
    protected _target: Position = { x: 0, y: 0, z: 0 },
    protected _fov: number = 60, // Field of view en degrés
    protected _near: number = 0.1,
    protected _far: number = 2000,
  ) { }

  rotateCamera = (
    angleX: number, // Rotation autour de l'axe X (pitch)
    angleY: number, // Rotation autour de l'axe Y (yaw)
    distance: number = 1000,
    target: Position = this._target
  ) => {
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    this.positionX = target.x + distance * cosX * sinY;
    this.positionY = target.y + distance * sinX;
    this.positionZ = target.z + distance * cosX * cosY
    this._far = distance * 3
  };

  set positionX(position: number) {
    this._position.x = position;
  }

  set positionY(position: number) {
    this._position.y = position;
  }

  set positionZ(position: number) {
    this._position.z = position;
  }

  set targetX(target: number) {
    this._target.x = target;
  }

  set targetY(target: number) {
    this._target.y = target;
  }

  set targetZ(target: number) {
    this._target.z = target;
  }

  get position(): Position {
    return this._position;
  }

  get target(): Position {
    return this._target;
  }

  get fov(): number {
    return this._fov;
  }

  get near(): number {
    return this._near;
  }

  get far(): number {
    return this._far;
  }
}