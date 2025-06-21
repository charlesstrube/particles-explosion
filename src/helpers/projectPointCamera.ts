
import type { CameraSchema, Position } from "../schemas";


export const projectPointCamera = (
  itemPosition: Position,
  itemSize: number,
  camera: CameraSchema,
  containerWidth: number,
  containerHeight: number
) => {
  // Calculer la direction de la caméra (z-axis)
  const cameraDir = {
    x: camera.target.x - camera.position.x,
    y: camera.target.y - camera.position.y,
    z: camera.target.z - camera.position.z
  };

  // Normaliser la direction de la caméra
  const cameraDirLength = Math.sqrt(
    cameraDir.x * cameraDir.x +
    cameraDir.y * cameraDir.y +
    cameraDir.z * cameraDir.z
  );

  const cameraDirNormalized = {
    x: cameraDir.x / cameraDirLength,
    y: cameraDir.y / cameraDirLength,
    z: cameraDir.z / cameraDirLength
  };

  // Calculer les axes de la caméra
  // Y-axis de la caméra (up vector)
  const cameraUp = { x: 0, y: 1, z: 0 };

  // X-axis de la caméra (right vector)
  const cameraRight = {
    x: cameraDirNormalized.y * cameraUp.z - cameraDirNormalized.z * cameraUp.y,
    y: cameraDirNormalized.z * cameraUp.x - cameraDirNormalized.x * cameraUp.z,
    z: cameraDirNormalized.x * cameraUp.y - cameraDirNormalized.y * cameraUp.x
  };

  // Normaliser le right vector
  const rightLength = Math.sqrt(
    cameraRight.x * cameraRight.x +
    cameraRight.y * cameraRight.y +
    cameraRight.z * cameraRight.z
  );

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
    x: itemPosition.x - camera.position.x,
    y: itemPosition.y - camera.position.y,
    z: itemPosition.z - camera.position.z
  };

  // Distance du point à la caméra
  const distanceToCamera = Math.sqrt(
    pointToCamera.x * pointToCamera.x +
    pointToCamera.y * pointToCamera.y +
    pointToCamera.z * pointToCamera.z
  );

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
  const fovRadians = (camera.fov * Math.PI) / 180;
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
  const zFactor = Math.max(0, (camera.far - projectedZ) / (camera.far - camera.near));

  // Taille projetée avec facteur de profondeur
  const projectedSize = itemSize * (1 + zFactor * 0.5) * (camera.far / projectedZ);

  return {
    size: projectedSize,
    projectedX: screenX,
    projectedY: screenY,
    zFactor: zFactor,
    distanceToCamera: distanceToCamera
  };
};
