import { ContextGLManager } from "../../canvas/ContextGLManager";
import { projectPoint } from "../../helpers/projectPoint";
import { CircleShader, ShaderManager } from "../../shader";
import type { CanvasManagerSchema, ParticleRendererSchema, ParticleSchema } from "../../schemas";

export class ParticleGLRenderer implements ParticleRendererSchema {
  private _shaderManager: ShaderManager;
  private _positionBuffer: WebGLBuffer | null = null;
  private _colorBuffer: WebGLBuffer | null = null;
  private _sizeBuffer: WebGLBuffer | null = null;
  private _alphaBuffer: WebGLBuffer | null = null;

  // Buffers for batch rendering
  private _batchPositions: Float32Array = new Float32Array(0);
  private _batchColors: Float32Array = new Float32Array(0);
  private _batchSizes: Float32Array = new Float32Array(0);
  private _batchAlphas: Float32Array = new Float32Array(0);
  private _maxBatchSize: number = 1000;

  constructor(
    private _canvasManager: CanvasManagerSchema,
    private _contextManager: ContextGLManager,
    private _perspective: number
  ) {
    this._shaderManager = new ShaderManager(this.context);
    this.initializeBuffers();
    this.initializeBatchBuffers();
  }

  private initializeBuffers(): void {
    this._positionBuffer = this.context.createBuffer();
    this._colorBuffer = this.context.createBuffer();
    this._sizeBuffer = this.context.createBuffer();
    this._alphaBuffer = this.context.createBuffer();
  }

  private initializeBatchBuffers(): void {
    this._batchPositions = new Float32Array(this._maxBatchSize * 2);  // x, y for each particle
    this._batchColors = new Float32Array(this._maxBatchSize * 3);     // r, g, b for each particle
    this._batchSizes = new Float32Array(this._maxBatchSize);          // size for each particle
    this._batchAlphas = new Float32Array(this._maxBatchSize);         // alpha for each particle
  }

  set perspective(perspective: number) {
    this._perspective = perspective;
  }

  get perspective() {
    return this._perspective;
  }

  private get width() {
    return this._canvasManager.width
  }

  private get height() {
    return this._canvasManager.height
  }

  private get context() {
    return this._contextManager.context
  }

  projectParticle(particle: ParticleSchema) {
    return projectPoint(
      particle.position,
      particle.size,
      this._perspective,
      this.width,
      this.height
    );
  }

  drawParticle(particle: ParticleSchema) {
    // This method is now used for individual rendering
    // but batch rendering is preferred
    const { projectedX, projectedY, size } = this.projectParticle(particle);

    // Use the circle shader
    const circleShader = this._shaderManager.useShader('circle') as CircleShader;

    // Set resolution
    circleShader.setResolution(this.width, this.height);

    // Prepare data for a single point
    const positions = new Float32Array([projectedX, projectedY]);
    const colors = new Float32Array([
      particle.color.r / 255,
      particle.color.g / 255,
      particle.color.b / 255
    ]);
    const sizes = new Float32Array([size]);
    const alphas = new Float32Array([particle.alpha]);

    // Configure attributes
    this.context.enableVertexAttribArray(circleShader.getPositionLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._positionBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getPositionLocation(),
      2,
      this.context.FLOAT,
      false,
      0,
      0
    );

    this.context.enableVertexAttribArray(circleShader.getColorLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._colorBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, colors, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getColorLocation(),
      3,
      this.context.FLOAT,
      false,
      0,
      0
    );

    this.context.enableVertexAttribArray(circleShader.getSizeLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._sizeBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, sizes, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getSizeLocation(),
      1,
      this.context.FLOAT,
      false,
      0,
      0
    );

    this.context.enableVertexAttribArray(circleShader.getAlphaLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._alphaBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, alphas, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getAlphaLocation(),
      1,
      this.context.FLOAT,
      false,
      0,
      0
    );

    // Enable blending for transparency
    this.context.enable(this.context.BLEND);
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);

    // Draw the point
    this.context.drawArrays(this.context.POINTS, 0, 1);

    // Disable attributes
    this.context.disableVertexAttribArray(circleShader.getPositionLocation());
    this.context.disableVertexAttribArray(circleShader.getColorLocation());
    this.context.disableVertexAttribArray(circleShader.getSizeLocation());
    this.context.disableVertexAttribArray(circleShader.getAlphaLocation());
  }

  // New method for batch rendering
  drawParticlesBatch(particles: ParticleSchema[]): void {
    if (particles.length === 0) return;

    const circleShader = this._shaderManager.useShader('circle') as CircleShader;
    circleShader.setResolution(this.width, this.height);

    // Enable blending once
    this.context.enable(this.context.BLEND);
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);

    // Process particles in batches
    for (let i = 0; i < particles.length; i += this._maxBatchSize) {
      const batchEnd = Math.min(i + this._maxBatchSize, particles.length);
      const batchSize = batchEnd - i;

      // Fill batch buffers
      for (let j = 0; j < batchSize; j++) {
        const particle = particles[i + j];
        const { projectedX, projectedY, size } = this.projectParticle(particle);

        const idx = j * 2;
        this._batchPositions[idx] = projectedX;
        this._batchPositions[idx + 1] = projectedY;

        const colorIdx = j * 3;
        this._batchColors[colorIdx] = particle.color.r / 255;
        this._batchColors[colorIdx + 1] = particle.color.g / 255;
        this._batchColors[colorIdx + 2] = particle.color.b / 255;

        this._batchSizes[j] = size;
        this._batchAlphas[j] = particle.alpha;
      }

      // Configure attributes for the batch
      this.context.enableVertexAttribArray(circleShader.getPositionLocation());
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this._positionBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, this._batchPositions.subarray(0, batchSize * 2), this.context.STATIC_DRAW);
      this.context.vertexAttribPointer(circleShader.getPositionLocation(), 2, this.context.FLOAT, false, 0, 0);

      this.context.enableVertexAttribArray(circleShader.getColorLocation());
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this._colorBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, this._batchColors.subarray(0, batchSize * 3), this.context.STATIC_DRAW);
      this.context.vertexAttribPointer(circleShader.getColorLocation(), 3, this.context.FLOAT, false, 0, 0);

      this.context.enableVertexAttribArray(circleShader.getSizeLocation());
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this._sizeBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, this._batchSizes.subarray(0, batchSize), this.context.STATIC_DRAW);
      this.context.vertexAttribPointer(circleShader.getSizeLocation(), 1, this.context.FLOAT, false, 0, 0);

      this.context.enableVertexAttribArray(circleShader.getAlphaLocation());
      this.context.bindBuffer(this.context.ARRAY_BUFFER, this._alphaBuffer);
      this.context.bufferData(this.context.ARRAY_BUFFER, this._batchAlphas.subarray(0, batchSize), this.context.STATIC_DRAW);
      this.context.vertexAttribPointer(circleShader.getAlphaLocation(), 1, this.context.FLOAT, false, 0, 0);

      // Draw the batch
      this.context.drawArrays(this.context.POINTS, 0, batchSize);
    }

    // Disable attributes
    this.context.disableVertexAttribArray(circleShader.getPositionLocation());
    this.context.disableVertexAttribArray(circleShader.getColorLocation());
    this.context.disableVertexAttribArray(circleShader.getSizeLocation());
    this.context.disableVertexAttribArray(circleShader.getAlphaLocation());
  }

  clear() {
    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clear(this.context.COLOR_BUFFER_BIT);
  }

  cleanup(): void {
    this._shaderManager.cleanup();
    if (this._positionBuffer) {
      this.context.deleteBuffer(this._positionBuffer);
    }
    if (this._colorBuffer) {
      this.context.deleteBuffer(this._colorBuffer);
    }
    if (this._sizeBuffer) {
      this.context.deleteBuffer(this._sizeBuffer);
    }
    if (this._alphaBuffer) {
      this.context.deleteBuffer(this._alphaBuffer);
    }
  }
} 