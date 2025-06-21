import getMagnitude from "../helpers/getMagnitude";
import type { CameraSchema, Position } from "../schemas";


export class Camera implements CameraSchema {
  static cameraUp = { x: 0, y: 1, z: 0 };

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

  set fov(fov: number) {
    this._fov = fov;
  }

  set near(near: number) {
    this._near = near;
  }

  set far(far: number) {
    this._far = far;
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

  projectPointCamera(
    itemPosition: Position,
    itemSize: number,
    containerWidth: number,
    containerHeight: number
  ) {
    // Calculer la direction de la caméra (z-axis)
    const cameraDir = {
      x: this.target.x - this.position.x,
      y: this.target.y - this.position.y,
      z: this.target.z - this.position.z
    };


    const cameraDirLength = getMagnitude(cameraDir);

    const cameraDirNormalized = {
      x: cameraDir.x / cameraDirLength,
      y: cameraDir.y / cameraDirLength,
      z: cameraDir.z / cameraDirLength
    };

    // Calculer les axes de la caméra
    // Y-axis de la caméra (up vector)
    const cameraUp = Camera.cameraUp;

    // X-axis de la caméra (right vector)
    const cameraRight = {
      x: cameraDirNormalized.y * cameraUp.z - cameraDirNormalized.z * cameraUp.y,
      y: cameraDirNormalized.z * cameraUp.x - cameraDirNormalized.x * cameraUp.z,
      z: cameraDirNormalized.x * cameraUp.y - cameraDirNormalized.y * cameraUp.x
    };

    // Normaliser le right vector
    const rightLength = getMagnitude(cameraRight);

    const cameraRightNormalized = {
      x: cameraRight.x / rightLength,
      y: cameraRight.y / rightLength,
      z: cameraRight.z / rightLength
    };

    // Recalculer l'up vector pour qu'il soit perpendiculaire
    const cameraUpNormalized = {
      x: cameraDirNormalized.y * cameraRightNormalized.z - cameraDirNormalized.z * cameraRightNormalized.y,
      y: cameraDirNormalized.z * cameraRightNormalized.x - cameraDirNormalized.x * cameraRightNormalized.z,
      z: cameraDirNormalized.x * cameraRightNormalized.y - cameraDirNormalized.y * cameraRightNormalized.x
    };

    // Vecteur du point à la caméra
    const pointToCamera = {
      x: itemPosition.x - this.position.x,
      y: itemPosition.y - this.position.y,
      z: itemPosition.z - this.position.z
    };

    // Distance du point à la caméra
    const distanceToCamera = getMagnitude(pointToCamera);

    // Projeter le point dans l'espace de la caméra
    const projectedX =
      pointToCamera.x * cameraRightNormalized.x +
      pointToCamera.y * cameraRightNormalized.y +
      pointToCamera.z * cameraRightNormalized.z;

    const projectedY =
      pointToCamera.x * cameraUpNormalized.x +
      pointToCamera.y * cameraUpNormalized.y +
      pointToCamera.z * cameraUpNormalized.z;

    const projectedZ =
      pointToCamera.x * cameraDirNormalized.x +
      pointToCamera.y * cameraDirNormalized.y +
      pointToCamera.z * cameraDirNormalized.z;

    // Convertir en coordonnées écran
    const fovRadians = (this.fov * Math.PI) / 180;
    const aspectRatio = containerWidth / containerHeight;

    // Projection perspective
    const scale = 1 / Math.tan(fovRadians / 2);

    // Coordonnées normalisées (-1 à 1)
    const normalizedX = (projectedX * scale) / (projectedZ * aspectRatio);
    const normalizedY = (projectedY * scale) / projectedZ;

    // Convertir en coordonnées écran
    const screenX = (normalizedX + 1) * containerWidth / 2;
    const screenY = (1 - normalizedY) * containerHeight / 2;

    // Facteur de profondeur pour la taille et l'alpha
    const zFactor = Math.max(0, (this.far - projectedZ) / (this.far - this.near));

    // Taille projetée avec facteur de profondeur
    const projectedSize = itemSize * (1 + zFactor * 0.5) * (this.far / projectedZ);

    return {
      size: projectedSize,
      projectedX: screenX,
      projectedY: screenY,
      zFactor: zFactor,
      distanceToCamera: distanceToCamera
    };
  };
}