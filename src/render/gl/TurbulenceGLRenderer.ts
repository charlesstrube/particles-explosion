import { projectPoint } from "../../helpers/projectPoint";
import type { CanvasManagerSchema, TurbulenceRendererSchema, TurbulencePoint, CameraSchema } from "../../schemas";
import type { ContextGLManager } from "../../canvas/ContextGLManager";
import { ShaderManager, TurbulenceShader } from "../../shader";
import { projectPointCamera } from "../../helpers/projectPointCamera";

export class TurbulenceRenderer implements TurbulenceRendererSchema {
  private _shaderManager: ShaderManager;
  private _positionBuffer: WebGLBuffer | null = null;
  private _colorBuffer: WebGLBuffer | null = null;
  private _sizeBuffer: WebGLBuffer | null = null;
  private _directionBuffer: WebGLBuffer | null = null;
  private _radiusBuffer: WebGLBuffer | null = null;

  constructor(
    private _canvasManager: CanvasManagerSchema,
    private _contextManager: ContextGLManager,
    private _camera: CameraSchema
  ) {
    this._shaderManager = new ShaderManager(this.context);
    this.initializeBuffers();
  }

  get context(): WebGLRenderingContext {
    return this._contextManager.context;
  }

  get width(): number {
    return this._canvasManager.width;
  }

  get height(): number {
    return this._canvasManager.height;
  }

  private initializeBuffers(): void {
    this._positionBuffer = this.context.createBuffer();
    this._colorBuffer = this.context.createBuffer();
    this._sizeBuffer = this.context.createBuffer();
    this._directionBuffer = this.context.createBuffer();
    this._radiusBuffer = this.context.createBuffer();
  }

  clear(): void {
    // Ne pas effacer complètement, juste la zone des points de turbulence
    // pour éviter d'interférer avec le rendu des particules
  }

  drawTurbulencePoints(points: TurbulencePoint[]): void {
    if (points.length === 0) return;

    // Utiliser le shader de turbulence
    const turbulenceShader = this._shaderManager.useShader('turbulence') as TurbulenceShader;
    turbulenceShader.setResolution(this.width, this.height);

    // Activer le blending
    this.context.enable(this.context.BLEND);
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);

    // Préparer les données pour le rendu par batch
    const positions = new Float32Array(points.length * 2);
    const colors = new Float32Array(points.length * 3);
    const sizes = new Float32Array(points.length);
    const directions = new Float32Array(points.length * 2);
    const radii = new Float32Array(points.length);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];

      // Projeter la position du point avec projectPoint
      const { projectedX, projectedY, zFactor } = projectPointCamera(
        point.position,
        1, // Taille de base
        this._camera,
        this.width,
        this.height
      );

      // Position projetée
      positions[i * 2] = projectedX;
      positions[i * 2 + 1] = projectedY;

      // Couleur basée sur la magnitude du vecteur
      const magnitude = Math.sqrt(
        point.direction.x * point.direction.x +
        point.direction.y * point.direction.y +
        point.direction.z * point.direction.z
      );
      const normalizedMagnitude = Math.min(magnitude / 20, 1);
      colors[i * 3] = normalizedMagnitude; // Rouge
      colors[i * 3 + 1] = 0; // Vert
      colors[i * 3 + 2] = 1 - normalizedMagnitude; // Bleu

      // Taille du point avec facteur de profondeur
      const baseSize = Math.max(12, point.radius / 8); // Taille de base plus grande
      sizes[i] = baseSize * (1 + zFactor * 0.5); // Augmenter la taille avec la profondeur

      // Direction projetée en 3D
      const directionEnd = {
        x: point.position.x + point.direction.x,
        y: point.position.y + point.direction.y,
        z: point.position.z + point.direction.z
      };

      const { projectedX: dirX, projectedY: dirY } = projectPointCamera(
        directionEnd,
        1,
        this._camera,
        this.width,
        this.height
      );

      // Direction relative projetée (normalisée pour la visibilité)
      const dirDeltaX = dirX - projectedX;
      const dirDeltaY = dirY - projectedY;
      const dirLength = Math.sqrt(dirDeltaX * dirDeltaX + dirDeltaY * dirDeltaY);

      // Normaliser et appliquer un facteur d'échelle pour la visibilité
      const scaleFactor = Math.min(50, Math.max(10, magnitude / 2)); // Échelle adaptative

      // Éviter la division par zéro
      if (dirLength > 0.001) {
        directions[i * 2] = (dirDeltaX / dirLength) * scaleFactor;
        directions[i * 2 + 1] = (dirDeltaY / dirLength) * scaleFactor;
      } else {
        // Direction par défaut si la projection ne fonctionne pas
        directions[i * 2] = magnitude * 0.1; // Direction X par défaut
        directions[i * 2 + 1] = 0;
      }

      // Rayon d'influence projeté
      const radiusEnd = {
        x: point.position.x + point.radius,
        y: point.position.y,
        z: point.position.z
      };

      const { projectedX: radiusX } = projectPointCamera(
        radiusEnd,
        1,
        this._camera,
        this.width,
        this.height
      );

      // Rayon projeté avec facteur de profondeur
      radii[i] = Math.abs(radiusX - projectedX) * (1 + zFactor * 0.3);
    }

    // Configurer les attributs
    this.context.enableVertexAttribArray(turbulenceShader.getPositionLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._positionBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(turbulenceShader.getPositionLocation(), 2, this.context.FLOAT, false, 0, 0);

    this.context.enableVertexAttribArray(turbulenceShader.getColorLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._colorBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, colors, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(turbulenceShader.getColorLocation(), 3, this.context.FLOAT, false, 0, 0);

    this.context.enableVertexAttribArray(turbulenceShader.getSizeLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._sizeBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, sizes, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(turbulenceShader.getSizeLocation(), 1, this.context.FLOAT, false, 0, 0);

    this.context.enableVertexAttribArray(turbulenceShader.getDirectionLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._directionBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, directions, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(turbulenceShader.getDirectionLocation(), 2, this.context.FLOAT, false, 0, 0);

    this.context.enableVertexAttribArray(turbulenceShader.getRadiusLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._radiusBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, radii, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(turbulenceShader.getRadiusLocation(), 1, this.context.FLOAT, false, 0, 0);

    // Dessiner les points
    this.context.drawArrays(this.context.POINTS, 0, points.length);

    // Désactiver les attributs
    this.context.disableVertexAttribArray(turbulenceShader.getPositionLocation());
    this.context.disableVertexAttribArray(turbulenceShader.getColorLocation());
    this.context.disableVertexAttribArray(turbulenceShader.getSizeLocation());
    this.context.disableVertexAttribArray(turbulenceShader.getDirectionLocation());
    this.context.disableVertexAttribArray(turbulenceShader.getRadiusLocation());
  }
}